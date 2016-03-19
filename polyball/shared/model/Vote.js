/**
 * Created by thornhil on 3/7/16.
 */

'use strict';

/**
 * Holds vote information for a Powerup Election.
 * @param {Object} config
 * @param {number} config.spectatorID
 * @param {Object} config.powerup
 * @constructor
 */
function Vote(config) {
    //TODO expand from powerup config (and update tests)
    this.powerup = config.powerup;
    this.spectatorID = config.spectatorID;

    this.toConfig = function () {
        return {
            spectatorID: this.spectatorID, powerup: this.powerup
        };
    };
}

module.exports = Vote;