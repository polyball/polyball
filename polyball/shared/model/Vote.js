/**
 * Created by thornhil on 3/7/16.
 */

'use strict';

/**
 * Holds vote information for a Powerup Election.
 *
 * @param {{spectatorID: number,
 *          powerup: Powerup}} config
 * @constructor
 */
function Vote(config) {
    this.powerup = config.powerup;
    this.spectatorID = config.spectatorID;
}

module.exports = Vote;