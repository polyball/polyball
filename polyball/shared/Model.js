"use strict";

var _ = require('lodash');
var Physics = require('physicsjs');
var Logger = require('polyball/shared/Logger');
var Player = require('polyball/shared/model/Player');
var Util = require('polyball/shared/utilities/Util');
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
     * @type {Player[]}
     */
    var players = [];


    /**
     * @type {Ball[]}
     */
    var balls = [];



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

