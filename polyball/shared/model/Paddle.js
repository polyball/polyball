/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");
var Util = require('polyball/shared/Util');


/**
 * Creates a paddle
 * @param {Object} config
 * @property {number} config.id
 * @property {number} config.leftBound
 * @property {number} config.rightBound
 * @property {number} config.body.radius
 * @property {number} config.body.x
 * @property {number} config.body.y
 * @property {Object} config.body.styles
 * @constructor
 */
var Paddle = function(config) {
    this.id = config.id;
    this.leftBound = config.leftBound;
    this.rightBound = config.rightBound;

    this.body = Physics.body('circle',
        {
            x: config.body.x,
            y: config.body.y,
            radius: config.body.radius,
            treatment: 'static',
            styles: config.body.styles
        }
    );

    /**
     * Converts this paddle object into it's serializable form.
     * Contains physics state, but NOT as constructor expects (EX: body.state.pos.x, not body.x).
     * @return {Object}
     */
    this.toConfig = function(){
        return {
            id: this.id,
            body: {
                state: Util.bodyToStateConfig(this.body),
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
    this.body.x = x;
    this.body.y = y;
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
        x: normal.x,
        y: normal.y
    });
};

module.exports = Paddle;