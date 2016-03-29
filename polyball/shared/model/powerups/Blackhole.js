/**
 * Created by ryan on 27/03/16.
 */

var Physics = require('physicsjs');
var inherits = require('inherits');
var Powerup = require('polyball/shared/model/powerups/Powerup');
var _ = require('lodash');

/**
 * This powerup create a gravitational pull in the center of the arena
 * @param config - See powerup config
 * @constructor
 */
var Blackhole = function(config){
    Powerup.call(this, config);
    this.name = Blackhole.Name;
};

inherits(Blackhole, Powerup);

/**
 * This holds all the logic to activate a blackhole
 * @param {Model} model
 */
Blackhole.prototype.activate = function(model){
    Blackhole.super_.prototype.activate.call(this, model);
    var arenaCenter = model.getArena().getCenter();
    this.attractor = Physics.behavior('attractor',{
        order: 0,
        strength: 0.003,
        pos: arenaCenter
    });

    model.getWorld().add(this.attractor);

    this.active = true;
};

/**
 * This holds all the logic to deactivate a blackhole
 * @param {Model} model
 */
Blackhole.prototype.deactivate = function (model){
    if (this.active){
        model.getWorld().remove(this.attractor);
        this.active = false;
    }
};

Blackhole.prototype.toConfig = function (){
    var config = { name: this.name};
    _.assign(config, Blackhole.super_.prototype.toConfig.call(this));
    return config;
};

Blackhole.Name = 'Blackhole';


module.exports = Blackhole;