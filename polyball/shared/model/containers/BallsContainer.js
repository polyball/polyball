/**
 * Created by ryan on 17/05/16.
 */

var _ = require('lodash');
var ArrayHelper = require('polyball/shared/utilities/ArrayHelper');
var IdGenerator = require('polyball/shared/utilities/IdGenerator');
var Ball = require('polyball/shared/model/Ball');
var Util = require('polyball/shared/utilities/Util');

/**
 * Initializes the BallContainer
 * @property {world} Physics.world
 * @constructor
 */
var BallContainer = function (config) {

    /**
     * @type {Ball[]}
     */
    var balls = [];

    var world = config.world;
    var IdGen = new IdGenerator();

    /**
     * Add a ball to the model.
     *
     * @param {Object} config - see Ball constructor
     * @property {Number} [config.id] - Optional.  Should not be passed on the server, should always be passed on the client.
     * @return {Ball} The new Ball.
     */
    this.addBall  = function (config) {

        var newConfig = {
            id: config.id ? config.id : IdGen.nextID(),
        };

        _.assign(newConfig, config);

        var ball = new Ball(newConfig);
        balls.push(ball);

        world.addBody(ball.body);

        return ball;
    };

    /**
     * @param {Number|Predicate} id - Either the ID of the Ball, or a boolean returning callback that takes a Ball.
     * @return {Ball} Ball identified by id.
     */
    this.getBall = function (id) {
        return ArrayHelper.findSingle(balls, id);
    };

    /**
     * Get all balls satisfying the predicate callback.
     * @param {Predicate} [predicate]  Callback to evaluate for each ball. (matches all if null.)
     * @returns {Ball[]} All balls matching the predicate. (may be empty.)
     */
    this.getBalls = function (predicate) {
        return ArrayHelper.findAll(balls, predicate);
    };

    /**
     * @param {Number|Predicate} id - Either the ID of the Ball, or a boolean returning callback that takes a Ball.
     * @returns {boolean} True iff the model has the ball identified by id.
     */
    this.hasBall = function (id) {
        return this.getBall(id) != null;
    };

    /**
     * @returns {Number} The number of balls in the model.
     */
    this.ballCount = function () {
        return balls.length;
    };

    /**
     * Delete the identified ball from the model.
     *
     * @param {Number} id
     */
    this.deleteBall = function (id) {
        var ball = ArrayHelper.removeByID(balls, id);

        if (ball != null) {
            world.removeBody(ball.body);
        }
    };

    /**
     * Delete all balls from the model.
     */
    this.clearBalls = function () {
        var ballIDs = _.map(balls, function (ball) { return ball.id; });

        var me = this;
        ballIDs.forEach(function (id) {
            me.deleteBall(id);
        });
    };

    /**
     * Gets the config object for the enclosed balls collection
     * @returns {Object}
     */
    this.ballsConfig = function () {
        if (balls.length > 0){
            return Util.arrayToConfig(balls);
        }
    };

};

module.exports  = BallContainer;
