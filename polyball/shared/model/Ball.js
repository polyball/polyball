/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");
var Util = require('polyball/shared/Util');

/**
 * @param {object} config
 * @property {number} config.id
 * @property {number} config.lastTouchedID
 * @property {number} config.body.x
 * @property {number} config.body.y
 * @property {number} config.body.vx
 * @property {number} config.body.vy
 * @property {number} config.body.radius
 * @property {Object} config.body.styles
 * @constructor
 */
var Ball = function(config) {

    if (config.id == null) {
        throw new Error('Ball must be constructed with an id');
    }
    if (config.body == null) {
        throw new Error('Ball must be constructed with a physics body');
    }
    if (config.body.radius == null) {
        throw new Error('Ball must be constructed with a radius');
    }

    this.id = config.id;
    this.lastTouchedID = config.lastTouchedID;

    var newBodyConfig = config.body;
    newBodyConfig.mass = 1;
    newBodyConfig.restitution = 1;

    this.body = Physics.body('circle', newBodyConfig);

    /**
     * Converts this ball object into it's serializable form.
     * Contains physics state, but NOT as constructor expects (EX: body.state.pos.x, not body.x).
     * @return {Object}
     */
    this.toConfig = function(){
        return {
            lastTouchedID: this.lastTouchedID,
            body: {
                state: Util.bodyToStateConfig(this.body),
                radius: this.body.radius,
                mass: this.body.mass,
                restitution: this.body.restitution,
                styles: this.body.styles
            }
        };
    };
};

module.exports = Ball;