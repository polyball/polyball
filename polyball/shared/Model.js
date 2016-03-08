"use strict"
var Physics = require('physicsjs');

var Ball = require('polyball/model/Ball');
var Paddle = require('polyball/model/Paddle');
var Player = require('polyball/model/Player');


/**
 *
 * @param {{
 *
 * }} config
 * @constructor
 */
var Model = function (config) {
    this.players = [];
    this.spectators = [];
    this.playerQueue = [];

    this.world = Physics();

    this.balls = [];
    this.powerups = [];
    this.election = undefined;
};

module.exports = Model;

