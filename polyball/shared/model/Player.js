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

    if (this.paddle === null){
        Logger.warn('Created player(' + config.id + '): ' + config.client.name + ' without a paddle');
    }
};

module.exports = Player;