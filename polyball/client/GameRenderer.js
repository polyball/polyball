/**
 * Created by Jared Rewerts on 3/15/2016.
 */
"use strict";

var Pixi = require('pixi.js');
var PixiParticles = require('pixi-particles'); // jshint ignore:line
var Physics = require('physicsjs');
var Util = require('polyball/shared/Util');
var Blackhole = require('polyball/shared/model/powerups/Blackhole');

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
    var bhRendered;
    var textContainer;
    var bhSprite;
    var bhContainer;
    var self;


    /**
     * Applies the visual effects for the black hole to the arena.
     */
    var activateBlackhole = function() {
        var twistFilter = new Pixi.filters.TwistFilter();
        twistFilter.radius = 500;
        twistFilter.offset = self.worldToClient(model.getArena().getCenter());
        twistFilter.angle = 2.5;
        self.stage.filters = [twistFilter];

        self.stage.addChild(bhContainer);
    };

    /**
     * Removes the visual effects of the black hole.
     */
    var deactivateBlackhole = function() {
        self.stage.filters = null;
        self.stage.removeChild(bhContainer);
    };

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

            self = this;

            bhRendered = false;

            textContainer = new Pixi.Container();
            this.stage.addChild(textContainer);

            model = config.model;

            emitterContainer = new Pixi.Container();
            emitterContainer.layer = 100;
            this.stage.addChild(emitterContainer);

            emitters = [];

            bhContainer = new Pixi.Container();
            bhContainer.layer = -1;
            bhSprite = Pixi.Sprite.fromImage('res/blackhole.png');
            bhSprite.anchor.set(0.5, 0.5);
            bhContainer.addChild(bhSprite);

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
                var text = new Pixi.Text(styles.icon, styles.fontstyle);
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

        addText: function(text, style, offset, rotation) {
            var textObject = new Pixi.Text(text, style);
            textObject.anchor.set(0.5, 0.5);
            textObject.rotation = rotation;
            textObject.position = offset;

            textContainer.addChild(textObject);
        },

        // NOTE: Used to be called render(), but overriding that is a last resort for physics renderers.
        //       See https://github.com/wellcaffeinated/PhysicsJS/wiki/Renderers#further-customization
        beforeRender: function() {

            if (model.getArena() !== undefined) {
                var center = model.getArena().getCenter();
                this.stage.pivot.set(center.x, center.y);
                this.stage.position.set(center.x, center.y);

                //bhContainer.pivot.set(center.x, center.y);
                bhContainer.position.set(center.x, center.y);

                var localPlayer = model.getPlayer(model.getLocalClientID());
                if (model.playerCount() > 0 && localPlayer !== undefined) {
                    var desiredX = window.innerWidth/2;
                    var desiredY = window.innerHeight/2;
                    var rotation = localPlayer.arenaPosition * 2*Math.PI / model.getArena().getBumpers().length;

                    textContainer.removeChildren();
                    var players = model.getPlayers();
                    for (var i = 0; i < players.length; i++) {
                        var player = players[i];
                        var worldPos = model.getArena().getScorePosition(player.arenaPosition);
                        //var localPos = this.worldToClient(worldPos);

                        var style = {
                            font : 'bold italic 36px Arial',
                            fill : '#dc322f',
                            stroke : '#1d6b98',
                            strokeThickness : 5
                        };

                        this.addText(player.score + '\n' + player.client.name, style, worldPos, -rotation);
                    }

                    this.stage.rotation = 0;
                    this.rotate(rotation);
                    this.stage.position.set(desiredX, desiredY);
                }


            }

            var blackholes = model.getPowerups(function(x) {
                return x.name === Blackhole.Name;
            });

            if (blackholes.length > 0 && bhRendered === false && blackholes[0].active === true) {
                activateBlackhole();
                bhRendered = true;
            }
            else if (blackholes.length > 0 && bhRendered === true && blackholes[0].active === false) {
                deactivateBlackhole();
                bhRendered = false;
            }
            else if (blackholes.length === 0) {
                deactivateBlackhole();
                bhRendered = false;
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
        },

        /**
         * Resizes the rendering area. Good to do on window resizes.
         * @param width: number
         * @param height: number
         */
        resize: function(width, height) {
            parent.resize.call(this, width, height);
            this.renderer.resize(this.width, this.height);
        },

        worldToClient: function(point) {
            var rotation = this.stage.rotation;
            var offset = this.stage.position;
            var center = model.getArena().getCenter();

            point.rotate(rotation, center);
            point.x = point.x + offset.x - center.x;
            point.y = point.y + offset.y - center.y;

            return point;
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