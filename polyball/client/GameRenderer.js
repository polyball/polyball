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

    var renderer = Physics.renderer('pixi', {
        el: 'viewport'
    });

    var oldCreateView = renderer.createView;
    renderer.createView = function (geometry, styles, parent) {

        var view = oldCreateView.call(renderer, geometry, styles, parent);

        parent = parent || renderer.stage;
        styles = styles || renderer.options.styles[ name ] || renderer.options.styles.circle || {};

        // do whatever we want with the view
        if (styles.layer) {
            view.layer = styles.layer;
        }
        else {
            view.layer = 0;
        }

        parent.children.sort(function(a, b) {
            return a.layer - b.layer;
        });

        return view;
    };

    var world = model.getWorld();
    world.add(renderer);

    var emitterContainer = new Pixi.Container();
    emitterContainer.layer = 100;
    renderer.stage.addChild(emitterContainer);

    var emitters = [];

    // \uf0d6: dollar bill
    // \uf155: dollar sign
    // \uf111: circle
    // \uf254: hourglass
    // \uf069: asterisk
    // \uf219: diamond
    // var test = new Pixi.Text('\uf0d6', {fill: '#ffffff', font: '40px fontawesome'});

    // ################  PRIVATE METHODS ########### //
    // ############################################ //
    var elapsed = Date.now();
    /**
     * Updates the particle rendering.
     */
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
    /**
     * Renders graphics. Handles draw rotations and shifting.
     */
    this.render = function() {

        if (model.getArena() !== undefined) {
            var center = model.getArena().getCenter();
            renderer.stage.pivot.set(center.x, center.y);
            renderer.stage.position.set(center.x, center.y);

            var player = model.getPlayer(model.getLocalClientID());
            if (model.playerCount() > 0 && player !== undefined) {
                var desiredX = window.innerWidth/2;
                var desiredY = window.innerHeight/2;

                renderer.stage.rotation = 0;
                this.rotate(player.arenaPosition * 2*Math.PI / model.getArena().getBumpers().length);
                renderer.stage.position.set(desiredX, desiredY);
            }
        }
        world.render();
    };

    /**
     * This function initiates the particle rendering loop.
     */
    this.renderParticles = function() {
        update();
    };

    /**
     * A test function to show emitter creation.
     */
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

    /**
     * Adds an emitter.
     * @param imageArray An array of different Pixi images to use as particles.
     * @param config The PixiParticles config object to use.
     */
    this.addEmitter = function(imageArray, config) {
        var emitter = new window.cloudkid.Emitter(
            emitterContainer,
            imageArray,
            config
        );
        emitters.push(emitter);
    };

    /**
     * Resizes the rendering area. Good to do on window resizes.
     * @param width: number
     * @param height: number
     */
    this.resize = function(width, height) {
        renderer.resize(width, height);
    };

    /**
     * Rotates the renderer. If the pivot/location hasn't been set,
     * it can result in rendered objects in strange places.
     * @param radians: number
     */
    this.rotate = function(radians) {
        var stage = renderer.stage;
        stage.rotation += radians;
    };
};

module.exports = GameRenderer;