"use strict";

var _ = require('lodash');
var Physics = require('physicsjs');
var Logger = require('polyball/shared/Logger');
var Arena = require('polyball/shared/model/Arena');
var Ball = require('polyball/shared/model/Ball');
var Spectator = require('polyball/shared/model/Spectator');
var Player = require('polyball/shared/model/Player');
//var Paddle = require('polyball/shared/model/Paddle');


/**
 * Holds all data for client and server game instances.  Exposes CRUD operations for data.
 *
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

    var world = Physics();
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
     * @type {Spectator[]}
     */
    var playerQueue = [];

    //var powerups = [];
    //var election = undefined;

    //
    //             PRIVATE METHODS
    //
    ///////////////////////////////////////////////////////////////////////////

    var nextID = (function () {
        var nextID = 0;

        return function () {
            return nextID++;
        };
    }());

    /**
     * Search an array for an element by its id.
     * @template T
     * @param {T[]} array The array to search
     * @param {Number} id The id of the desired element (in field `element.id`)
     * @returns {T} The identified array element (or undefined).
     */
    var findByID = function (array, id) {
        return _.find(array, function (element) { return element.id === id; });
    };

    /**
     * Search an array and get all elements by a given predicate.
     * @template T
     * @param {T[]} array The array to search
     * @param {Predicate} [predicate] The boolean-returning predicate callback to filter by.
     * @returns {T[]} All elements of the array matching the predicate
     */
    var findAll = function (array, predicate) {
        if (predicate == null) {
            return Array.apply(undefined, array);
        }
        return _.filter(array, predicate);
    };

    /**
     * Search for an element by id in an array, and assign all properties from newState if found.
     * @param {Array} array The array to search.
     * @param {Number} id The id of the desired element (in field `element.id`)
     * @param {Object} newState The new state for the update (object structure must match source structure).
     */
    var updateByID = function (array, id, newState) {
        if (newState.id != null) {
            delete newState.id;
        }

        var element = findByID(array, id);
        if (element != null) {
            _.assign(element, newState);
        }
    };

    /**
     * Remove element from array by its id.
     * @template T
     * @param {Array} array The array to search
     * @param {Number} id The id of the desired element (in field `element.id`)
     * @return {T} The removed object, null if not found.
     */
    var removeByID = function (array, id) {
        var removed = _.remove(array, function (element) { return element.id === id; });
        if (removed.length > 1) {
            Logger.error("More than one object of id " + id + " found in array " + array);
        }

        return removed[0];
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
     * If there is not yet an arena in the model, add one according to the config.
     * If there is an arena in the model, replace it with a new one from the config.
     * @param {Object} config (See Arena constructor.)
     * @return {Arena} The new arena
     */
    this.addOrResetArena = function (config) {
        if (arena != null) {
            // clear out old arena
            world.remove(arena.getBumpers());
            world.remove(arena.getGoals());
        }

        arena = new Arena(config);

        world.add(arena.getBumpers());
        world.add(arena.getGoals());

        return arena;
    };

    /**
     * @return {Arena} The current arena.
     */
    this.getArena = function () {
        return arena;
    };

    /**
     * @returns {World}
     */
    this.getWorld = function () {
        return world;
    };

    //
    //             BALLS
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Add a ball at the centre of the arena with a random velocity.
     *
     * @return {Ball} The new Ball.
     */
    this.addBall  = function () {
        var ballConfig = {
            id: nextID(),
            x: 0,
            y: 0,
            vx: 0.1,
            vy: 0.1,
            radius: 1
        };

        var ball = new Ball(ballConfig);
        balls.push(ball);

        world.addBody(ball.body);

        return ball;
    };

    /**
     * @param {Number} id
     * @return {Ball} Ball identified by id.
     */
    this.getBall = function (id) {
        return findByID(balls, id);
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
     * @param {Number} id
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
        var ball = _.remove(balls, function (ball) { return ball.id === id; });

        if (ball != null) {
            world.removeBody(ball.body);
        }
    };

    //
    //             SPECTATORS
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Adds a spectator to the model.
     * @param {Client} client The client information for the Spectator.
     * @return {Spectator} The new Spectator.
     */
    this.addSpectator = function (client) {
        var spectatorConfig = {
            id: nextID(),
            client: client
        };

        var spectator = new Spectator(spectatorConfig);
        spectators.push(spectator);

        return spectator;
    };

    /**
     * @param {Number} id The id of the spectator.
     * @return {Spectator} The spectator from the model (undefined if not found).
     */
    this.getSpectator = function (id) {
        return findByID(spectators, id);
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
     * @param {Number} id
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
     * Change the state of the identified spectator to match the supplied state.
     *
     * @param {Number} id
     * @param newState (See Spectator constructor config). **id field is ignored!**
     */
    this.updateSpectator = function (id, newState) {
        updateByID(spectators, id, newState);
    };

    /**
     * Delete the identified spectator from the model.
     *
     * @param {Number} id
     */
    this.deleteSpectator = function (id) {
        removeByID(spectators, id);
    };

    /**
     * Add a spectator to the end of the player queue
     *
     * @param {Number} id
     */
    this.addToPlayerQueue = function (id) {
        if (!findByID(playerQueue, id)) {
            playerQueue.push(findByID(spectators, id));
        }
    };

    /**
     * Remove a spectator from the player queue
     * @param {Number} id
     */
    this.removeFromPlayerQueue = function (id) {
        removeByID(playerQueue, id);
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
        return playerQueue.slice();
    };

    //
    //             PLAYERS
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Adds a player to the model.
     * @param {Client} client The client information for the Player.
     * @return {Player} The new Player.
     */
    this.addPlayer = function (client) {
        var playerConfig = {
            id: nextID(),
            client: client
        };

        var player = new Player(playerConfig);
        players.push(player);

        return player;
    };

    /**
     * @param {Number} id The id of the player.
     * @return {Player} The player from the model (undefined if not found).
     */
    this.getPlayer = function (id) {
        return findByID(players, id);
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
     * @param {Number} id
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
     * Change the state of the identified player to match the supplied state.
     *
     * @param {Number} id
     * @param newState (See Player constructor config). **id field is ignored!**
     */
    this.updatePlayer = function (id, newState) {
        updateByID(players, id, newState);
    };

    /**
     * Delete the identified player from the model.
     *
     * @param {Number} id
     */
    this.deletePlayer = function (id) {
        removeByID(players, id);
    };

    //
    //             SNAPSHOT
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * @return
     */
    this.getSnapshot = function() {

    };
};


/**
 * A callback that returns true or false.
 * @callback Predicate
 * @param {Object} Instance of the type being queried.
 * @return {Boolean}
 */


module.exports = Model;

