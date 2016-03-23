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
 * @property {number} config.maxVelocity
 * @property {number} config.body.radius
 * @property {number} config.body.state.pos.x
 * @property {number} config.body.state.pos.y
 * @property {Object} config.body.styles
 * @constructor
 */
var Paddle = function(config){

    /**
     * Gets us the same instance of a Physics scratchpad for performant vector calculations
     * @returns {Physics.scratchpad}
     */
    var getScratchpad = function(){
        if (scratchPad == null){
            scratchPad = Physics.scratchpad();
        }
        return scratchPad;
    };

    /**
     * Clamps the velocity of the paddle
     */
    var setMaxVel = function(){
        var scratch = getScratchpad();

        var maxVelVect = scratch.vector().set(me.rightBound.x, me.rightBound.y);
        maxVelVect.vsub(me.leftBound);

        maxVelVect.normalize().mult(maxVelocity);
        var minVelVect = maxVelVect.clone().negate();

        me.body.state.vel.clamp(minVelVect, maxVelVect);
    };

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

    /**
     * sets the position of the paddle
     * @param {Number} delta - The change in X position (from the mouse)
     */
    this.setPosition = function(delta) {
        //this.body.state.pos.x = x;
        //this.body.state.pos.y = y;
        var scratch = getScratchpad();

        //Delta Calculation
        var bounds = scratch.vector().set(me.rightBound.x, me.rightBound.y);
        bounds.vsub(me.leftBound);

        var deltaVec = scratch.vector().set(bounds.x, bounds.y);
        deltaVec.normalize();
        deltaVec.mult(delta);

        //Next Position Calculation
        deltaVec.vadd(me.leftBound);

        var boundsAngle = me.leftBound.angle(me.rightBound);
        var positionAngle = me.leftBound.angle(deltaVec);

        var movePaddle = function(){
            me.body.state.pos.x = deltaVec.x;
            me.body.state.pos.y = deltaVec.y;
        };

        if (boundsAngle < Math.PI){
            if(positionAngle < boundsAngle){
                movePaddle();
            }
        } else {
            if (positionAngle > bounds && positionAngle < Math.PI *2){
                movePaddle();
            }
        }

        setMaxVel();
    };


    // Initialization
    this.leftBound = new Physics.vector(config.leftBound.x, config.leftBound.y);
    this.rightBound = new Physics.vector(config.rightBound.x, config.rightBound.y);
    var maxVelocity = config.maxVelocity;
    var scratchPad;
    var me = this;

    this.body = Physics.body('circle',
        {
            x: config.body.state.pos.x,
            y: config.body.state.pos.y,
            radius: config.body.radius,
            treatment: 'static',
            styles: config.body.styles
        }
    );


};



module.exports = Paddle;