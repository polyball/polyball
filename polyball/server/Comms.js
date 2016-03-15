/**
 * Created by kdbanman on 2/29/16.
 */
var lodash = require('lodash');

var Logger = require('polyball/shared/Logger');
var Server = require('socket.io');
var Util = require('polyball/shared/Util');
var Client = require('polyball/shared/model/Client');
var CommsEvents = require('polyball/shared/CommsEvents');


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

    /**
     * Create an new event subscriber object from CommsEvents.ServerToServer.
     * @returns {Object<string, function>}  Map from event strings to arrays of callbacks.
     */
    var buildEventSubscribers = function () {
        var eventStrings = lodash.map(CommsEvents.ServerToServer.keys, function (key) {
            return CommsEvents.ServerToServer[key];
        });

        var eventSubscribers = {};
        eventStrings.forEach(function (eventString) {
            eventSubscribers[eventString] = [];
        });

        return eventSubscribers;
    };


    //
    //             PRIVATE STATE
    //
    ///////////////////////////////////////////////////////////////////////////

    var io = new Server(config.httpServer, {serveClient: true});
    /**
     * @type {Model}
     */
    var model = config.model;
    /**
     * For server side event subscribers, like the Engine.
     * @type {Object.<string, Function>}
     */
    var eventSubscribers = buildEventSubscribers();


    //
    //             CLIENT EVENTS
    //
    ///////////////////////////////////////////////////////////////////////////


    io.on('connection', function (clientSocket) {
        Logger.info('New client connected.');

        // create a spectator with the socket in the model
        var client = new Client({
            name: Util.randomUsername(),
            socket: clientSocket
        });

        // NOTE: Do NOT store spectator - model or engine could convert it to a player or remove
        //       the spectator from under the Comms feet.  Query for IDs when necessary.
        model.addSpectator(client);

        clientSocket.on('disconnect', function () {
            Logger.info('Client disconnected');
        });

        clientSocket.on(CommsEvents.ClientToServer.queueToPlay, function () {
            var spectatorID = getPlayerOrSpectator(clientSocket).client.id;
            fireNewPlayerQueued({spectatorID: spectatorID});
        });

        clientSocket.on(CommsEvents.ClientToServer.vote, function () {
            //broadcast to listeners (like the engine).
            //listeners.notify('vote', voteData);
        });

        clientSocket.emit('logLevel', Logger.getLevel());
    });


    //
    //             SERVER TO SERVER EVENTS
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Fire an event by name with a parameters object.
     * @param {String} eventName
     * @param {Object} params
     */
    var fireEvent = function (eventName, params) {
        if (eventSubscribers[eventName] == null) {
            Logger.warn('Comms#fire called with unrecognized event: ' + eventName);
        }

        eventSubscribers[eventName].forEach(function (callback) {
            callback(params);
        });
    };

    /**
     * Notify subscribers that a spectator has queued to be a player.
     *
     * @param params
     * @param {Number} params.spectatorID
     */
    var fireNewPlayerQueued = function (params) {
        fireEvent(CommsEvents.ServerToServer.newPlayerQueued, params);
    };


    //
    //             UTILITY METHODS AND QUERIES
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * @param socket
     * @returns {Player|Spectator}
     */
    var getPlayerOrSpectator = function (socket) {
        var candidates = model.getPlayers(function (player) {
            return player.client.socket === socket;
        });

        if (candidates.length == 0) {
            candidates = model.getSpectators(function (spectator) {
                return spectator.client.socket === socket;
            });
        }

        if (candidates.length == 0) {
            Logger.error('Comms could not find player or spectator with a socket.');
            return;
        } else if (candidates.length > 1) {
            Logger.error('Comms found more than one player or spectator with a socket.');
            return;
        }

        return candidates[0];
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
        io.sockets.emit('snapshot', snapshot);
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
        if (eventSubscribers[eventName] == null) {
            Logger.warn('Comms#on called with unrecognized event: ' + eventName);
        }

        eventSubscribers[eventName].push(callback);
    };

};

module.exports = Comms;