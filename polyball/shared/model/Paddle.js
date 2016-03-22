/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");
var Util = require('polyball/shared/Util');


/**
 * Creates a paddle
 * @param {Object} config  (NOTE: id is omitted because of one-to-one map with Player.)
 * @property {number} config.leftBound.x
 * @property {number} config.leftBound.y
 * @property {number} config.rightBound.x
 * @property {number} config.rightBound.y
 * @property {number} config.body.radius
 * @property {number} config.body.state.pos.x
 * @property {number} config.body.state.pos.y
 * @property {Object} config.body.styles
 * @constructor
 */
var Paddle = function(config) {
    this.leftBound = new Physics.vector(config.leftBound.x, config.leftBound.y);
    this.rightBound = new Physics.vector(config.rightBound.x, config.rightBound.y);

    this.body = Physics.body('circle',
        {
            x: config.body.state.pos.x,
            y: config.body.state.pos.y,
            radius: config.body.radius,
            treatment: 'static',
            styles: config.body.styles
        }
    );

    /**
     * Converts this paddle object into it's serializable form.
     * @return {Object}
     */
    this.toConfig = function(){
        return {
            leftBound: {
                x: this.leftBound.x,
                y: this.leftBound.y
            },
            rightBound: {
                x: this.rightBound.x,
                y: this.rightBound.y
            },
            body: {
                state: Util.bodyToStateConfig(this.body),
                radius: this.body.radius,
                styles: this.body.styles
            }
        };
    };

};

/**
 * sets the position of the paddle
 * @param {Number} x
 * @param {Number} y
 */
Paddle.prototype.setPosition = function(x, y) {
    this.body.state.pos.x = x;
    this.body.state.pos.y = y;

    //NOTE:  This is also where velocity clamping should happen.
};

/**
 * Creates a paddle using the goal to position itself
 * @param {Object} config
 * @param {number} config.radius
 * @param {Object} config.styles
 * @param {Physics.vector} config.leftBound
 * @param {Physics.vector} config.rightBound
 * @return {Object}
 */
Paddle.fromBounds = function(config){
    var position = config.leftBound.clone();
    position.vsub(config.rightBound);
    position.mult(0.5);
    position.vadd(config.rightBound);

    return new Paddle({
        leftBound: config.leftBound,
        rightBound: config.rightBound,
        body: {
            state:{
                pos:{
                    x: position.x,
                    y: position.y
                }
            },
            radius: config.radius,
            styles: config.styles
        }
    }).toConfig();
};

module.exports = Paddle;