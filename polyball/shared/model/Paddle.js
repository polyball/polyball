/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");

/**
 * The paddle stores information about the bounds of the player goal.
 * @param {{leftBound: Physics.vector,
 * rightBound: Physics.vector,
 * x: number,
 * y: number,
 * size: number,
 * styles: Object}} config
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
            treatment: static,
            styles: config.style
        }
    );
};

/**
 * Updates the position of the paddle to the specified value.
 * The position is forced inside the bounds of the player's goal,
 * so that the paddle doesn't leave or clip with the goal.
 * @param x: number
 */
Paddle.prototype.setPosition = function(x) {
    // The reason we involve size is to account for the width of the paddle.
    if (this.leftBound.x > (x - this.size / 2)) {
        x = this.leftBound + this.size / 2;
    }
    else if ( this.rightBound.x < (x + this.size / 2)) {
        x = this.rightBound - this.size / 2;
    }

    this.body.x = x;
};

module.exports = Paddle;