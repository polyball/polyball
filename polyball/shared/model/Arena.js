/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");


/**
 * @param {{numberPlayers: number,
 * arenaRadius: number}} config
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
     * TODO: Implement this
     * @param playerId: number
     * @returns {Physics.vector}
     */
    this.getScorePosition = function(playerId) {
        var theta = 2* Math.PI / this.numberPlayers;
        var thetaOffset = getOffset(this.numberPlayers);

        var midX = this.getCenter().x;
        var midY = this.getCenter().y;

        return getCoordinates(theta * playerId + thetaOffset, this.arenaRadius, midX, midY);
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



    // Constructor


    this.numberPlayers = config.numberPlayers;
    this.arenaRadius = config.arenaRadius;
    this.bumperRadius = config.bumperRadius;
    this.marginX = config.marginX;
    this.marginY = config.marginY;

    this.goals = [];
    this.bumpers = [];
    this.points = [];

    var colors = {
        black: '0x171717',
        blue: '0x1d6b98',
        blueDark: '0x14546f',
        red: '0xdc322f',
        redDark: '0xa42222'
    };

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
            styles: {
                fillStyle: colors.red
            }
        }));

        this.bumpers.push(
            Physics.body('circle', {
                x: this.points[j].x,
                y: this.points[j].y,
                radius: this.bumperRadius,
                treatment: 'static',
                styles: {
                    fillStyle: colors.blue
                }
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