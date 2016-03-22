/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");
var Util = require('polyball/shared/Util');


/**
 * Creates a paddle
 * @param {Object} config  (NOTE: id is omitted because of one-to-one map with Player.)
 * @property {number} config.leftBound
 * @property {number} config.rightBound
 * @property {number} config.body.radius
 * @property {number} config.body.state.pos.x
 * @property {number} config.body.state.pos.y
 * @property {Object} config.body.styles
 * @constructor
 */
var Paddle = function(config) {
    this.leftBound = config.leftBound;
    this.rightBound = config.rightBound;

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
            body: {
                state: Util.bodyToStateConfig(this.body),
                leftBound: this.leftBound,
                rightBound: this.rightBound,
                radius: this.body.radius,
                treatment: this.body.treatment,
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
 * @param {number} config.size
 * @param {Object} config.styles
 * @param {number} config.padding
 * @param {Physics.body} config.goal
 * @return {Paddle}
 */
Paddle.fromGoal = function(config){
    var normal = new Physics.vector(config.goal.state.x, config.goal.state.y);
    normal.rotate(Math.PI/2 + config.goal.state.angular.pos);

    var translation = normal.clone();
    translation.mult(config.padding);

    normal.translate(translation);

    return new Paddle({
        //TODO setup bounds properly
        leftBound: new Physics.vector(0,0),
        rightBound: new Physics.vector(0,0),
        size: config.size,
        styles: config.styles,
        body: {
            state: {
                pos: {
                    x: normal.x,
                    y: normal.y
                }
            }
        }
    });
};

module.exports = Paddle;