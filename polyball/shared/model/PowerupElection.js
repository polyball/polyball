/**
 * Created by thornhil on 3/7/16.
 */

'use strict';

/**
 * Elects a powerup to be spawned in the arena.
 *
 * @param {{powerups: Powerup[]}} config
 * @constructor
 */
function PowerupElection(config) {
    this.powerups = config.powerups;
}


PowerupElection.prototype.addVote = function (vote) {
    this.test = vote;
};

module.exports = PowerupElection;