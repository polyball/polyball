/**
 * Created by kdbanman on 2/29/16.
 */

var io = require('socket.io-client');
var Logger = require('polyball/shared/Logger');
var CommsEvents = require('polyball/shared/CommsEvents');
var PubSub = require('polyball/shared/PubSub');

/**
 *
 * @param {Object} config
 * @property {String} serverAddress - The address (including port number) of the server to connect to.
 * @property {Function} newIDCallback - A callback that is called with the client's permanent ID.  (Part of initial handshake data.)
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
    //             PRIVATE STATE
    //
    ///////////////////////////////////////////////////////////////////////////

    var socket = io.connect(config.serverAddress);
    var pubsub = new PubSub({
        events: CommsEvents.ClientToClient
    });


    //
    //             EVENT SUBSCRIPTION
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Set the log level according to the server.
     */
    socket.on(CommsEvents.ServerToClient.setLogLevel, function (logLevel) {
        Logger.info('Comms received log level set: ' + logLevel);
        Logger.setLevel(logLevel);
    });
    
    socket.on(CommsEvents.ServerToClient.idAssigned, function (id) {
        Logger.info('Comms received new local id: ' + id);
        if (typeof config.newIDCallback === 'function') {
            config.newIDCallback(id);
        }
    });

    /**
     * Tell subscribers (Synchronizer, etc.) that a new round is starting.
     * NOTE: Data includes a delay until new round actually begins.
     */
    socket.on(CommsEvents.ServerToClient.startNewRound, function (newRoundData) {
        Logger.info('Comms received new round');
        pubsub.fireEvent(CommsEvents.ClientToClient.newRound, newRoundData);
    });

    /**
     * Tell subscribers that a new snapshot has been received.
     */
    socket.on(CommsEvents.ServerToClient.newSnapshot, function (snapshot) {
        Logger.debug(snapshot);
        pubsub.fireEvent(CommsEvents.ClientToClient.snapshotReceived, snapshot);
    });

    /**
     * Tell subscribers that the round has ended.
     */
    socket.on(CommsEvents.ServerToClient.endRound, function (roundEndData) {
        Logger.info("Comms received round end event");

        pubsub.fireEvent(CommsEvents.ClientToClient.roundEnded, roundEndData);
    });


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

    this.requestInitialConfig = function (callback) {

        socket.emit(CommsEvents.ClientToServer.configRequest, callback);
    };

    /**
     * Subscribe to an event
     * @param {String} eventName - The name of the event.  Use CommsEvents.ClientToClient.
     * @param {Function} callback - The callback to call when the event is fired.
     */
    this.on = function(eventName, callback) {
        pubsub.on(eventName, callback);
    };


    this.queueToPlay = function () {
        Logger.info('Comms is queueing to play.');

        socket.emit(CommsEvents.ClientToServer.queueToPlay);
    };
    
    this.requestClientName = function (name) {
        Logger.info('Comms is requesting name ' + name);
        
        socket.emit(CommsEvents.ClientToServer.requestName, name);
    };
    
    this.sendCommandAggregate = function (commandAggregate) {
        Logger.debug('Comms sending command aggregate');
        
        socket.emit(CommsEvents.ClientToServer.newCommandAggregate, commandAggregate);
    };
    
    this.voteForPowerup = function (powerupName) {
        Logger.debug('Voting for ' + powerupName);
        
        socket.emit(CommsEvents.ClientToServer.vote, powerupName);
    };
};


module.exports = Comms;