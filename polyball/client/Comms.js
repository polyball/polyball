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
    //             INITIALIZATION
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

    socket.on(CommsEvents.ServerToClient.setLogLevel, function (logLevel) {
        var newLevel = Logger.setLevel(logLevel);
        Logger.info('Log level set: ' + newLevel);
    });

    socket.on(CommsEvents.ServerToClient.newSnapshot, function (snapshot) {
        Logger.debug(snapshot);
        pubsub.fireEvent(CommsEvents.ClientToClient.snapshotReceived, snapshot);
    });

    this.on = function(eventName, callback) {
        pubsub.on(eventName, callback);
    };
};


module.exports = Comms;