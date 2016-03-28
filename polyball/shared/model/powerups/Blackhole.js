/**
 * Created by ryan on 27/03/16.
 */

var Physics = require('physicsjs');

/**
 * This powerup create a gravitational pull in the center of the arena
 * @param config
 * @property {number} config.id
 * @property {Boolean} config.active
 * @constructor
 */
var Blackhole = function(config){
    this.id = config.id;
    this.active = config.active;
    this.name = "Blackhole";
    var attractor;

    /**
     * This holds all the logic to activate a blackhole
     * @param {Model} model
     */
    this.activate = function(model){
        var arenaCenter = model.getArena().getCenter();
        attractor = Physics.behavior('attractor',{
            order: 0,
            strength: 0.003,
            pos: arenaCenter
        });

        model.getWorld().add(attractor);

        this.active = true;
    };

    /**
     * This holds all the logic to deactivate a blackhole
     * @param {Model} model
     */
    this.deactivate = function (model){
        model.getWorld().remove(attractor);
        this.active = false;
    };

    this.toConfig = function (){
        return{
            id: this.id,
            active: this.active,
            name: this.name
        };
    };

};


module.exports = Blackhole;