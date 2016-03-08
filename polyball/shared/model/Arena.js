/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Physics = require("physicsjs");

/**
 * @param config
 * @constructor
 */
var Arena = function(config) {
    this.numberPlayers = config.numberPlayers;
    this.arenaRadius = config.arenaRadius;

    this.goals = [];
    this.bumpers = [];
    // The angle each goal has relative to the mid point of the arena.
    //var theta = 2* Math.PI / this.numberPlayers;
    //var goalWidth = 2 * Math.sin(theta / 2) * this.arenaRadius;
    //var goalHeight = Math.cos(theta / 2) * this.arenaRadius;

    /*for (var i = 0; i < this.numberPlayers; i++) {
    }*/

    // Build the circular bumpers. These won't have any special collision detection.
    this.bumpers = [];

};

Arena.getCoordinates = function(theta, radius, midX, midY) {

    var x = midX + radius * Math.cos(theta);
    var y = midY + radius * Math.sin(theta);

    var rVal = {};
    rVal.x = x;
    rVal.y = y;
    return rVal;
};

/**
 * This returns the location of the players score interface in arena physical coordinates.
 * This will be used to draw the HUD.
 * @param playerId: number
 */
Arena.prototype.getScorePosition = function(playerId) {

};

module.exports = Arena;