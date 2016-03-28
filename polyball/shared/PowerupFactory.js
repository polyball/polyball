/**
 * Created by ryan on 27/03/16.
 */
var Powerups = require('polyball/shared/model/powerups/Index');

/**
 *
 * @param config
 * @property {String} config.powerupsDir
 * @constructor
 */
var PowerupFactory = function (){

};

PowerupFactory.buildPowerup = function(className, args){
    return new Powerups[className](args);
};

module.exports = PowerupFactory;