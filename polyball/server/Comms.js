/**
 * Created by kdbanman on 2/29/16.
 */

var Logger = require('polyball/shared/Logger');
var Server = require('socket.io');
var Util = require('polyball/shared/Util');
var Client = require('polyball/shared/model/Client');


/**
 *
 * @param {{
 *   httpServer: node.http.Server,
 *   model: Model
 * }} config
 * @constructor
 */
var Comms = function (config) {
    var io = new Server(config.httpServer, {serveClient: true});
    var model = config.model;

    io.on('connection', function (clientSocket) {
        Logger.info('New client connected.');

        // create a spectator with the socket in the model
        var client = new Client({
            name: Util.randomUsername(),
            socket: clientSocket
        });

        model.addSpectator(client);

        clientSocket.on('disconnect', function () {
            Logger.info('Client disconnected');
        });

        clientSocket.on('vote', function () {
            //broadcast to listeners (like the engine).
            //listeners.notify('vote', voteData);
        });

        clientSocket.emit('logLevel', Logger.getLevel());
    });

    this.broadcastSnapshot = function (snapshot) {
        Logger.debug("Comms broadcasting snapshot.");
        io.sockets.emit('snapshot', snapshot);
    };

    /**
     * @param {String} eventName
     * @param {function} callback
     */
    //TODO stop ignoring this line!
    this.on = function (eventName, callback){ //jshint ignore:line
        // TODO implement pub sub
    };

};

module.exports = Comms;