/**
 * Created by ryan on 27/03/16.
 */

/**
 * This powerup create a gravitational pull in the center of the arena
 * @param config
 * @property {number} config.id
 * @property {Model} config.model

 * @constructor
 */
var Blackhole = function(config){
    this.id = config.id;
    this.model = config.model;
    this.name = "Blackhole";

    this.activate = function(){
        console.log('=============================================');
        console.log('=============================================');
        console.log('BlackHole Activated!!!!!!!');
        console.log('=============================================');
        console.log('=============================================');
    };

};
/**
 * Return the name of this powerup
 * @returns {string}
 * @constructor
 */
Blackhole.Name = function(){
    return "Blackhole";
};

module.exports = Blackhole;