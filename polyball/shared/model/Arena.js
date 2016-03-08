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
    this.numberPlayers = config.numberPlayers;
    this.arenaRadius = config.arenaRadius;

    this.goals = [];
    this.bumpers = [];
    this.points = [];

    var midX = this.arenaRadius;
    var midY = this.arenaRadius;

    var theta = 2* Math.PI / this.numberPlayers;
    var thetaOffset = (3/4) * Math.PI - theta / 2;

    for (var i = 0; i < this.numberPlayers; i++) {
        this.points.push(Arena.getCoordinates(theta * i + thetaOffset, this.arenaRadius, midX, midY));
    }

    // Build the circular bumpers. These won't have any special collision detection.
    this.bumpers = [];

    for (var j = 0; j < this.numberPlayers; j++) {
        this.bumpers.push(
            Physics.body('circle', {
                x: this.points[j].x,
                y: this.points[j].y,
                radius: 45,
                treatment: 'static'
            })
        );

        // Create the goals.
        if (j < this.numberPlayers - 1) {
            var xCenter = (this.points[j].x - this.points[j + 1].x) / 2;
            var yCenter = (this.points[j].y - this.points[j + 1].y) / 2;

            this.goals.push(Physics.body('rectangle', {
                x: xCenter,
                y: yCenter,
                angle: theta * j,
                width: this.points[j].x - this.points[j + 1].x,
                height: 20,
                mass: 20
            }));
        }
    }
};

/**
 * Gets the coordinates of a given position.
 * Used internally to get locations for bumpers and goals.
 * @param theta: number
 * @param radius: number
 * @param midX: number
 * @param midY: number
 * @returns {*|Physics.vector}
 */
Arena.getCoordinates = function(theta, radius, midX, midY) {

    var x = midX + radius * Math.cos(theta);
    var y = midY + radius * Math.sin(theta);

    return new Physics.vector(x, y);
};

/**
 * This returns the location of the players score interface in arena physical coordinates.
 * This will be used to draw the HUD. UNIMPLEMENTED
 * @param playerId: number
 */
Arena.prototype.getScorePosition = function(playerId) {
    return playerId;
};

/**
 * Gets the center of the arena.
 * @returns {center: Physics.vector}
 */
Arena.prototype.getCenter = function() {
    return new Physics.vector(this.radius, this.radius);
};

/**
 * Grabs a bumper. The index should be that players left bumper.
 * @param index: number
 * @returns {bumper: Physics.body}
 */
Arena.prototype.getBumper = function(index) {
    return this.bumpers[index];
};

/**
 * Returns the players goal given by index.
 * @param index: number
 * @returns {goal: Physics.body}
 */
Arena.prototype.getGoal = function(index) {
    return this.goals[index];
};

module.exports = Arena;