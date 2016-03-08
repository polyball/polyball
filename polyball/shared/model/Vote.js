/**
 * Created by thornhil on 3/7/16.
 */

'use strict';

/**
 * Holds vote information for a Powerup Election.
 *
 * @param {{playerID: number,
 *          powerup: Powerup}} config
 * @constructor
 */
function Vote(config) {
    this.powerup = config.powerup;
    this.playerID = config.playerID;
}

module.exports = Vote;