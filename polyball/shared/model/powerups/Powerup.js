/**
 * Created by ryan on 28/03/16.
 */

var Physics = require('physicsjs');
var Util = require('polyball/shared/Util');
/**
 * @property {number} config.body.state.pos.x
 * @property {number} config.body.state.pos.y
 * @property {number} config.body.state.vel.x
 * @property {number} config.body.state.vel.y
 * @property {number} config.body.radius
 * @property {Object} config.body.styles
 * @property {number} config.duration
 */
var Powerup = function(config){
    this.id = config.id;
    this.active = false;
    this.owner = config.owner;
    this.duration = config.duration;
    this.deleteTimeout = null;

    var newBodyConfig = {
        x: config.body.state.pos.x,
        y: config.body.state.pos.y,
        vx: config.body.state.vel.x,
        vy: config.body.state.vel.y,
        angularVelocity: config.body.state.angular.vel,
        radius: config.body.radius,
        treatment: 'dynamic',
        styles: config.body.styles
    };

    this.body = Physics.body('circle', newBodyConfig);

};

/**
 * Intended for override.  Child implementation should be idempotent.  Call parent activate() in child implementation.
 * @param {Model} model - The model to mutate with powerup goodies.
 */
// SRS Requirement - 3.2.2.15 Powerup Activated
Powerup.prototype.activate = function(model){
    model.getWorld().removeBody(this.body);
    var self = this;
    this.deleteTimeout = setTimeout(function(){
        model.deletePowerup(self.id);
    }, this.duration);
};

Powerup.prototype.toConfig = function (){
    return{
        id: this.id,
        active: this.active,
        owner: this.owner,
        duration: this.duration,
        body: {
            state: Util.bodyToStateConfig(this.body),
            radius: this.body.geometry.radius,
            mass: this.body.mass,
            styles: this.body.styles
        }
    };
};


module.exports = Powerup;