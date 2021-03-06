/**
 * Created by ryan on 17/05/16.
 */
var PowerupElection = require('polyball/shared/powerups/PowerupElection');
var IdGenerator = require('polyball/shared/utilities/IdGenerator');
var _ = require('lodash');

/**
 * Initializes the PowerupElectionContainer
 * @constructor
 */
var PowerupElectionContainer = function () {
    var powerupElection = null;
    var IdGen = new IdGenerator();

    /**
     * Returns the internal instance of Powerup Election
     * @Returns {PowerupElection}
     */
    this.getPowerupElection = function (){
        return powerupElection;
    };

    /**
     * Sets the internal instance of Powerup Election
     * @param {PowerupElection} config
     */
    this.setPowerupElection = function(config){

        var newConfig = {
            id: config.id ? config.id : IdGen.nextID()
        };

        _.assign(newConfig, config);

        powerupElection = new PowerupElection(newConfig);
    };

    /**
     * Stops the current powerup election
     */
    this.clearPowerupElection = function(){
        powerupElection = null;
    };

    /**
     * Gets the config for the enclosed Powerup Election object
     * @returns {Object}
     */
    this.powerupElectionConfig = function () {
        if (powerupElection != null){
            return powerupElection.toConfig();
        }
    };

};

module.exports = PowerupElectionContainer;