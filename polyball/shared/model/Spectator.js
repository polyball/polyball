/**
 * Created by thornhil on 3/10/16.
 */

'use strict';

/**
 * Creates a new Spectator.
 *
 * @param {{id: Number,
 *          client: Client}} config
 * @constructor
 */
function Spectator(config) {
    this.id = config.id;
    this.client = config.client;
    this.queued = false;
}

module.exports = Spectator;