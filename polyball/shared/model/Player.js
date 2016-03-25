/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Paddle = require('polyball/shared/model/Paddle');
var Client = require('polyball/shared/model/Client');

/**
 * Each player owns it's own paddle. The already created paddle is passed into
 * the constructor of Player in config.
 * @param {Object} config
 * @param {number} config.id
 * @param {number} [config.arenaPosition] - Optional.  The integer position of the player on an Arena.
 * @param {Object} [config.paddleConfig] - Optional.
 * @param {Object} config.clientConfig
 * @constructor
 */
var Player = function(config) {
    this.id = config.id;
    this.paddle = config.paddleConfig != null ? new Paddle(config.paddleConfig) : null;
    this.arenaPosition = config.arenaPosition;
    this.client = new Client(config.clientConfig);
    this.score = 0;
    this.lastSequenceNumberAccepted=0;

    /**
     * Converts this player object into it's config (serializable) form
     * @return {Object}
     */
    this.toConfig = function (){
        return {
            id: this.id,
            paddleConfig: this.paddle != null ? this.paddle.toConfig() : null,
            arenaPosition: this.arenaPosition,
            clientConfig: this.client.toConfig(),
            score: this.score
        };
    };

    /**
     * Adds a paddle to this player
     * @param {Object} paddleConfig
     * @return {Paddle}
     */
    this.addPaddle = function(paddleConfig){
        this.paddle = new Paddle(paddleConfig);
        return this.paddle;
    };
};

module.exports = Player;