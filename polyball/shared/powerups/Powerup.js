/**
 * Created by ryan on 28/03/16.
 */

var Physics = require('physicsjs');
var Util = require('polyball/shared/utilities/Util');
var _ = require('lodash');

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
    this.duration = config.duration;
    this.active = false;
    this.deactivateTimeout = null;
    this.justActivated = false;
    this.justDeactivated = false;

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
        this.activate(model);
        this.setActive();
        this.setTimeout(this.duration, model);
    }
};

Powerup.prototype._powerupDeactivate = function(model) {
    if (this.isActive()){
        this.deactivate(model);
        this.setDeactive();
    }
};

Powerup.prototype._powerupRender = function(renderer, model) {
    if (this.isActive()){
        if (this.justActivated){
            this.renderActivate(renderer, model);
            this.justActivated = false;
        } else {
            this.renderUpdate(renderer, model);
        }
    } else{
        if (this.justDeactivated){
            this.renderDeactivate(renderer, model);
            this.justDeactivated = false;
        }
    }
};

Powerup.prototype.isActive = function() {
    return this.active === true;
};

Powerup.prototype.clearTimeout = function() {
    clearTimeout(this.deactivateTimeout);
};

Powerup.prototype.setTimeout = function(delay, model) {
    var self = this;
    this.deactivateTimeout = setTimeout(function () {
        self._powerupDeactivate(model);
    }, delay);
};


Powerup.prototype.setActive = function () {
    if (!this.isActive()) {
        this.active = true;
        this.justActivated = true;
    }
};

Powerup.prototype.setDeactive = function () {
    if (this.isActive()){
        this.active = false;
        this.justDeactivated = true;
    }
};


Powerup.prototype.toConfig = function (){
    var superConfig = {
        id: this.id,
        name: this.name,
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

    var subConfig = this.powerupConfig();
    _.assign(subConfig, superConfig);
    return subConfig;

};


module.exports = Powerup;