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
     *
     * @return {Ball} The new Ball.
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

        var ball = new Ball(ballConfig);
        balls.push(ball);

        return ball;
    };

    /**
     * @param {Number} id
     * @return {Ball} Ball identified by id.
     */
    this.getBall = function (id) {
        return _.find(balls, function (ball) { return ball.id === id; });
    };

    /**
     * @param {Number} id
     * @returns {boolean} True iff the model has the ball identified by id.
     */
    this.hasBall = function (id) {
        return this.getBall(id) !== undefined;
    };

    /**
     * @returns {Number} The number of balls in the model.
     */
    this.ballCount = function () {
        return balls.length;
    };

    /**
     * Change the state of the identified ball to match the supplied state.
     *
     * @param {Number} id
     * @param newState (See Ball constructor config). **id field is ignored!**
     */
    this.updateBall = function (id, newState) {
        if (newState.id != null) {
            delete newState.id;
        }

        var ball = this.getBall(id);
        if (ball != null) {
            _.assign(ball, newState);
        }
    };

    /**
     * Delete the identified ball from the model.
     *
     * @param {Number} id
     */
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

