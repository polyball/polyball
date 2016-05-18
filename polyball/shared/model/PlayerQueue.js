/**
 * Created by ryan on 17/05/16.
 */
var _ = require('lodash');

/**
 * Initializes the PlayerQueue
 * @constructor
 */

var PlayerQueue = function (){
    /**
     * @type {Number[]}
     */
    var playerQueue = [];

    /**
     * Add a spectator to the end of the player queue
     *
     * @param {Number} id
     */
    this.addToPlayerQueue = function (id) {
        playerQueue.push(id);
    };

    /**
     * Test if a spectator is queued to play.
     * @param {number} spectatorID - the id of the spectator.
     * @returns {boolean} true iff the spectator is queued.
     */
    this.hasQueuedPlayer = function (spectatorID) {
        return _.indexOf(playerQueue, spectatorID) !== -1;
    };

    /**
     * Remove a spectator from the player queue
     * @param {Number} id
     */
    this.removeFromPlayerQueue = function (id) {
        _.remove(playerQueue, function(queuedID) {return queuedID === id;});
    };


    /**
     * Returns how many players there are in the queue
     * @return {Number}
     */
    this.numberOfQueuedPlayers = function () {
        return playerQueue.length;
    };

    /**
     * Returns how many players there are in the queue
     * @return {Number[]}
     */
    this.getAllQueuedPlayers = function () {
        return playerQueue.slice();
    };

    /**
     * Returns the first spectator in the player queue
     * @return {Number}
     */
    this.popPlayerQueue = function () {
        return playerQueue.shift();

    };

    /**
     * Ignore the current queue and give the model a new one.  (For use with snapshots).
     * @param {Number[]} newQueue
     */
    this.setPlayerQueue = function (newQueue) {
        playerQueue = newQueue;
    };
};

module.exports = PlayerQueue;