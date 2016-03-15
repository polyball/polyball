/**
 * Created by kdbanman on 2/29/16.
 */


var socket = require('socket.io');
var Util = require('polyball/shared/Util');
var Client = require('polyball/shared/model/Client');


/**
 *
 * @param {{
 *   httpServer: Object,
 *   model: Model
 * }}config
 * @constructor
 */
var Comms = function (config) {
    var io = socket(config.httpServer);
    var model = config.model;

    io.on('connection', function (clientSocket) {

        clientSocket.on('disconnect', function () {

        });

        clientSocket.on('vote', function () {
            //broadcast to listeners (like the engine).
            //listeners.notify('vote', voteData);
        });

        // create a spectator with the socket in the model
        var client = new Client({
            name: Util.randomUsername(),
            socket: clientSocket
            });

        model.addSpectator(client);
    });



    this.broadcastSnapshot = function () {
        // get spectators (get their clients)
        // get players (same)

        // for each client, socket.emit('newSnapshot', snapshot);

    };


};

module.export = Comms;