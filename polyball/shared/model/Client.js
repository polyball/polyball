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
 * @param {Object} config
 * @param {String} config.name
 * @param {Socket} [config.socket] - Optional.  Should not be passed in on client.  Must be passed in on server.
 * @constructor
 */
var Client = function(config) {
    this.name = config.name;
    this.socket = config.socket;

    /**
     * Converts this client object into it's serializable form.
     * @return {Object}
     */
    this.toConfig = function (){
        return {
            socket: this.socket,
            name: this.name
        };
    };

    if (this.socket == null && typeof window === 'undefined') {
        throw 'Client was initialized without a socket on the server';
    }
};

module.exports = Client;