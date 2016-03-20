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

    socket.on(CommsEvents.ServerToClient.setLogLevel, function (logLevel) {
        var newLevel = Logger.setLevel(logLevel);
        Logger.info('Log level set: ' + newLevel);
    });

    socket.on(CommsEvents.ServerToClient.startNewRound, function (newRoundData) {
        Logger.info('Comms receieved new round');
        pubsub.fireEvent(CommsEvents.ClientToClient.newRound, newRoundData);
    });

    socket.on(CommsEvents.ServerToClient.newSnapshot, function (snapshot) {
        Logger.debug(snapshot);
        pubsub.fireEvent(CommsEvents.ClientToClient.snapshotReceived, snapshot);
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

    /**
     * Subscribe to an event
     * @param {String} eventName - The name of the event.  Use CommsEvents.ClientToClient.
     * @param {Function} callback - The callback to call when the event is fired.
     */
    this.on = function(eventName, callback) {
        pubsub.on(eventName, callback);
    };
};


module.exports = Comms;