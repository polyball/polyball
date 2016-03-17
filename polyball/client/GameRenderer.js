/**
 * Created by Jared Rewerts on 3/15/2016.
 */
"use strict";

var Pixi = require('pixi.js');
var Physics = require('physicsjs');

/***
 *
 * @param {{
 *  model: Model
 * }}
 * config
 * @constructor
 */
var GameRenderer = function(config) {
    window.PIXI = Pixi;

    this.renderer = Physics.renderer('pixi', {
        el: 'viewport'
    });

    var model = config.model;

    var world = model.getWorld();
    world.add(this.renderer);

    // ################  PUBLIC METHODS ########### //
    // ############################################ //

    this.render = function() {
        world.render();
    };

    this.resize = function(width, height) {
        this.renderer.resize(width, height);
    };
};

module.exports = GameRenderer;