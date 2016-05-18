/**
 * Created by Jared Rewerts on 3/15/2016.
 */
"use strict";

var Pixi = require('pixi.js');
var PixiParticles = require('pixi-particles'); // jshint ignore:line
var Physics = require('physicsjs');
var StyleCommons = require('polyball/shared/StyleCommons');
var Logger = require('polyball/shared/Logger');

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
    var textContainer;
    var titleID;
    var self;
    var baseDim;

    /**
     * Updates the particle rendering.
     */
    var update = function() {
        var now = Date.now();

        for (var i = 0; i < emitters.length; i++) {
            emitters[i].update((now - elapsed) * 0.001);
        }

        elapsed = now;
    };

    /**
     * Rotate each players name.
     * @param players {Array of Player}
     */
    var rotatePlayerText = function (players) {
        players.forEach(function(player) {
            var worldPos = model.getArena().getScorePosition(player.arenaPosition);
            var localPos = self.worldToClient(worldPos);
            var rotation = (model.getArena().getGoalRotation(player.arenaPosition) + self.stage.rotation);

            if (rotation < -Math.PI / 2 && rotation > -(3/2) * Math.PI) {
                rotation = rotation - Math.PI;
            }
            else if (rotation > Math.PI / 2 && rotation < (3/2) * Math.PI) {
                rotation = rotation - Math.PI;
            }

            self.addText(player.client.name + ': ' + player.score, StyleCommons.fontStyle, localPos, rotation, 'player' + player.id);
        });
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
            this.Pixi = Pixi;

            titleID = 'title-screen';

            textContainer = new Pixi.Container();
            this.stage.addChild(textContainer);

            model = config.model;

            emitterContainer = new Pixi.Container();
            emitterContainer.layer = 10;
            this.stage.addChild(emitterContainer);

            emitters = [];

            elapsed = Date.now();

            baseDim = 850;
        },

        /**
         * This creates the initial view of a physics body for polyball to augment.
         * @param geometry - The physics geometry to render.
         * @param styles - The styles object associated with the specific physics body, or the geometry in general.
         * @returns {*}
         */
        createView: function (geometry, styles) {

            var view = parent.createView.call(this, geometry, styles);

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

        /**
         * This function forces awesomefonts to be loaded. If this isn't called,
         * icons won't show up.
         */
        forceFontLoad: function() {
            var text = new Pixi.Text('\uf254', {fill: '#ffffff', font: '40px fontawesome'});
            text.anchor.set(0.5, 0.5);
            text.position.set(50, 50);
            this.stage.addChild(text);
            text.renderable = false;
        },

        /**
         * Adds text to the scene. If the Text object already exists, it's modified.
         * @param {String} text
         * @param {Object} style - the Pixi.Text style object
         * @param {Point} offset - the offset of Text relative to textContainer
         * @param {Number} rotation - the rotation of the text object
         * @param {String} id - used to uniquely identify text that already exists
         */
        addText: function(text, style, offset, rotation, id) {
            var textObject;

            // See if there exists a Text
            var textObjects = textContainer.children.filter(function(textChild) {
                return textChild.polyID === id;
            });
            //Logger.info("Text Objs: ")
            if (textObjects.length > 1) {
                Logger.error('Found multiple Text objects with id: ' + id + ' in addText');
            }
            else if (textObjects.length === 1) {
                textObject = textObjects[0];
                textObject.text = text;
                textObject.style = style;
                textObject.anchor.set(0.5, 0.5);
                textObject.position = offset;
                textObject.rotation = rotation;
                textObject.polyID = id;
            }
            else {
                textObject = new Pixi.Text(text, style);
                textObject.anchor.set(0.5, 0.5);
                textObject.position = offset;
                textObject.rotation = rotation;
                textObject.polyID = id;

                textContainer.addChild(textObject);
            }
        },

        // NOTE: Used to be called render(), but overriding that is a last resort for physics renderers.
        //       See https://github.com/wellcaffeinated/PhysicsJS/wiki/Renderers#further-customization
        beforeRender: function() {
            var center;
            var rotation;

            this.stage.filterArea = new Pixi.Rectangle(0, 0, this.width, this.height);

            if (model.getArena() !== undefined) {
                // Remove the title
                var textObjects = textContainer.children.filter(function(textChild) {
                    return textChild.polyID === titleID;
                });
                if (textObjects.length > 0) {
                    textObjects[0].visible = false;
                }

                center = model.getArena().getCenter();

                this.stage.pivot.set(center.x, center.y);
                this.stage.position.set(center.x, center.y);
                textContainer.pivot.set(center.x, center.y);
                textContainer.position.set(center.x, center.y);

                // Get all text objects that start with player
                textObjects = textContainer.children.filter(function(textChild) {
                    return textChild.polyID.lastIndexOf('player', 0) === 0;
                });

                // Remove the ones that aren't in players
                textObjects.forEach(function(text) {
                    var idStr = text.polyID.substring(6, text.polyID.length);
                    var playerID = parseInt(idStr);
                    if (!model.hasPlayer(playerID)) {
                        Logger.info('Removing child: ' + text.text);
                        textContainer.removeChild(text);
                    }
                });

                var players = model.playersContainer.getPlayers();
                rotatePlayerText(players);

                var localPlayer = model.getPlayer(model.getLocalClientID());
                if (model.playerCount() > 0 && localPlayer !== undefined) {
                    rotation = localPlayer.arenaPosition * 2*Math.PI / model.getArena().getBumpers().length;

                    this.stage.rotation = 0;
                    this.rotate(rotation);
                }

                var desiredX = this.renderer.view.width / (2 * window.devicePixelRatio);
                var desiredY = this.renderer.view.height / (2 * window.devicePixelRatio);

                this.stage.position.set(desiredX, desiredY);
            }
            else {
                center = this.getClientCenter();
                this.stage.pivot.set(center.x, center.y);
                this.stage.position.set(center.x, center.y);

                this.addText('polyball', StyleCommons.titleFontStyle, center, 0, titleID);
            }

            // Render powerups
            model.getPowerups().forEach(function(powerup) {
                powerup.render(self, model);
            });
        },

        /**
         * This disobeys the Physics js pure renderer interface, because our renderer already has a model, and thus a world.
         * This method just renders the world!
         */
        renderGame: function () {
            // Assumes that world.add(this) has been done.  See createNew() function at the bottom of this file.
            model.getWorld().render();
            update();
        },

        /**
         * Adds an emitter.
         * @param imageArray An array of different Pixi images to use as particles.
         * @param config The PixiParticles config object to use.
         */
        addEmitter: function(imageArray, config, container) {
            container = container || emitterContainer;

            var newImageArray = [];

            imageArray.forEach(function(image) {
                if (typeof image === 'string') {
                    newImageArray.push(Pixi.Texture.fromImage(image));
                }
                else {
                    newImageArray.push(image);
                }
            });

            var emitter = new window.cloudkid.Emitter(
                container,
                newImageArray,
                config
            );
            emitters.push(emitter);

            return emitter;
        },

        /**
         * Searches for and removes any emitter in both emitters and emitterContainer
         * @param emitter: cloudkid.Emitter
         */
        removeEmitter: function(emitter) {
            for (var i = 0; i < emitters.length; i++) {
                if (emitters[i] === emitter) {
                    emitters[i].cleanup();
                    emitters.splice(i, 1);
                }
            }
        },

        /**
         * Attempts to move the specified emitter to location.
         * @param emitter: cloudkid.Emitter
         * @param location: Point
         */
        moveEmitter: function(emitter, location) {
            var foundEmitters = emitters.filter(function(inEmitter) {
                return inEmitter === emitter;
            });

            if (foundEmitters.length > 0) {
                foundEmitters[0].updateSpawnPos(0, 0);
                foundEmitters[0].updateOwnerPos(location.x, location.y);
            }
        },

        /**
         * Gets the array of emitters
         * @returns {array of cloudkid.Emitter}
         */
        getEmitters: function() {
            return emitters;
        },

        /**
         * Rotates the renderer. If the pivot/location hasn't been set,
         * it can result in rendered objects in strange places.
         * @param radians: number
         */
        rotate: function(radians) {
            var stage = this.stage;
            stage.rotation += radians;
            textContainer.rotation = -radians;
        },

        /**
         * Resizes the rendering area. Good to do on window resizes.
         * @param width: number
         * @param height: number
         */
        resize: function(width, height) {
            this.renderer.view.style.position = 'absolute';

            if (!height || !width) {
                Logger.debug(
                    "renderer resize called with suspicious values: width " + 
                    width + 
                    ", height " + 
                    height);

                return;
            }

            parent.resize.call(this, width, height);
            this.stage.scale.x = width / baseDim;
            this.stage.scale.y = height / baseDim;

        },

        /**
         * This converts a client point into a relative version
         * of that point.
         * @param point: Point
         * @returns {{x: number, y: number}}
         */
        getRelativePoint: function(point) {
            return {
                x: point.x / this.width,
                y: point.y / this.height
            };
        },

        /**
         * Converts from world (arena) coordinates to client
         * (drawing_ coordinates. Takes into account client offset
         * and rotation.
         * @param point: Point || Physics.vector - world coordinates
         * @returns {Physics.vector}
         */
        worldToClient: function(point) {
            var rotation = this.stage.rotation;
            var offset = this.stage.position;
            var center = model.getArena().getCenter();

            var newPoint = Physics.vector(point.x, point.y);

            newPoint.rotate(rotation, center);
            newPoint.x = newPoint.x + offset.x - center.x;
            newPoint.y = newPoint.y + offset.y - center.y;

            return newPoint;
        },

        /**
         * Gets the client side center point for drawing.
         * @returns {{x: number, y: number}}
         */
        getClientCenter: function() {
            return {
                x: this.width / 2,
                y: this.height / 2
            };
        },

        /**
         * Gets the world (arena) center. Used for objects that don't have access to model.
         * @returns {Physics.vector}
         */
        getWorldCenter: function() {
            return model.getArena().getCenter();
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
