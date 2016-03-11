/**
 * Created by thornhil on 3/10/16.
 */

'use strict';

/**
 * @external Socket A socket.io client socket.
 */

/**
 * Creates a new Spectator.
 *
 * @param {{name: String,
 *          id: Number,
 *          socket: Socket}} config
 * @constructor
 */
function Spectator(config) {
    this.name = config.name;
    this.id = config.id;
    this.socket = config.socket;
}

module.exports = Spectator;