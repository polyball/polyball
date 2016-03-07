/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");

/**
 *
 * @param {{x: number,
 *  y: number,
 *  radius: number,
 *  styles: Object}} config
 * @constructor
 */
var Ball = function(config) {
    this.lastTouched = undefined;
    this.body = Physics.body('circle',
        {
            x: config.x,
            y: config.y,
            radius: config.ballRadius,
            mass: 1,
            restitution: 1,
            styles: config.style
        }
    );

    this.id = config.id;
};

/**
 *
 * @param {Player} lastTouched
 */
Ball.prototype.setLastTouched = function(lastTouched) {
    this.lastTouched = lastTouched;
};

module.exports = Ball;