/**
 * Created by ryan on 27/03/16.
 */
var Powerups = require('polyball/shared/powerups/Index');

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

/**
 * Return all the names of the currently loaded powerups
 * @returns {String[]}
 */
PowerupFactory.getAllPowerupNames = function(){
    var names = [];
    for (var name in Powerups){
        if (Powerups.hasOwnProperty(name)){
            names.push(name);
        }
    }
    return names;
};

module.exports = PowerupFactory;