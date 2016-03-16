/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");

/**
 *
 * @param {{
 *  id: number,
 *  body: {
 *    x: number,
 *    y: number,
 *    vx: number,
 *    vy: number,
 *    radius: number,
 *    styles: Object}}} config
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


    this.id = config.id;
};

module.exports = Ball;