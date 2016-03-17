/**
 * Created by ryan on 13/03/16.
 */
var fs = require('fs');
var _ = require('lodash');
var Logger = require('polyball/shared/Logger');


/**
 * Initializes the configuration object
 *
 * @param {{configPath: String}} config
 * @constructor
 */
var Configuration = function (config){

    var values = {
        minimumPlayers: 3, //Minimum number of players for the game to start
        serverTick: 30,     //What interval the server should progress the simulation (milliseconds)
        roundIntermission: 5000 //How long the intermission between rounds lasts (milliseconds)
    };

    /**
     * Checks the bounds of the minimumPlayers value
     */
    var checkMinimumPlayers = function (){
        if (values.minimumPlayers < 3){
            Logger.warn('Minimum Players was set to: ' + values.minimumPlayers +
            ' The minimum allowed value is 3.');
            values.minimumPlayers = 3;
        }
    };

    /**
     * Checks the bounds of the serverTick value
     */
    var checkserverTick = function (){
        if (values.serverTick < 30){
            Logger.warn('Sever tick is set to: ' + values.serverTick +
            ' values less than 30 milliseconds may cause problems');
        }
    };

    /**
     * Checks the bounds of the roundIntermission value
     */
    var checkroundIntermission = function (){
        if (values.roundIntermission < 1 ){
            Logger.warn('Round Intermission is set to: ' + values.serverTick +
                ' values less than 1 are not allowed. Round Intermission has been reset to 5 seconds.');
            values.roundIntermission = 5000;
        }
    };

    var customComfig = JSON.parse(fs.readFileSync(config.configPath, 'utf8'));
    _.assign(values, customComfig);

    checkMinimumPlayers();
    checkserverTick();
    checkroundIntermission();

    this.values = values;

    Object.freeze(this.values);
};

module.exports = Configuration;