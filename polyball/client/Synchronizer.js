/**
 * Created by kdban on 3/18/2016.
 */

var Logger = require('polyball/shared/Logger');
var CommsEvents = require('polyball/shared/CommsEvents');
var _ = require('lodash');

/**
 *
 * @param {Object} config
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

        if (snapshot.arena && !model.hasArena(snapshot.arena.id)) {
            Logger.info('Synchronizer constructing new arena');
            model.addOrResetArena(snapshot.arena);
        }

        if (snapshot.balls) {
            Logger.debug('synchronizing balls');

            // clear out old balls
            var ballsToDelete = model.getBalls(function (ball) {
                var foundInSnapshot = _.find(snapshot.balls, function (snapshotBall) {
                    return snapshotBall.id === ball.id;
                });

                return foundInSnapshot == null;
            });

            ballsToDelete.forEach(function (ball) {
                model.deleteBall(ball.id);
            });

            // add new balls
            snapshot.balls.forEach(function (snapshotBall) {
                if (!model.hasBall(snapshotBall.id)) {
                    model.addBall(snapshotBall);
                }
            });

            // synchronize existing balllllllllls
            snapshot.balls.forEach(function (snapshotBall) {
                var ball = model.getBall(snapshotBall.id);

                ball.lastTouchedID = snapshotBall.lastTouchedID;

                ball.body.state.pos.x = snapshotBall.body.state.pos.x;
                ball.body.state.pos.y = snapshotBall.body.state.pos.y;

                ball.body.state.vel.x = snapshotBall.body.state.vel.x;
                ball.body.state.vel.y = snapshotBall.body.state.vel.y;

                ball.body.state.acc.x = snapshotBall.body.state.acc.x;
                ball.body.state.acc.y = snapshotBall.body.state.acc.y;

                ball.body.state.angular.pos = snapshotBall.body.state.angular.pos;
                ball.body.state.angular.vel = snapshotBall.body.state.angular.vel;
                ball.body.state.angular.acc = snapshotBall.body.state.angular.acc;

                ball.body.state.old.pos.x = snapshotBall.body.state.old.pos.x;
                ball.body.state.old.pos.y = snapshotBall.body.state.old.pos.y;

                ball.body.state.old.vel.x = snapshotBall.body.state.old.vel.x;
                ball.body.state.old.vel.y = snapshotBall.body.state.old.vel.y;

                ball.body.state.old.acc.x = snapshotBall.body.state.old.acc.x;
                ball.body.state.old.acc.y = snapshotBall.body.state.old.acc.y;

                ball.body.state.old.angular.pos = snapshotBall.body.state.old.angular.pos;
                ball.body.state.old.angular.vel = snapshotBall.body.state.old.angular.vel;
                ball.body.state.old.angular.acc = snapshotBall.body.state.old.angular.acc;
            });
        }
    };


    var startNewRound = function (newRoundData) {
        if (newRoundData == null || newRoundData.snapshot == null || newRoundData.delay < 0) {
            Logger.error('Synchronizer#startNewRound called with illegal new round data');
            return;
        }

        //TODO: HUD.roundCountdown(newRoundData.delay);
    };


    //
    //             EVENT SUBSCRIPTION
    //
    ///////////////////////////////////////////////////////////////////////////

    comms.on(CommsEvents.ClientToClient.newLocalID, function (id) { model.setLocalClientID(id); });

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
     * Use received snapshots and current time to mutate the model towards server authority.
     * @param {Number} tickTime - The current time in millis.
     */
    this.tick = function (tickTime) {
        model.setCurrentRoundTime(tickTime);
    };
};


module.exports = Synchronizer;