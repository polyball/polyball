/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";
require('socket');

/**
 * Each player owns it's own paddle. The already created paddle is passed into
 * the constructor of Player in config.
 * @param {{id: number,
 *          paddle: Paddle
 *          socket: Socket}} config
 * @constructor
 */
var Player = function(config) {
    this.id = config.id;
    this.score = 0;
    this.paddle = config.paddle;
    this.socket = config.socket;
};

module.exports = Player;