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

        if (model.getArena() !== undefined) {
            var center = model.getArena().getCenter();
            this.renderer.stage.pivot.set(center.x, center.y);
            this.renderer.stage.position.set(center.x, center.y);
        }

        var player = model.getPlayer(model.getLocalClientID());
        if (model.playerCount() > 0 && player !== undefined) {
            this.renderer.stage.rotation = 0;
            this.rotate(player.arenaPosition * 2*Math.PI / model.playerCount());
        }

        world.render();
    };

    this.resize = function(width, height) {
        this.renderer.resize(width, height);
    };

    this.rotate = function(radians) {
        var stage = this.renderer.stage;
        stage.rotation += radians;
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
        resolution: 1,
        antialias: true
    });

    var world = model.getWorld();
    world.add(this.renderer);
};

module.exports = GameRenderer;