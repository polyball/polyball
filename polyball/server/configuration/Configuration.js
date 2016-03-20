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
var Configuration = function (config){
    var defaults = new DefaultConfig();
    var values = new DefaultConfig();

    /**
     * Checks that a property is not greater than some bound
     * @param {String} property
     * @param {Number} bound
     */
    var checkUpperBound = function(property, bound){
      if (values[property] > bound){
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
        if (values[property] < bound){
            Logger.warn(property + ' was set to: ' + values[property] +
                '. The minimum  allowed value is ' + bound);
            values[property] = defaults[property];
        }
    };

    var customComfig = JSON.parse(fs.readFileSync(config.configPath, 'utf8'));
    _.assign(values, customComfig);

    checkLowerBound('minimumPlayers', defaults.minimumPlayers);
    checkUpperBound('minimumPlayers', values.maximumPlayers);
    checkLowerBound('maximumPlayers', values.minimumPlayers);
    checkLowerBound('serverTick', 1);
    checkLowerBound('roundIntermission', 1);

    this.values = values;

    Object.freeze(this.values);
};

module.exports = Configuration;