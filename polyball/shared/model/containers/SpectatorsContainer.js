/**
 * Created by ryan on 17/05/16.
 */

var _ = require('lodash');
var ArrayHelper = require('polyball/shared/utilities/ArrayHelper');
var IdGenerator = require('polyball/shared/utilities/IdGenerator');
var Spectator = require('polyball/shared/model/Spectator');

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
    };
};

module.exports = SpectatorContainer;