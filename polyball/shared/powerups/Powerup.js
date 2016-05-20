/**
 * Created by ryan on 28/03/16.
 */

var Physics = require('physicsjs');
var Util = require('polyball/shared/utilities/Util');
var _ = require('lodash');

// Private Variables
//////////////////////////
var active = false;
var duration;
var deactivateTimeout = null;



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
    this.id = config.id;
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

    this.body = Physics.body('circle', newBodyConfig);

};

/**
 * @param {Model} model - The model to mutate with powerup goodies.
 */
Powerup.prototype._powerupActivate = function(model){
    if (!this.isActive()) {
        model.getWorld().removeBody(this.body);
        setActive();
        this.activate(model);
        this.setTimeout(duration, model);
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

Powerup.prototype.clearTimeout = function() {
    clearTimeout(deactivateTimeout);
};

Powerup.prototype.setTimeout = function(delay, model) {
    var self = this;
    deactivateTimeout = setTimeout(function () {
        self._powerupDeactivate(model);
    }, delay);
};

Powerup.prototype.toConfig = function (){
    var superConfig = {
        id: this.id,
        name: this.name,
        active: active,
        owner: this.owner,
        duration: duration,
        body: {
            state: Util.bodyToStateConfig(this.body),
            radius: this.body.geometry.radius,
            mass: this.body.mass,
            styles: this.body.styles
        }
    };

    var subConfig = this.powerupConfig();
    _.assign(subConfig, superConfig);
    return subConfig;

};


module.exports = Powerup;