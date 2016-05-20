/**
 * Created by ryan on 28/03/16.
 */

var Physics = require('physicsjs');
var Util = require('polyball/shared/utilities/Util');
var _ = require('lodash');

// Private Variables
//////////////////////////
var id;
var active = false;
var duration;
var deactivateTimeout = null;
var body;


// Flags for rendering
var justActivated;
var justDeactivated;

// Private functions
var setActive = function () {
    if (!active) {
        active = true;
        justActivated = true;
    }
};

var setDeactive = function () {
    if (active){
        active = false;
        justDeactivated = true;
    }
};

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
    id = config.id;
    this.owner = config.owner;
    duration = config.duration;

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

    body = Physics.body('circle', newBodyConfig);

};

/**
 * @param {Model} model - The model to mutate with powerup goodies.
 */
Powerup.prototype._powerupActivate = function(model){
    if (!this.isActive()) {
        model.getWorld().removeBody(body);
        setActive();
        this.activate(model);
        deactivateTimeout = setTimeout(function () {
            this._powerupDeactivate(model);
        }, duration);
    }
};

Powerup.prototype._powerupDeactivate = function(model) {
    if (this.isActive()){
        setDeactive();
        this.deactivate(model);
    }
};

Powerup.prototype._powerupRender = function(renderer, model) {
    if (this.isActive()){
        if (justActivated){
            this.renderActivate(renderer, model);
            justActivated = false;
        } else {
            this.renderUpdate(renderer, model);
        }
    } else{
        if (justDeactivated){
            this.renderDeactivate(renderer, model);
            justDeactivated = false;
        }
    }
};

Powerup.prototype.isActive = function() {
    return active === true;
};

Powerup.prototype._powerupToConfig = function (){
    var superConfig = {
        id: id,
        name: this.name,
        active: active,
        owner: this.owner,
        duration: duration,
        body: {
            state: Util.bodyToStateConfig(body),
            radius: body.geometry.radius,
            mass: body.mass,
            styles: body.styles
        }
    };

    var subConfig = this.toConfig();
    _.assign(subConfig, superConfig);
    return subConfig;

};


module.exports = Powerup;