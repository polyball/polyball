/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");
var Util = require('polyball/shared/Util');
var StyleCommons = require('polyball/shared/StyleCommons');

/**
 * @param {Object} config
 * @property {number} config.id
 * @property {number} config.numberPlayers
 * @property {number} config.arenaRadius
 * @property {number} config.bumperRadius
 * @property {number} config.marginX
 * @property {number} config.marginY
 * @constructor
 */
var Arena = function(config) {
    //
    //    ########  ########  #### ##     ##    ###    ######## ########
    //    ##     ## ##     ##  ##  ##     ##   ## ##      ##    ##
    //    ##     ## ##     ##  ##  ##     ##  ##   ##     ##    ##
    //    ########  ########   ##  ##     ## ##     ##    ##    ######
    //    ##        ##   ##    ##   ##   ##  #########    ##    ##
    //    ##        ##    ##   ##    ## ##   ##     ##    ##    ##
    //    ##        ##     ## ####    ###    ##     ##    ##    ########
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Gets the coordinates of a given position.
     * Used internally to get locations for bumpers and goals.
     * @param theta: number
     * @param radius: number
     * @param midX: number
     * @param midY: number
     * @returns {Physics.vector}
     */
    var getCoordinates = function(theta, radius, midX, midY) {

        var x = midX + radius * Math.cos(theta);
        var y = midY - radius * Math.sin(theta);

        return new Physics.vector(x, y);
    };

    /**
     * Calculates the offset for the arena.
     * The first goal drawn is the player at the very bottom of the screen.
     * @returns {number}
     */
    var getOffset = function(numPlayers) {
        return (3/2) * Math.PI - (2 * Math.PI / numPlayers) / 2;
    };


    //
    //    ########  ##     ## ########  ##       ####  ######
    //    ##     ## ##     ## ##     ## ##        ##  ##    ##
    //    ##     ## ##     ## ##     ## ##        ##  ##
    //    ########  ##     ## ########  ##        ##  ##
    //    ##        ##     ## ##     ## ##        ##  ##
    //    ##        ##     ## ##     ## ##        ##  ##    ##
    //    ##         #######  ########  ######## ####  ######
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * This returns the location of the players score interface in arena physical coordinates.
     * This will be used to draw the HUD.
     * @param position: number
     * @returns {Physics.vector}
     */
    this.getScorePosition = function(position) {
        var theta = 2* Math.PI / this.numberPlayers;
        var thetaOffset = 3/2 * Math.PI;

        var midX = this.getCenter().x;
        var midY = this.getCenter().y;

        return getCoordinates(theta * position + thetaOffset, this.arenaRadius, midX, midY);
    };

    /**
     * Gets the center of the arena.
     * @returns {Physics.vector}
     */
    this.getCenter = function() {
        return new Physics.vector(this.arenaRadius + this.marginX, this.arenaRadius + this.marginY);
    };

    /**
     * Gets the radius of the arena (including the arena margin).
     * @returns {number|*}
     */
    this.getRadius = function() {
        return this.arenaRadius;
    };

    /**
     * Grabs a bumper. The index should be that players left bumper.
     * @param index: number
     * @returns {Physics.body}
     */
    this.getBumper = function(index) {
        return this.bumpers[index];
    };

    /**
     * Returns the players goal given by index.
     * @param index: number
     * @returns {Physics.body}
     */
    this.getGoal = function(index) {
        return this.goals[index];
    };

    /**
     * Returns the rotation of a players goal.
     * @param index: number
     * @returns {number}
     */
    this.getGoalRotation = function(index) {
        return this.goals[index].rotation;
    };

    /**
     * Get an array containing all of the bumpers in the arena.
     * @return {Physics.body[]}
     */
    this.getBumpers = function () {
        return Array.apply(undefined, this.bumpers);
    };

    /**
     * Get an array containing all of the goals in the arena.
     * @return {Physics.body[]}
     */
    this.getGoals = function () {
        return Array.apply(undefined, this.goals);
    };

    /**
     * Get the arena's id
     * @returns {Number}
     */
    this.getID = function () {
        return this.id;
    };

    /**
     * Generate a physics state at the center of the arena with a random velocity.
     *
     * @returns {{pos: {x: Number, y: Number}, vel: {x: Number, y: Number}}}
     */
    this.generateNewBallState = function (speed) {

        speed = speed == null || speed < 1 ? 1 : speed;


        var velocity = Physics.vector(0, 1);

        velocity.mult(speed);
        velocity.rotate(Util.getRandomArbitrary(0, 2 * Math.PI));

        var position = this.getCenter();

        return {
            pos: {
                x: position.x,
                y: position.y
            },
            vel: {
                x: velocity.x,
                y: velocity.y
            }
        };
    };

    /**
     * This returns the left paddle bound for a given index
     * @param {number} index
     * @returns {Physics.vector}
     */
    this.getPaddleLeftBound = function (index){
        var leftBumper = this.getBumper(index).state.pos;
        var rightBumper = this.getBumper((index+1) % this.numberPlayers).state.pos;

        var leftBound = new Physics.vector(leftBumper.x, leftBumper.y);
        var rightBound = new Physics.vector(rightBumper.x, rightBumper.y);


        var position = rightBound.clone();

        position.vsub(leftBound);
        position.normalize();
        position.mult(this.bumperRadius);

        return leftBound.vadd(position);

    };

    /**
     * This returns the right paddle bound for a given index
     * @param {number} index
     * @returns {Physics.vector}
     */
    this.getPaddleRightBound = function (index){
        var leftBumper = this.getBumper(index).state.pos;
        var rightBumper = this.getBumper((index+1) % this.numberPlayers).state.pos;

        var leftBound = new Physics.vector(leftBumper.x, leftBumper.y);
        var rightBound = new Physics.vector(rightBumper.x, rightBumper.y);


        var position = leftBound.clone();

        position.vsub(rightBound);
        position.normalize();
        position.mult(this.bumperRadius);

        return rightBound.vadd(position);
    };

    /**
     * This function returns the starting paddle position for a given arena index
     * @param {number} index
     * @returns {{body}}
     */
    this.getPaddleStartPosition = function (index){

        var leftBound = this.getPaddleLeftBound(index);
        var rightBound = this.getPaddleRightBound(index);

        var position = leftBound.clone();
        position.vsub(rightBound);
        position.mult(0.5);
        position.vadd(rightBound);

        return {
                x: position.x,
                y: position.y
        };
    };

    /**
     * Converts this arena object into it's config (serializable) form
     * @return {Object}
     */
    this.toConfig = function () {
        return {
            id: this.id,
            numberPlayers: this.numberPlayers,
            arenaRadius: this.arenaRadius,
            bumperRadius: this.bumperRadius,
            marginX: this.marginX,
            marginY: this.marginY
        };
    };

    // Constructor


    this.id = config.id;
    this.numberPlayers = config.numberPlayers;
    this.arenaRadius = config.arenaRadius;
    this.bumperRadius = config.bumperRadius;
    this.marginX = config.marginX;
    this.marginY = config.marginY;

    this.goals = [];
    this.bumpers = [];
    this.points = [];

    var midX = this.getCenter().x;
    var midY = this.getCenter().y;

    var theta = 2* Math.PI / this.numberPlayers;
    var thetaOffset = getOffset(this.numberPlayers);

    for (var i = 0; i < this.numberPlayers; i++) {
        this.points.push(getCoordinates(theta * i + thetaOffset, this.arenaRadius, midX, midY));
    }

    // Build the circular bumpers. These won't have any special collision detection.
    this.bumpers = [];

    var goalWidth = this.points[1].x - this.points[0].x;
    for (var j = 0; j < this.numberPlayers; j++) {
        var curr = j % this.numberPlayers;
        var next = (j + 1) % this.numberPlayers;

        var xCenter = (this.points[curr].x + this.points[next].x) / 2;
        var yCenter = (this.points[curr].y + this.points[next].y) / 2;

        this.goals.push(Physics.body('rectangle', {
            x: xCenter,
            y: yCenter,
            angle: -theta * curr,
            width: goalWidth,
            height: 30,
            treatment: 'static',
            cof: 0,
            styles: StyleCommons.goalStyle
        }));

        this.bumpers.push(
            Physics.body('circle', {
                x: this.points[j].x,
                y: this.points[j].y,
                radius: this.bumperRadius,
                treatment: 'static',
                cof: 0,
                styles: StyleCommons.bumperStyle
            })
        );
    }
};

/**
 * @external Physics.vector See http://wellcaffeinated.net/PhysicsJS/docs/#Physics-vector
 */

/**
 * @external Physics.body http://wellcaffeinated.net/PhysicsJS/docs/#Physics-body
 */

module.exports = Arena;