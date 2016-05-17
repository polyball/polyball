"use strict";

var _ = require('lodash');
var Physics = require('physicsjs');
var Logger = require('polyball/shared/Logger');
var Arena = require('polyball/shared/model/Arena');
var Ball = require('polyball/shared/model/Ball');
var Spectator = require('polyball/shared/model/Spectator');
var Player = require('polyball/shared/model/Player');
var Util = require('polyball/shared/utilities/Util');
var PowerupFactory = require('polyball/shared/powerups/PowerupFactory'); // jshint ignore:line
var EngineStatus = require('polyball/shared/EngineStatus.js');
var PowerupElection = require('polyball/shared/powerups/PowerupElection');

/**
 * Holds all data for client and server game instances.  Exposes CRUD operations for data.
 * @constructor
*/
var Model = function () {

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



    //
    //             PRIVATE STATE
    //
    ///////////////////////////////////////////////////////////////////////////

    var world = Physics({maxIPF: 10000});

    /**
     * The number of milliseconds in the current round.
     * @type {Number}
     */
    var roundLength;

    /**
     * The number of milliseconds elapsed in the current round.
     * @type {Number}
     */
    var currentRoundTime;

    /**
     * @type {Arena}
     */
    var arena;

    /**
     * @type {Player[]}
     */
    var players = [];
    /**
     * @type {Spectator[]}
     */
    var spectators = [];

    /**
     * @type {Ball[]}
     */
    var balls = [];

    /**
     * @type {Number[]}
     */
    var playerQueue = [];

    /**
     * @type {Object[]}
     */
    var powerups = [];

    /**
     * @type PowerupElection
     */
    this.powerupElection;

    /**
     * IGNORED BY SERVER.
     * The Player (or Spectator) Client id for the client machine.
     * @type Number
     */
    var localClientID;

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
    this.gameStatus = EngineStatus.gameInitializing;
    this.collisionsPruner = null;



    /**
     * @returns {World}
     */
    this.getWorld = function () {
        return world;
    };

    /**
     * The round length in milliseconds.
     * @returns {Number}
     */
    this.getRoundLength = function () {
        return roundLength;
    };

    /**
     * Set the round length in milliseconds.
     * @param newRoundLength
     */
    this.setRoundLength = function (newRoundLength) {
        roundLength = newRoundLength;
    };

    /**
     * The current time elapsed in the round.
     * @returns {Number}
     */
    this.getCurrentRoundTime = function () {
        return currentRoundTime;
    };

    /**
     * Set the current round elapsed time.
     * @param newCurrentTime
     */
    this.setCurrentRoundTime = function (newCurrentTime) {
        currentRoundTime = newCurrentTime;
    };

    /**
     * IGNORED BY SERVER.
     * Get the Player or Spectator Client ID for the local client machine.
     * @returns {Number}
     */
    this.getLocalClientID = function () {
        return localClientID;
    };

    /**
     * IGNORED BY SERVER.
     * Set the Player or Spectator Client ID for the local client machine.
     * @param {Number} newID
     */
    this.setLocalClientID = function (newID) {
        localClientID = newID;
    };

    //
    //             BALLS
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Add a ball to the model.
     *
     * @param {Object} config - see Ball constructor
     * @property {Number} [config.id] - Optional.  Should not be passed on the server, should always be passed on the client.
     * @return {Ball} The new Ball.
     */
    this.addBall  = function (config) {

        var newConfig = {
            id: config.id ? config.id : nextID(),
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
        return findSingle(balls, id);
    };

    /**
     * Get all balls satisfying the predicate callback.
     * @param {Predicate} [predicate]  Callback to evaluate for each ball. (matches all if null.)
     * @returns {Ball[]} All balls matching the predicate. (may be empty.)
     */
    this.getBalls = function (predicate) {
        return findAll(balls, predicate);
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
        var ball = removeByID(balls, id);

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

    //
    //             SPECTATORS
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Adds a spectator to the model.
     * @param {Object} config - A Spectator config.  See constructor.
     * @property {Number} [config.id] - Optional.  Should not be passed on the server, should always be passed on the client.
     * @return {Spectator} The new Spectator.
     */
    this.addSpectator = function (config) {
        var spectatorConfig = {
            id: config.id ? config.id : nextID()
        };

        _.assign(spectatorConfig, config);

        var spectator = new Spectator(spectatorConfig);
        spectators.push(spectator);

        return spectator;
    };

    /**
     * @param {Number|Predicate} id - Either the ID of the Spectator, or a boolean returning callback that takes a Spectator.
     * @return {Spectator} The spectator from the model (undefined if not found).
     */
    this.getSpectator = function (id) {
        return findSingle(spectators, id);
    };

    /**
     * Get all spectators satisfying the predicate callback.
     * @param {Predicate} [predicate]  Callback to evaluate for each spectator.  (matches all if null.)
     * @returns {Spectator[]} All spectators matching the predicate. (may be empty.)
     */
    this.getSpectators = function (predicate) {
        return findAll(spectators, predicate);
    };

    /**
     * @param {Number|Predicate} id - Either the ID of the Spectator, or a boolean returning callback that takes a Spectator.
     * @returns {boolean} True iff the model has the spectator identified by id.
     */
    this.hasSpectator = function (id) {
        return this.getSpectator(id) != null;
    };

    /**
     * @returns {Number} The number of spectators in the model.
     */
    this.spectatorCount = function () {
        return spectators.length;
    };

    /**
     * Delete the identified spectator from the model.
     *
     * @param {Number} id
     */
    this.deleteSpectator = function (id) {
        removeByID(spectators, id);
        this.removeFromPlayerQueue(id);
    };

    //SRS Requirement - 3.2.1.13 Player Queue
    // The next 7 functions handle all of the CRUD operations for the player queue on the server side
    /**
     * Add a spectator to the end of the player queue
     *
     * @param {Number} id
     */
    this.addToPlayerQueue = function (id) {
        if (!findByID(spectators, id)) {
            Logger.error('Tried to add id to Player Queue that does not exist in spectators');
        }

        if (!findByID(players, id)){
            if (!_.includes(playerQueue, id)){
                playerQueue.push(id);
            }
        }

    };

    /**
     * Test if a spectator is queued to play.
     * @param {number} spectatorID - the id of the spectator.
     * @returns {boolean} true iff the spectator is queued.
     */
    this.hasQueuedPlayer = function (spectatorID) {
        return _.indexOf(playerQueue, spectatorID) !== -1;
    };

    /**
     * Remove a spectator from the player queue
     * @param {Number} id
     */
    this.removeFromPlayerQueue = function (id) {
        _.remove(playerQueue, function(queuedID) {return queuedID === id;});
    };


    /**
     * Returns how many players there are in the queue
     * @return {Number}
     */
    this.numberOfQueuedPlayers = function () {
        return playerQueue.length;
    };

    /**
     * Returns how many players there are in the queue
     * @return {Spectator[]}
     */
    this.getAllQueuedPlayers = function () {
        var out = [];
        playerQueue.forEach(function(x){out.push(findByID(spectators, x));});
        return out;
    };

    /**
     * Returns the first spectator in the player queue
     * @return {Spectator}
     */
    this.popPlayerQueue = function () {
        var id = playerQueue.shift();
        return findByID(spectators, id);
    };

    /**
     * Ignore the current queue and give the model a new one.  (For use with snapshots).
     * @param {Number[]} newQueue
     */
    this.setPlayerQueue = function (newQueue) {
        playerQueue = newQueue;
    };


    //
    //             PLAYERS
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Adds a player to the model.
     * @param {Object} config - A Player config.  See constructor.
     * @property {Number} [config.id] - Optional.  Should not be passed on the server, should always be passed on the client.
     * @return {Player} The new Player.
     */
    this.addPlayer = function (config) {
        var playerConfig = {
            id: config.id ? config.id : nextID()
        };

        _.assign(playerConfig, config);

        var player = new Player(playerConfig);
        players.push(player);

        
        if (player.paddle != null) {
            world.add(player.paddle.body);
        }

        return player;
    };

    /**
     * @param {Number|Predicate} id - Either the ID of the Player, or a boolean returning callback that takes a Player.
     * @return {Player} The player from the model (undefined if not found).
     */
    this.getPlayer = function (id) {
        return findSingle(players, id);
    };

    /**
     * Get all players satisfying the predicate callback.
     * @param {Predicate} [predicate]  Callback to evaluate for each player.  (matches all if null.)
     * @returns {Player[]} All players matching the predicate. (may be empty.)
     */
    this.getPlayers = function (predicate) {
        return findAll(players, predicate);
    };

    /**
     * @param {Number|Predicate} id - Either the ID of the Player, or a boolean returning callback that takes a Player.
     * @returns {boolean} True iff the model has the player identified by id.
     */
    this.hasPlayer = function (id) {
        return this.getPlayer(id) != null;
    };

    /**
     * @returns {Number} The number of players in the model.
     */
    this.playerCount = function () {
        return players.length;
    };

    /**
     * Delete the identified player from the model.
     *
     * @param {Number} id
     */
    this.deletePlayer = function (id) {
        var player = removeByID(players, id);
        if (player != null && player.paddle != null){
            var paddle = player.paddle;
            world.remove(paddle.body);
        }
    };

    /**
     * This adds a paddle to the player given by id
     * SRS Requirement - 3.2.2.6 Paddle Setup
     * @param {Object} config
     * @property {number} config.playerID
     * @property {Object} config.paddleConfig
     * @returns {Paddle} The paddle added to the player.
     */
    this.addPaddleToPlayer = function (config){
        var player = this.getPlayer(config.playerID);

        if (player == null) {
            Logger.warn('Cannot find player id in model - cannot add paddle to player.');
            return null;
        }

        if (player.paddle != null) {
            Logger.warn('Cannot add paddle to player that already has a paddle.');
            return null;
        }

        var paddle = player.addPaddle(config.paddleConfig);
        world.add(paddle.body);

        return paddle;
    };

    /**
     * Returns a paddle that belongs to the player given by id
     * @param {Number} playerID
     * @returns {Paddle} - The player's paddle.  Undefined if the player doesn't exist or if the player doesn't have a paddle yet.
     */
    this.getPaddle = function (playerID) {
        var player = this.getPlayer(playerID);

        if (player == null) {
            return undefined;
        }

        return player.paddle;
    };

    //
    //             Powerup Election
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Returns the internal instance of Powerup Election
     * @Returns {PowerupElection}
     */
    this.getPowerupElection = function (){
        return this.powerupElection;
    };

    /**
     * Sets the internal instance of Powerup Election
     * @param {PowerupElection} config
     */
    this.setPowerupElection = function(config){

        var newConfig = {
            id: config.id ? config.id : nextID()
        };

        _.assign(newConfig, config);

        this.powerupElection = new PowerupElection(newConfig);
    };

    /**
     * Stops the current powerup election
     */
    this.clearPowerupElection = function(){
        this.powerupElection = null;
    };


    //
    //             SNAPSHOT
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Converts this Model object into it's config (serializable) form
     * @return {Object}
     */
        // SRS Requirement - 3.2.1.9 Game Model Snapshot
        // This function serializing the entire game state snapshot
    this.getSnapshot = function() {

        var toConfig = function(variable) {
            return variable != null ? variable.toConfig() : null;
        };

        var snapshot = {
            arena: toConfig(arena),
            players: Util.arrayToConfig(players),
            spectators: Util.arrayToConfig(spectators),
            balls: Util.arrayToConfig(balls),
            playerQueue: playerQueue,
            powerups: Util.arrayToConfig(powerups),
            powerupElection: toConfig(powerupElection),
            roundLength: roundLength,
            currentRoundTime: currentRoundTime,
            gameStatus: this.gameStatus
        };

        snapshot.players.forEach(function (playerConfig) {
            delete playerConfig.clientConfig.socket;
        });

        snapshot.spectators.forEach(function (spectatorConfig) {
            delete spectatorConfig.clientConfig.socket;
        });

        return snapshot;
    };

    //
    //
    //  Reset / Cleanup
    //
    /////////////////////////////////////////////////////////////////////////////////

    this.reset = function(){
        world.pause();

        world.remove(world.getBodies());
        world.remove(world.getBehaviors());

        resetBalls();
        resetPaddles();
        world.unpause();
    };

    var resetBalls = function(){
        balls = [];
    };

    var resetPaddles = function(){
        players.forEach(function(player){
            player.paddle = null;
        });
    };
};


/**
 * A callback that returns true or false.
 * @callback Predicate
 * @param {Object} Instance of the type being queried.
 * @return {Boolean}
 */

module.exports = Model;

