/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");


/**
 * Creates a paddle
 * @param {Object} config
 * @param {number} config.leftBound
 * @param {number} config.rightBound
 * @param {number} config.size
 * @param {number} config.x
 * @param {number} config.y
 * @param {Object} config.styles
 * @constructor
 */
var Paddle = function(config) {
    this.leftBound = config.leftBound;
    this.rightBound = config.rightBound;

    this.body = Physics.body('circle',
        {
            x: config.x,
            y: config.y,
            radius: config.size,
            treatment: 'static',
            styles: config.styles
        }
    );
};

/**
 * sets the position of the paddle
 * @param {Number} x
 * @param {Number} y
 */
Paddle.prototype.setPosition = function(x, y) {
    this.body.x = x;
    this.body.y = y;
};

module.exports = Paddle;