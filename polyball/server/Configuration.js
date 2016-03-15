/**
 * Created by ryan on 13/03/16.
 */
var fs = require('fs');
var _ = require('lodash');

/**
 * Initializes the configuration object
 *
 * @param {{configPath: String}} config
 * @constructor
 */
var Configuration = function (config){

    this.values = {
        minimumPlayers: 3, //Minimum number of players for the game to start
        serverTick: 30,     //What interval the server should progress the simulation (milliseconds)
        roundIntermission: 5000 //How long the intermission between rounds lasts (milliseconds)
    };

    var customComfig = JSON.parse(fs.readFileSync(config.configPath, 'utf8'));
    _.assign(this.values, customComfig);
    Object.freeze(this.values);
};

module.exports = Configuration;