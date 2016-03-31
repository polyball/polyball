/**
 * Created by Jared Rewerts on 3/15/2016.
 */
"use strict";

var Pixi = require('pixi.js');
var PixiParticles = require('pixi-particles'); // jshint ignore:line
var Physics = require('physicsjs');
var Util = require('polyball/shared/Util');

// Shim in the PIXI global that Physics.js is looking for to do its primitive rendering.
window.PIXI = Pixi;

// Declare the polyball renderer as a large extension of the existing pixi renderer.
Physics.renderer('polyball', 'pixi', function (parent) {

    //
    //    ########  ########  #### ##     ##    ###    ######## ########
    //    ##     ## ##     ##  ##  ##     ##   ## ##      ##    ##
    //    ##     ## ##     ##  ##  ##     ##  ##   ##     ##    ##
    //    ########  ########   ##  ##     ## ##     ##    ##    ######
    //    ##        ##   ##    ##   ##   ##  #########    ##    ##
    //    ##        ##    ##   ##    ## ##   ##     ##    ##    ##
    //    ##        ##     ## ####    ###    ##     ##    ##    ########
    //
    ///////////////////////////////////////////////////////////////////////////

    var model;
    var emitterContainer;
    var emitters;
    var elapsed;

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
        }

        elapsed = now;
    };


    //
    //    ########  ##     ## ########  ##       ####  ######
    //    ##     ## ##     ## ##     ## ##        ##  ##    ##
    //    ##     ## ##     ## ##     ## ##        ##  ##
    //    ########  ##     ## ########  ##        ##  ##
    //    ##        ##     ## ##     ## ##        ##  ##
    //    ##        ##     ## ##     ## ##        ##  ##    ##
    //    ##         #######  ########  ######## ####  ######
    //
    ///////////////////////////////////////////////////////////////////////////

    return {

        /**
         * This is the initializer that's called from `var renderer = Physics.renderer('polyball', options);`
         * @param {Object} config
         * @property {Model} config.model
         */
        init: function (config) {
            // initialize the parent pixi renderer
            parent.init.call(this, config);

            model = config.model;

            emitterContainer = new Pixi.Container();
            emitterContainer.layer = 100;
            this.stage.addChild(emitterContainer);

            emitters = [];

            elapsed = Date.now();
        },

        /**
         * This creates the initial view of a physics body for polyball to augment.
         * @param geometry - The physics geometry to render.
         * @param styles - The styles object associated with the specific physics body, or the geometry in general.
         * @returns {*}
         */
        createView: function (geometry, styles) {

            var view = parent.createView.call(this, geometry, styles);


            // JARED:
            // I removed the `parent = parent ...` because the third parameter to this function (was named parent)
            // isn't actually passed in here according to the docs!  Besides, you can just do `this.stage` now.


            // JARED:
            // I removed the
            //     `renderer.options.styles[ name ]`
            // from the below conditional - the variable name isn't instantiated anywhere so it looked like a null
            // reference waiting to happen.
            styles = styles || this.options.styles.circle || {};

            // Handle view layers.
            if (styles.layer) {
                view.layer = styles.layer;
            }
            else {
                view.layer = 0;
            }

            this.stage.children.sort(function(a, b) {
                return a.layer - b.layer;
            });

            // Add child icons if specified.
            // \uf0d6: dollar bill
            // \uf155: dollar sign
            // \uf111: circle
            // \uf254: hourglass
            // \uf069: asterisk
            // \uf219: diamond
            if (styles.icon) {
                var text = new Pixi.Text(styles.icon, {fill: '#ffffff', font: '40px fontawesome'});
                text.anchor.set(0.5, 0.5);
                view.addChild(text);
            }

            return view;
        },

        forceFontLoad: function() {
            var text = new Pixi.Text('\uf254', {fill: '#ffffff', font: '40px fontawesome'});
            text.anchor.set(0.5, 0.5);
            text.position.set(50, 50);
            this.stage.addChild(text);
            text.renderable = false;
        },

        // NOTE: Used to be called render(), but overriding that is a last resort for physics renderers.
        //       See https://github.com/wellcaffeinated/PhysicsJS/wiki/Renderers#further-customization
        beforeRender: function() {

            if (model.getArena() !== undefined) {
                var center = model.getArena().getCenter();
                this.stage.pivot.set(center.x, center.y);
                this.stage.position.set(center.x, center.y);

                var player = model.getPlayer(model.getLocalClientID());
                if (model.playerCount() > 0 && player !== undefined) {
                    var desiredX = window.innerWidth/2;
                    var desiredY = window.innerHeight/2;

                    this.stage.rotation = 0;
                    this.rotate(player.arenaPosition * 2*Math.PI / model.getArena().getBumpers().length);
                    this.stage.position.set(desiredX, desiredY);
                }
            }
        },

        /**
         * This disobeys the Physics js pure renderer interface, because our renderer already has a model, and thus a world.
         * This method just renders the world!
         */
        renderGame: function () {
            // Assumes that world.add(this) has been done.  See createNew() function at the bottom of this file.
            model.getWorld().render();
        },

        renderParticles: function() {
            update();
        },

        /**
         * Adds an emitter.
         * @param imageArray An array of different Pixi images to use as particles.
         * @param config The PixiParticles config object to use.
         */
        addEmitter: function(imageArray, config) {
            var emitter = new window.cloudkid.Emitter(
                emitterContainer,
                imageArray,
                config
            );
            emitters.push(emitter);
        },

        addTestEmitter: function() {
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
                        "x": Util.getRandomInt(0, 600),
                        "y": Util.getRandomInt(0, 600)
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
        },

        /**
         * Rotates the renderer. If the pivot/location hasn't been set,
         * it can result in rendered objects in strange places.
         * @param radians: number
         */
        rotate: function(radians) {
            var stage = this.stage;
            stage.rotation += radians;
        }
    };
});


/***
 * Creates a polyball renderer and adds it to the model's world.
 *
 * @param {Object} config
 * @property {Model} config.model
 */
module.exports.createNew = function(config) {
    var renderer = Physics.renderer('polyball', config);

    var world = config.model.getWorld();
    world.add(renderer);

    return renderer;
};