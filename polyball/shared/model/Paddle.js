/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");
var Util = require('polyball/shared/utilities/Util');
var StyleCommons = require('polyball/shared/StyleCommons');


/**
 * Creates a paddle
 * @param {Object} config  (NOTE: id is omitted because of one-to-one map with Player.)
 * @property {number} config.leftBound.x
 * @property {number} config.leftBound.y
 * @property {number} config.rightBound.x
 * @property {number} config.rightBound.y
 * @property {number} config.maxVelocity
 * @property {number} config.radius
 * @property {number} config.body.state.pos.x
 * @property {number} config.body.state.pos.y
 * @constructor
 */
var Paddle = function(config){

    // Vectors for position calculation
    var bounds = new Physics.vector(0,0);
    var deltaVec = new Physics.vector(0,0);
    var previousPos = new Physics.vector(0,0);

    /**
     * Converts this paddle object into it's serializable form.
     * @return {Object}
     */
    this.toConfig = function(){
        return {
            radius: config.radius,
            leftBound: {
                x: config.leftBound.x,
                y: config.leftBound.y
            },
            rightBound: {
                x: config.rightBound.x,
                y: config.rightBound.y
            },
            body: {
                state: Util.bodyToStateConfig(this.body),
                styles: this.body.styles,
            }
        };
    };

    /**
     * sets the position of the paddle
     * @param {Number} delta - The change in X position (from the mouse)
     * @param {Object} previous - the previous position
     * @returns {Object} the new position for the paddle
     */
    this.getNewPosition = function(delta) {

        ////Delta Calculation
        bounds.set(me.rightBound.x, me.rightBound.y);
        bounds.vsub(me.leftBound);

        deltaVec.set(bounds.x, bounds.y);
        deltaVec.normalize();
        deltaVec.mult(getClampedVelocity(delta));

        //Next Position Calculation
        deltaVec.vadd(previousPos);

        var boundsAngle = me.rightBound.angle(me.leftBound);
        var positionAngle = deltaVec.angle(me.leftBound);

        var newPos = {x: deltaVec.x, y:deltaVec.y};



        if (boundsAngle > 0){
            if(positionAngle < boundsAngle && positionAngle > 0){
                previousPos.clone(newPos);
                return newPos;
            } else if (positionAngle > boundsAngle){
                previousPos.clone(me.rightBound);
                return me.rightBound;
            } else {
                previousPos.clone(me.leftBound);
                return me.leftBound;
            }
        } else {
            if (positionAngle < 0 && positionAngle > boundsAngle){
                previousPos.clone(newPos);
                return newPos;
            } else if (positionAngle <= boundsAngle){
                previousPos.clone(me.rightBound);
                return (me.rightBound);
            } else {
                previousPos.clone(me.leftBound);
                return me.leftBound;
            }
        }
    };

    /**
     * This function returns a velocity clamped by the max velocity
     * @param {number} delta
     */
    var getClampedVelocity = function(delta){
        if(Math.abs(delta) > maxVelocity){
            if(delta < 0){
                return -1 * maxVelocity;
            }else {
                return maxVelocity;
            }

        }
        return delta;
    };

    /**
     * This function takes the passed left bounds and claculates the bound taking into account
     * the paddle radius. (Hint, the from bound is the bound you are calculating)
     * @param {Physics.vector} from
     * @param {Physics.vector} to
     */
    var computeBound = function(from, to){
        var bound = new Physics.vector(0,0).clone(to);
        bound.vsub(from).normalize().mult(config.radius).vadd(from);
        return bound;
    };

    /**
     *
     * @param {Physics.vector} leftBound
     * @param {Physics.vector} rightBound
     */
    var computeAngle = function (leftBound, rightBound){
        var angleVector = new Physics.vector(0,0).clone(rightBound);
        angleVector.vsub(leftBound);
        var angle = angleVector.angle();
        if (angle >= 0){
            angle += Math.PI/8;
        } else {
            angle -= Math.PI/8;
        }
        return angle;
    };

    // Initialization
    this.goalLeftBound = new Physics.vector(config.leftBound.x, config.leftBound.y);
    this.goalRightBound = new Physics.vector(config.rightBound.x, config.rightBound.y);
    this.radius = config.radius;

    this.leftBound = computeBound(this.goalLeftBound, this.goalRightBound);
    this.rightBound = computeBound(this.goalRightBound, this.goalLeftBound);
    var maxVelocity = config.maxVelocity;
    var me = this;

    this.body = Physics.body('convex-polygon',
        {
            x: config.body.state.pos.x,
            y: config.body.state.pos.y,
            vertices: Physics.geometry.regularPolygonVertices(8, config.radius),
            treatment: 'kinematic',
            styles: StyleCommons.paddleStyle
        }
    );

    this.body.state.angular.pos = computeAngle(this.leftBound, this.rightBound);
    previousPos.clone(this.body.state.pos);
};



module.exports = Paddle;