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

    // ################  PRIVATE METHODS ########### //
    // ############################################ //


    // ################  PUBLIC METHODS ########### //
    // ############################################ //

    this.render = function() {
        world.render();
    };

    this.resize = function(width, height) {
        this.renderer.resize(width, height);
    };

    // ################  CONSTRUCTOR  ############# //
    // ############################################ //
    var model = config.model;

    window.PIXI = Pixi;

    this.renderer = Physics.renderer('pixi', {
        el: 'viewport'
    });

    this.renderer.renderer = new Pixi.autoDetectRenderer(1000, 1000, {
        view: this.renderer.renderer.view,
        transparent: true,
        resolution: config.pixelRatio || 1,
        antialias: true
    });

    var world = model.getWorld();
    world.add(this.renderer);
};

module.exports = GameRenderer;