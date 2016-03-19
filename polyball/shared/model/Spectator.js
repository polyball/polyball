/**
 * Created by thornhil on 3/10/16.
 */

'use strict';
var Client = require('polyball/shared/model/Client');

/**
 * Creates a new Spectator.
 * @param {Object} config
 * @param {number} config.id
 * @param {Object} config.client - This is a client config
 * @constructor
 */
function Spectator(config) {
    this.id = config.id;
    this.client = new Client(config.client);
    this.queued = false;
}

module.exports = Spectator;