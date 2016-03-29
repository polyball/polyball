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
 */
var Powerup = function(config){
    this.id = config.id;
    this.active = false;
    this.owner = config.owner;


    var newBodyConfig = {
        x: config.body.state.pos.x,
        y: config.body.state.pos.y,
        vx: config.body.state.vel.x,
        vy: config.body.state.vel.y,
        radius: config.body.radius,
        treatment: 'static',
        styles: config.body.styles
    };

    this.body = Physics.body('circle', newBodyConfig);

};

/**
 * Intended for override.  Child implementation should be idempotent.  Call parent activate() in child implementation.
 * @param {Model} model - The model to mutate with powerup goodies.
 */
Powerup.prototype.activate = function(model){
    model.getWorld().removeBody(this.body);
};

Powerup.prototype.toConfig = function (){
    return{
        id: this.id,
        active: this.active,
        owner: this.owner,
        body: {
            state: Util.bodyToStateConfig(this.body),
            radius: this.body.geometry.radius,
            mass: this.body.mass,
            styles: this.body.styles
        }
    };
};


module.exports = Powerup;