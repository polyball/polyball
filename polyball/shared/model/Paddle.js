/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");

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

Paddle.prototype.setPosition = function(x) {
    this.body.x = x;
};