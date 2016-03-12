/**
 * Created by kdban on 3/11/2016.
 */

'use strict';

/**
 * @external Socket A socket.io client socket.
 */

/**
 * A model object for holding client information.
 *
 * @param {{name: String,
 *          socket: Socket}} config
 * @constructor
 */
var Client = function(config) {
    this.name = config.name;
    this.socket = config.socket;
};

module.exports = Client;