/**
 * Created by kdban on 3/18/2016.
 */

var Logger = require('polyball/shared/Logger');
var CommsEvents = require('polyball/shared/CommsEvents');

var PassthroughSynchronizer = require('polyball/client/synchronizer/PassthroughSynchronizer');
var SimulationSynchronizer = require('polyball/client/synchronizer/SimulationSynchronizer');
var Reconciler = require('polyball/client/synchronizer/Reconciler');
var Interpolator = require('polyball/client/synchronizer/Interpolator');

/**
 *
 * @param {Object} config
 * @property {Number} commandAggregationInterval - The *minimum* time to wait between sending command aggregates.
 * @property {Comms} comms - The client communications module to send and receive from.
 * @property {Model} model - The model to synchronize from incoming comms events.
 * @constructor
 */
var Synchronizer = function (config) {

    //
    //    ########  ########  #### ##     ##    ###    ######## ########
    //    ##     ## ##     ##  ##  ##     ##   ## ##      ##    ##
    //    ##     ## ##     ##  ##  ##     ##  ##   ##     ##    ##
    //    ########  ########   ##  ##     ## ##     ##    ##    ######
    //    ##        ##   ##    ##   ##   ##  #########    ##    ##
    //    ##        ##    ##   ##    ## ##   ##     ##    ##    ##
    //    ##        ##     ## ####    ###    ##     ##    ##    ########
    //
    ///////////////////////////////////////////////////////////////////////////

    //
    //             PRIVATE STATE
    //
    ///////////////////////////////////////////////////////////////////////////

    var comms = config.comms;
    var model = config.model;

    var reconciler = new Reconciler({
        model: model
    });
    var aggregationInterval = config.commandAggregationInterval;
    var lastAggregationSendTime = 0;

    var interpolator = new Interpolator({
        model: model
    });
    
    var simulationSync = new SimulationSynchronizer({
        largeDelta: 100,
        rapidDecayRate: 0.7,
        slowDecayRate: 0.15
    });

    var roundStartTime = null;  // TODO: roundStartTime will be managed by round engine
    
    //
    //             INTERNAL METHODS
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * @param {Object}      snapshot - The server authoritative game state snapshot.
     * @property {Object}   snapshot.arena           - An Arena config.  See Arena constructor.
     * @property {Object[]} snapshot.players         - An Array of Player configs.  See Player constructor.
     * @property {Object[]} snapshot.spectators      - An Array of Spectator configs.  See Spectator constructor.
     * @property {Object[]} snapshot.balls           - An Array of Ball configs.  See Ball constructor.
     * @property {Object[]} snapshot.powerups        - An Array of Powerup configs.  See Powerup constructor.
     * @property {Number[]} snapshot.playerQueue     - An Array of Spectator IDs.
     * @property {Object}   snapshot.powerupElection - A PowerupElection config.  See PowerupElection constructor.
     */
    var synchronizeSnapshot = function (snapshot) {
        if (snapshot == null) {
            Logger.warn('Synchronizer#synchronizeSnapshot called with null snapshot.');
            return;
        }

        if (roundStartTime == null) {
            Logger.info('Connection as spectator for in-progress round detected.  Estimating current round time.');

            roundStartTime = Date.now() - snapshot.currentRoundTime;
        }
        
        PassthroughSynchronizer.sync(snapshot, model);
        
        reconciler.reconcileServerPlayerState(snapshot.players);

        // NOTE: because only time *deltas* are used within, it should not matter whether or not this is round time or Date.now()
        interpolator.addPastServerState(Date.now(), snapshot.players);
        interpolator.interpolateState(model);  //TODO: this should happen in sync.tick

        simulationSync.setAuthoritativeSnapshot(snapshot);
        simulationSync.tick(model); // TODO: this should happen in sync.tick
        
    };


    var startNewRound = function (newRoundData) {
        if (newRoundData == null || newRoundData.snapshot == null || newRoundData.delay < 0) {
            Logger.error('Synchronizer#startNewRound called with illegal new round data');
            return;
        }

        model.reset();
        model.roundTimingContainer.setCurrentRoundTime(0);

        roundStartTime = Date.now();

        //TODO: HUD.roundCountdown(newRoundData.delay);
    };


    //
    //             EVENT SUBSCRIPTION
    //
    ///////////////////////////////////////////////////////////////////////////

    comms.on(CommsEvents.ClientToClient.snapshotReceived, synchronizeSnapshot);

    comms.on(CommsEvents.ClientToClient.newRound, startNewRound);
    
    
    //
    //    ########  ##     ## ########  ##       ####  ######
    //    ##     ## ##     ## ##     ## ##        ##  ##    ##
    //    ##     ## ##     ## ##     ## ##        ##  ##
    //    ########  ##     ## ########  ##        ##  ##
    //    ##        ##     ## ##     ## ##        ##  ##
    //    ##        ##     ## ##     ## ##        ##  ##    ##
    //    ##         #######  ########  ######## ####  ######
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Aggregate the mouse move for send to server and mutate the model
     * @param delta
     */
    this.registerMouseMove = function (delta) {
        reconciler.registerMouseMove(delta);
    };

    /**
     * Use received snapshots and current time to mutate the model towards server authority.
     * @param {Number} tickTime - The current time in millis.
     */
    this.tick = function (tickTime) {
        model.roundTimingContainer.setCurrentRoundTime(tickTime - roundStartTime);

        var isPlayer = model.playersContainer.getPlayer(model.getLocalClientID()) != null;

        if (isPlayer && tickTime - lastAggregationSendTime > aggregationInterval) {
            lastAggregationSendTime = Date.now();
            
            var unsentCommands = reconciler.getAndClearUnsentCommands();
            if (unsentCommands.length > 0) {
                comms.sendCommandAggregate(unsentCommands);
            }
        }
    };
};


module.exports = Synchronizer;