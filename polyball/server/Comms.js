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
 *   model: Model
 * }} config
 * @constructor
 */
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


    //
    //             CLIENT CONNECTION
    //
    ///////////////////////////////////////////////////////////////////////////

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

        clientSocket.on(CommsEvents.ClientToServer.disconnect, function () {
            Logger.info('Client disconnected');

            var clientID = getPlayerOrSpectatorID(clientSocket);
            model.deleteSpectator(clientID);
            model.deletePlayer(clientID);

            pubsub.fireEvent(CommsEvents.ServerToServer.clientDisconnected, {clientID: clientID});
        });

        // TODO how do I document these callback parameters??

        clientSocket.on(CommsEvents.ClientToServer.queueToPlay, function () {
            var spectatorID = getPlayerOrSpectatorID(clientSocket);
            
            Logger.info("Client " + spectatorID + " requests to play.");
            pubsub.fireEvent(CommsEvents.ServerToServer.newPlayerQueued, {spectatorID: spectatorID});
        });

        clientSocket.on(CommsEvents.ClientToServer.vote, function (voteConfig) {
            var spectatorID = getPlayerOrSpectatorID(clientSocket);

            Logger.info("Spectator " + spectatorID + " casts powerup vote.");
            pubsub.fireEvent(CommsEvents.ServerToServer.newVote, voteConfig);
        });
        
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
    this.broadcastSynchronizedStart = function (newRoundData, delayedStartCallback) {
        Logger .info("Comms broadcasting new round.");

        //TODO compute this for each client depending on latency with snapshot packets.
        var clientDelay = newRoundData.minimumDelay;
        io.sockets.emit(CommsEvents.ServerToClient.startNewRound, {
            snapshot: newRoundData.snapshot,
            delay: clientDelay
        });

        setTimeout(delayedStartCallback, newRoundData.minimumDelay);
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