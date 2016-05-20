/**
 * Created by ryan on 16/05/16.
 */
var PowerupFactory = require('polyball/shared/powerups/PowerupFactory');
var Logger = require('polyball/shared/Logger');
var _ = require('lodash');
var ArrayHelper = require('polyball/shared/utilities/ArrayHelper');
var IdGenerator = require('polyball/shared/utilities/IdGenerator');
var Util = require('polyball/shared/utilities/Util');

/**
 * Initializes the PowerupContainer
 * @property {Model} config.model
 * @constructor
 */
var PowerupContainer = function (config) {
    var powerups = [];
    var model = config.model;
    var world = model.getWorld();
    var IdGen = new IdGenerator();
    var self = this;

    /**
     * Add a powerup to the model.
     *
     * @param {Object} config - see powerup Constructor
     * @property {string} config.name - Name of the powerup to be instantiated
     * @property {Number} [config.id] - Optional.  Should not be passed on the server, should always be passed on the client.
     * @return {Ball} The new Ball.
     */
    this.addPowerup  = function (config) {

        var newConfig = {
            id: config.id ? config.id : IdGen.nextID()
        };

        _.assign(newConfig, config);

        var powerup = PowerupFactory.buildPowerup(config.name, newConfig);
        powerups.push(powerup);
        world.addBody(powerup.body);

        return powerup;
    };

    /**
     * @param {Number|Predicate} id - Either the ID of the Powerup, or a boolean returning callback that takes a Powerup.
     * @return {Object} Powerup identified by id.
     */
    this.getPowerup = function (id) {
        return ArrayHelper.findSingle(powerups, id);
    };

    /**
     * Get all powerups satisfying the predicate callback.
     * @param {Predicate} [predicate]  Callback to evaluate for each powerup. (matches all if null.)
     * @returns {Object[]} All powerups matching the predicate. (may be empty.)
     */
    this.getPowerups = function (predicate) {
        return ArrayHelper.findAll(powerups, predicate);
    };

    /**
     * @param {Number|Predicate} id - Either the ID of the Powerup, or a boolean returning callback that takes a Powerup.
     * @returns {boolean} True iff the model has the powerup identified by id.
     */
    this.hasPowerup = function (id) {
        return self.getPowerup(id) != null;
    };

    /**
     * @returns {Number} The number of powerups in the model.
     */
    this.powerupCount = function () {
        return powerups.length;
    };

    /**
     * Delete the identified powerup from the model.
     *
     * @param {Number} id
     */
    this.deletePowerup = function (id) {
        var pu = ArrayHelper.removeByID(powerups, id);
        if (pu != null) {
            Logger.info('Model deactivating powerup.');
            pu._powerupDeactivate(model);
            world.removeBody(pu.body);
        }
    };

    /**
     * Delete all powerups from the model.
     */
    this.clearPowerups = function () {
        var powerupIDs = _.map(powerups, function (powerup) { return powerup.id; });

        var me = this;
        powerupIDs.forEach(function (id) {
            me.deletePowerup(id);
        });
    };

    /**
     * Gets the config object for the enclosed powerups collection
     * @returns {Object}
     */
    this.powerupsConfig = function () {
        return Util.arrayToConfig(powerups);
    };

};

module.exports = PowerupContainer;