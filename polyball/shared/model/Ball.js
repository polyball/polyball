/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");

/**
 * @param {object} config
 * @param {number} config.x
 * @param {number} config.y
 * @param {number} config.vx
 * @param {number} config.vy
 * @param {number} config.id
 * @param {number} config.radius
 * @param {Object} config.styles
 * @constructor
 */
var Ball = function(config) {
    this.lastTouched = undefined;
    this.body = Physics.body('circle',
        {
            x: config.x,
            y: config.y,
            vx: config.vx,
            vy: config.vy,
            radius: config.radius,
            mass: 1,
            restitution: 1,
            styles: config.styles
        }
    );

    /**
     * Converts this ball object into it's config (serializable) form
     * @return {Object}
     */
    this.toConfig = function(){
        return {
            x: this.body.state.pos.x,
            y: this.body.state.pos.y,
            vx: this.body.state.vel.x,
            vy: this.body.state.vel.y,
            radius: this.body.radius,
            mass: this.body.mass,
            restitution: this.body.restitution,
            styles: this.body.styles
        };
    };


    this.id = config.id;
};

module.exports = Ball;