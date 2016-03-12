/**
 * Created by Jared Rewerts on 3/7/2016.
 */
"use strict";

/**
 * Each player owns it's own paddle. The already created paddle is passed into
 * the constructor of Player in config.
 *
 * @param {{id: number,
 *          paddle: Paddle
 *          client: Client}} config
 * @constructor
 */
var Player = function(config) {
    this.id = config.id;
    this.paddle = config.paddle;
    this.client = config.client;
    this.score = 0;
};

module.exports = Player;