/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

var Paddle = require('polyball/shared/model/Paddle');
var Client = require('polyball/shared/model/Client');
var Logger = require('polyball/shared/Logger');

/**
 * Each player owns it's own paddle. The already created paddle is passed into
 * the constructor of Player in config.
 * @param {Object} config
 * @param {number} config.id
 * @param {number} config.arenaPosition
 * @param {Object} config.paddle
 * @param {Object} config.client
 * @constructor
 */
var Player = function(config) {
    this.id = config.id;
    this.paddle = config.paddle != null ? new Paddle(config.paddle) : null;
    this.arenaPosition = config.arenaPosition;
    this.client = new Client(config.client);
    this.score = 0;

    /**
     * Converts this player object into it's config (serializable) form
     * @return {Object}
     */
    this.toConfig = function (){
        return {
            id: this.id,
            paddle: this.paddle != null? this.paddle.toConfig() : null,
            arenaPosition: this.arenaPosition,
            client: config.client,
            score: this.score
        };
    };

    if (this.paddle === null){
        Logger.warn('Created player(' + config.id + '): ' + config.client.name + ' without a paddle');
    }


};

module.exports = Player;