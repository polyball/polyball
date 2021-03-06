/**
 * Created by ryan on 13/03/16.
 */
var fs = require('fs');
var _ = require('lodash');
var Logger = require('polyball/shared/Logger');
var DefaultConfig = require('polyball/server/configuration/DefaultConfiguration');


/**
 * Initializes the configuration object
 *
 * @param {{configPath: String}} config
 * @constructor
 */
    // SRS Requirement - 3.2.1.1 Configure Server
    // This class handles server configuration
var Configuration = function (config){
    var defaults = new DefaultConfig();
    var values = new DefaultConfig();
    var self = this;

    /**
     * Checks that a property is not greater than some bound
     * @param {String} property
     * @param {Number} bound
     */
    var checkUpperBound = function(property, bound){
      if (!_.isFinite(bound) || values[property] > bound){
          Logger.warn(property + ' was set to: ' + values[property] +
              '. The maximum  allowed value is ' + bound);
          values[property] = defaults[property];
      }
    };

    /**
     * Checks that a property is not less than some bound
     * @param {String} property
     * @param {Number} bound
     */
    var checkLowerBound = function(property, bound){
        if (!_.isFinite(bound) || values[property] < bound){
            Logger.warn(property + ' was set to: ' + values[property] +
                '. The minimum  allowed value is ' + bound);
            values[property] = defaults[property];
        }
    };

    var checkDirectoryAccessible = function(property) {
        try {
            fs.accessSync(values[property], fs.R_OK);
        } catch (e) {
            Logger.warn(property + ' was set to: ' + values[property] +
                '. This path was not accessible, and was resset to: ' + defaults[property]);
            values[property] = defaults[property];
        }
    };

    var printConfig = function(){
        Logger.info("======= Configuration ======= ");
        for (var key in self.values){
            if (self.values.hasOwnProperty(key)){
                Logger.info ("\t" + key + ": " + self.values[key]);
            }
        }
        Logger.info("======= End Configuration ======= ");
    };

    // SRS Requirement - 3.1.1 Configuration file
    // This code reads in a configuration file at a specified path
    if (config != null) {
        var customComfig = JSON.parse(fs.readFileSync(config.configPath, 'utf8'));
        _.assign(values, customComfig);
    }

    checkLowerBound('minimumPlayers', defaults.minimumPlayers);
    checkUpperBound('minimumPlayers', values.maximumPlayers);
    checkLowerBound('maximumPlayers', values.minimumPlayers);
    checkLowerBound('serverTick', 1);
    checkLowerBound('roundIntermission', 1);
    checkDirectoryAccessible('powerupsDir');
    checkLowerBound('powerupRadius', 1);
    checkLowerBound('commandAggregationInterval', 20);
    checkLowerBound('inputAccumulationInterval', 10);
    checkLowerBound('powerupDuration', 1);
    checkUpperBound('powerupDuration', defaults.roundLength);
    checkLowerBound('powerupVoteDuration', 1);
    checkLowerBound('powerupVoteFrequency', values.powerupVoteDuration);
    checkLowerBound('powerupVoteDuration', values.powerupDuration);
    this.values = values;

    Object.freeze(this.values);
    printConfig();
};

module.exports = Configuration;