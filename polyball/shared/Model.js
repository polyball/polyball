"use strict";

var _ = require('lodash');
//var Physics = require('physicsjs');

var Ball = require('polyball/shared/model/Ball');
//var Paddle = require('polyball/model/Paddle');
//var Player = require('polyball/model/Player');

var IDGenerator = function () {
    var nextID = 0;

    this.nextID = function () {
        return nextID++;
    };
};

var Model = function () {
    var ids = new IDGenerator();

    //var players = [];
    //var spectators = [];
    //var playerQueue = [];

    //var world = Physics();

    var balls = [];
    //var powerups = [];
    //var election = undefined;

    /**
     * Add a ball at the centre of the arena with a random velocity.
     */
    this.addBall  = function () {
        var ballConfig = {
            id: ids.nextID(),
            x: 0,
            y: 0,
            vx: 0.1,
            vy: 0.1,
            radius: 1
        };

        balls.push(new Ball(ballConfig));
    };

    /**
     * Gets a ball identified by ID.
     *
     * @param {number} id
     */
    this.getBall = function (id) {
        return _.find(balls, function (ball) { return ball.id === id; });
    };

    this.hasBall = function (id) {
        return this.getBall(id) !== undefined;
    };

    this.updateBall = function (id, newState) {
        var ball = this.getBall(id);
        if (ball != null) {
            _.assign(ball, newState);
        }
    };

    this.deleteBall = function (id) {
        _.remove(balls, function (ball) { return ball.id === id; });
    };

    this.addPlayer = function () {
    };

    /**
     * @return
     */
    this.getSnapshot = function() {

    };
};

module.exports = Model;

