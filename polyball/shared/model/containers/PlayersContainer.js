/**
 * Created by ryan on 17/05/16.
 */

var Logger = require('polyball/shared/Logger');
var _ = require('lodash');
var ArrayHelper = require('polyball/shared/utilities/ArrayHelper');
var IdGenerator = require('polyball/shared/utilities/IdGenerator');
var Player = require('polyball/shared/model/Player');
var Util = require('polyball/shared/utilities/Util');

/**
 * Initializes the PlayerContainer
 * @property {Physics.world} config.world
 * @constructor
 */
var PlayerContainer = function (config) {
    var IdGen = new IdGenerator();
    var world = config.world;
    var self = this;

    /**
     * @type {Player[]}
     */
    var players = [];

    /**
     * Adds a player to the model.
     * @param {Object} config - A Player config.  See constructor.
     * @property {Number} [config.id] - Optional.  Should not be passed on the server, should always be passed on the client.
     * @return {Player} The new Player.
     */
    this.addPlayer = function (config) {
        var playerConfig = {
            id: config.id ? config.id : IdGen.nextID()
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
        return ArrayHelper.findSingle(players, id);
    };

    /**
     * Get all players satisfying the predicate callback.
     * @param {Predicate} [predicate]  Callback to evaluate for each player.  (matches all if null.)
     * @returns {Player[]} All players matching the predicate. (may be empty.)
     */
    this.getPlayers = function (predicate) {
        return ArrayHelper.findAll(players, predicate);
    };

    /**
     * @param {Number|Predicate} id - Either the ID of the Player, or a boolean returning callback that takes a Player.
     * @returns {boolean} True iff the model has the player identified by id.
     */
    this.hasPlayer = function (id) {
        return self.getPlayer(id) != null;
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
        var player = ArrayHelper.removeByID(players, id);
        if (player != null && player.paddle != null){
            var paddle = player.paddle;
            world.remove(paddle.body);
            player.paddle = null;
        }
    };

    /**
     * Delete the identified player from the model.
     * @param {Number} id
     */
    this.deletePaddle = function (playerID) {
        var player = ArrayHelper.findByID(players, playerID);
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
        var player = self.getPlayer(config.playerID);

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
        var player = self.getPlayer(playerID);

        if (player == null) {
            return undefined;
        }

        return player.paddle;
    };

    /**
     * A convenience method for resetting all player paddles
     */
    this.clearPaddles = function () {
        var playerIDs = _.map(players, function (player) { return player.id; });

        var me = this;
        playerIDs.forEach(function (id) {
            me.deletePaddle(id);
        });
    };

    /**
     * Gets the config object for the enclosed players collection
     * @returns {Object}
     */
    this.playersConfig = function () {
        return Util.arrayToConfig(players);
    };

};

module.exports = PlayerContainer;