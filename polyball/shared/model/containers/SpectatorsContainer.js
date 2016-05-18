/**
 * Created by ryan on 17/05/16.
 */

var _ = require('lodash');
var ArrayHelper = require('polyball/shared/utilities/ArrayHelper');
var IdGenerator = require('polyball/shared/utilities/IdGenerator');
var Spectator = require('polyball/shared/model/Spectator');
var Logger = require('polyball/shared/Logger');
var Util = require('polyball/shared/utilities/Util');

/**
 * Initializes the SpectatorsContainer
 * @constructor
 */
var SpectatorContainer = function (){
    var IdGen = new IdGenerator();

    /**
     * @type {Spectator[]}
     */
    var spectators = [];

    /**
     * @type {Number[]}
     */
    var playerQueue = [];

    /**
     * Adds a spectator to the model.
     * @param {Object} config - A Spectator config.  See constructor.
     * @property {Number} [config.id] - Optional.  Should not be passed on the server, should always be passed on the client.
     * @return {Spectator} The new Spectator.
     */
    this.addSpectator = function (config) {
        var spectatorConfig = {
            id: config.id ? config.id : IdGen.nextID()
        };

        _.assign(spectatorConfig, config);

        var spectator = new Spectator(spectatorConfig);
        spectators.push(spectator);

        return spectator;
    };

    /**
     * @param {Number|Predicate} id - Either the ID of the Spectator, or a boolean returning callback that takes a Spectator.
     * @return {Spectator} The spectator from the model (undefined if not found).
     */
    this.getSpectator = function (id) {
        return ArrayHelper.findSingle(spectators, id);
    };

    /**
     * Get all spectators satisfying the predicate callback.
     * @param {Predicate} [predicate]  Callback to evaluate for each spectator.  (matches all if null.)
     * @returns {Spectator[]} All spectators matching the predicate. (may be empty.)
     */
    this.getSpectators = function (predicate) {
        return ArrayHelper.findAll(spectators, predicate);
    };

    /**
     * @param {Number|Predicate} id - Either the ID of the Spectator, or a boolean returning callback that takes a Spectator.
     * @returns {boolean} True iff the model has the spectator identified by id.
     */
    this.hasSpectator = function (id) {
        return this.getSpectator(id) != null;
    };

    /**
     * @returns {Number} The number of spectators in the model.
     */
    this.spectatorCount = function () {
        return spectators.length;
    };

    /**
     * Delete the identified spectator from the model.
     *
     * @param {Number} id
     */
    this.deleteSpectator = function (id) {
        ArrayHelper.removeByID(spectators, id);
        playerQueue.removeFromPlayerQueue(id);
    };

    /**
     * Add a spectator to the end of the player queue
     *
     * @param {Number} id
     */
    this.addToPlayerQueue = function (id) {
        if (this.hasSpectator(id)){
            if (!this.hasQueuedPlayer(id)){
                playerQueue.push(id);
            }
        }else {
            Logger.error("Tried to queue spectator that does not exist!");
        }
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
     * @return {Spectator[]}
     */
    this.getAllQueuedPlayers = function () {
        var out = [];
        playerQueue.forEach(function(x){out.push(ArrayHelper.findByID(spectators, x));});
        return out;
    };

    /**
     * Returns the first spectator in the player queue
     * @return {Spectator}
     */
    this.popPlayerQueue = function () {
        var id = playerQueue.shift();
        return ArrayHelper.findByID(spectators, id);
    };

    /**
     * Ignore the current queue and give the model a new one.  (For use with snapshots).
     * @param {Number[]} newQueue
     */
    this.setPlayerQueue = function (newQueue) {
        playerQueue = newQueue;
    };

    /**
     * Gets the config object for the enclosed spectators collection
     * @returns {Object}
     */
    this.spectatorsConfig = function () {
        if (spectators.length > 0){
            return Util.arrayToConfig(spectators);
        }
    };

    /**
     * Gets the config object for the enclosed player queue
     * @returns {Object}
     */
    this.playerQueueConfig = function () {
        return playerQueue.slice();
    };
};

module.exports = SpectatorContainer;