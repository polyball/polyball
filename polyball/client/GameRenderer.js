/**
 * Created by Jared Rewerts on 3/15/2016.
 */
"use strict";

var Pixi = require('pixi.js');
var PixiParticles = require('pixi-particles'); // jshint ignore:line
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

    var emitterContainer = new Pixi.Container();
    this.renderer.stage.addChild(emitterContainer);

    var emitters = [];

    // ################  PRIVATE METHODS ########### //
    // ############################################ //
    var elapsed = Date.now();
    var update = function() {
        requestAnimationFrame(update);

        var now = Date.now();

        // The emitter requires the elapsed
        // number of seconds since the last update
        for (var i = 0; i < emitters.length; i++) {
            emitters[i].update((now - elapsed) * 0.001);

            //if (emitters[i].emit == false) {
            //    emitters.splice(i, 1);
            //}
        }

        elapsed = now;
    };

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


    this.renderParticles = function() {
        update();
    };

    this.addTestEmitter = function() {
        this.addEmitter([Pixi.Texture.fromImage('res/Sparks.png')],
            {
                "alpha": {
                    "start": 1,
                    "end": 0.31
                },
                "scale": {
                    "start": 0.5,
                    "end": 1
                },
                "color": {
                    "start": "ffffff",
                    "end": "9ff3ff"
                },
                "speed": {
                    "start": 100,
                    "end": 200
                },
                "startRotation": {
                    "min": 225,
                    "max": 320
                },
                "rotationSpeed": {
                    "min": 0,
                    "max": 20
                },
                "lifetime": {
                    "min": 0.25,
                    "max": 0.5
                },
                "blendMode": "normal",
                "frequency": 0.001,
                "emitterLifetime": 100,
                "maxParticles": 1000,
                "pos": {
                    "x": 250,
                    "y": 250
                },
                "addAtBack": false,
                "spawnType": "circle",
                "spawnCircle": {
                    "x": 0,
                    "y": 0,
                    "r": 0
                }
            }
        );
    };

    this.addEmitter = function(imageArray, config) {
        var emitter = new window.cloudkid.Emitter(
            emitterContainer,
            imageArray,
            config
        );
        emitters.push(emitter);
    };

    this.resize = function(width, height) {
        this.renderer.resize(width, height);
    };

    this.rotate = function(radians) {
        var stage = this.renderer.stage;
        stage.rotation += radians;
    };
};

module.exports = GameRenderer;