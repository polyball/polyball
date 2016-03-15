/**
 * Created by Jared Rewerts on 3/15/2016.
 */
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

    this.render = function() {
        world.render();
    };
};

module.exports = GameRenderer;