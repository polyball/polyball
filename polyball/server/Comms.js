/**
 * Created by kdbanman on 2/29/16.
 */

var Logger = require('polyball/shared/Logger');
var Server = require('socket.io');
var Util = require('polyball/shared/Util');
var CommsEvents = require('polyball/shared/CommsEvents');
var PubSub = require('polyball/shared/PubSub');


/**
 *
 * @param {{
 *   httpServer: node.http.Server,
 *   model: Model,
 *   globalConfig: Object
 * }} config
 * @constructor
 */
// SRS Requirement - 3.2.1.6 Bidirectional, Real-Time Client Communication
// This class handles bidirectional communication between server and client
var Comms = function (config) {

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
    //             INITIALIZATION
    //
    ///////////////////////////////////////////////////////////////////////////




    //
    //             PRIVATE STATE
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * For server side event subscribers, like the Engine.
     * @type {PubSub}
     */
    var pubsub = new PubSub({
        events: CommsEvents.ServerToServer
    });

    var io = new Server(config.httpServer, {serveClient: false});
    /**
     * @type {Model}
     */
    var model = config.model;

    var globalConfig = config.globalConfig;


    //
    //             CLIENT CONNECTION
    //
    ///////////////////////////////////////////////////////////////////////////

    // SRS Requirement - 3.2.1.7 Client Identification
    // This function handles identifying clients uniquely as they connect
    io.on(CommsEvents.ClientToServer.connection, function (clientSocket) {
        Logger.info('New client connected.');

        // Add the client as a spectator and send the new client its ID.
        // NOTE: Do NOT store spectator or IDs for later use - model or engine could
        //       change it or remove it at any time.  Query for IDs when necessary.
        var newSpectator = model.addSpectator({
            clientConfig: {
                name: Util.randomUsername(),
                socket: clientSocket
            }
        });
        clientSocket.emit(CommsEvents.ServerToClient.idAssigned, newSpectator.id);
        clientSocket.emit(CommsEvents.ServerToClient.setLogLevel, Logger.getLevel());
        
        
        //
        //             CLIENT EVENTS
        //
        ///////////////////////////////////////////////////////////////////////////

        clientSocket.on(CommsEvents.ClientToServer.configRequest, function (callback) {
            Logger.info('Configuration request from client ' + getPlayerOrSpectatorID(clientSocket) + '.');

            callback(globalConfig);
        });
        // SRS Requirement - 3.2.2.13 Player Disconnect
        clientSocket.on(CommsEvents.ClientToServer.disconnect, function () {
            Logger.info('Client disconnected');

            var clientID = getPlayerOrSpectatorID(clientSocket);
            model.deleteSpectator(clientID);
            model.deletePlayer(clientID);

            pubsub.fireEvent(CommsEvents.ServerToServer.clientDisconnected, {clientID: clientID});
        });

        clientSocket.on(CommsEvents.ClientToServer.requestName, function (name) {
            var clientID = getPlayerOrSpectatorID(clientSocket);
            var user = model.getPlayer(clientID);
            user = user || model.getSpectator(clientID);

            if (name && typeof name === 'string' && name.length <= 20) {
                user.client.name = name;
            }
        });

        // SRS Requirement - 3.2.1.13 Player Queue
        // This function receives requests from clients who wish to add themselves to the player queue
        clientSocket.on(CommsEvents.ClientToServer.queueToPlay, function () {
            var spectatorID = getPlayerOrSpectatorID(clientSocket);
            
            Logger.info("Client " + spectatorID + " requests to play.");
            pubsub.fireEvent(CommsEvents.ServerToServer.newPlayerQueued, {spectatorID: spectatorID});
        });

        clientSocket.on(CommsEvents.ClientToServer.vote, function (powerupName) {
            var spectatorID = getPlayerOrSpectatorID(clientSocket);

            var voteConfig = {
                spectatorID: spectatorID,
                powerup: powerupName
            };
            Logger.info("Spectator " + spectatorID + " casts powerup vote.");
            pubsub.fireEvent(CommsEvents.ServerToServer.newVote, voteConfig);
        });

        // SRS Requirement - 3.2.1.11 Player Client Input
        // This function receives client inputs and emits an event to let interested parties know
        // There are new inputs to be processed
        clientSocket.on(CommsEvents.ClientToServer.newCommandAggregate, function (newCommandAggregate) {
            var playerID = getPlayerOrSpectatorID(clientSocket);

            if (model.getPlayer(playerID) == null) {
                Logger.warn("Command aggregate received from spectator!  Should not be possible.");
            }

            pubsub.fireEvent(CommsEvents.ServerToServer.playerCommandsReceived, {
                playerID: playerID,
                newCommands: newCommandAggregate
            });
        });

        clientSocket.on('error', function(err){
            Logger.error(err);
        });

    });


    //
    //             UTILITY METHODS AND QUERIES
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * @param socket
     * @returns {Number} The id of the player or spectator.  null if it doesn't exist.
     */
    var getPlayerOrSpectatorID = function (socket) {
        var candidates = model.getPlayers(function (player) {
            return player.client.socket.id === socket.id;
        });

        if (candidates.length === 0) {
            candidates = model.getSpectators(function (spectator) {
                return spectator.client.socket.id === socket.id;
            });
        }

        if (candidates.length === 0) {
            Logger.error('Comms could not find player or spectator with a socket.');
            return null;
        } else if (candidates.length > 1) {
            Logger.error('Comms found more than one player or spectator with a socket.');
            return null;
        }

        return candidates[0].id;
    };


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

    // SRS Requirement - 3.2.1.9 Game Model Snapshot
    // This method handles the actual sending of snapshots to clients
    // SRS Requirement - 3.2.1.12 Spectator Client Broadcast
    // Spectator client broad casts are handled exactly the same as player broadcasts
    // Both players and spectators have a "client" which is used for this kind of communication
    this.broadcastSnapshot = function (snapshot) {
        Logger.debug("Comms broadcasting snapshot.");
        io.sockets.emit(CommsEvents.ServerToClient.newSnapshot, snapshot);
    };


    /**
     * Tell all clients to start.  Each client is delayed by an estimated time necessary
     * to synchronize them all.
     *
     * @param {Object} newRoundData
     * @property {Object} snapshot - a Model snapshot
     * @property {Number} minimumDelay - the minimum time in milliseconds that any client will wait before starting
     *                                   a new round.
     * @param {Function} delayedStartCallback - a callback that will be called after a delay.  Ideally called at the
     *                                          same time all clients are instructed to start.
     */
    // SRS Requirement - 3.2.1.4 Game Clock Synchronization
    // This function handles starting a synchronized round with server and all clients
    this.broadcastSynchronizedStart = function (newRoundData, delayedStartCallback) {
        Logger.info("Comms broadcasting new round.");

        //TODO compute this for each client depending on latency with snapshot packets.
        var clientDelay = newRoundData.minimumDelay;
        io.sockets.emit(CommsEvents.ServerToClient.startNewRound, {
            snapshot: newRoundData.snapshot,
            delay: clientDelay
        });

        setTimeout(delayedStartCallback, newRoundData.minimumDelay);
    };

    /**
     * Tell all clients that the round has stopped.
     * @param {Object} roundEndData
     */
    this.broadcastRoundEnded = function (roundEndData) {
        Logger.info("Comms broadcasting round end.");
        
        io.sockets.emit(CommsEvents.ServerToClient.endRound, roundEndData);
    };


    //
    //             EVENTS
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Register a callback with an event.
     * @param {String} eventName
     * @param {Function} callback
     */
    this.on = function (eventName, callback) {
        pubsub.on(eventName, callback);
    };

};

module.exports = Comms;