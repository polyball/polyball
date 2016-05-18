/**
 * Created by ryan on 27/03/16.
 */

var Physics = require('physicsjs');
var inherits = require('inherits');
var Powerup = require('polyball/shared/powerups/Powerup');
var StyleCommons = require('polyball/shared/StyleCommons');
var _ = require('lodash');

// ================================= Private  =================================
// ============================================================================
var twistUp;
var twistFilter;
var bhContainer;
var gameRenderer;
var Pixi;

/**
 * Applies the visual effects for the black hole to the game.
 * @param renderer: Physics.Renderer
 */
var renderActivate = function(renderer) {
    var center = renderer.getWorldCenter();
    var clientCenter = renderer.getClientCenter();
    var relCenter = renderer.getRelativePoint(clientCenter);

    var bhSprite = Pixi.Sprite.fromImage('res/blackhole.png');
    bhSprite.anchor.set(0.5, 0.5);
    bhSprite.position.set(center.x, center.y);

    bhContainer = new Pixi.Container();
    bhContainer.layer = 11;
    bhContainer.addChild(bhSprite);

    // SRS Requirement - 3.2.2.18.7 Black Hole Swell
    twistFilter = new Pixi.filters.TwistFilter();
    twistFilter.radius = 0.08;
    twistFilter.offset.x = relCenter.x;
    twistFilter.offset.y = relCenter.y;
    twistFilter.angle = 0;

    twistUp = true;

    renderer.stage.addChild(bhContainer);


    if (renderer.stage.filters === undefined) {
        renderer.stage.filters = [twistFilter];
    }
    else {
        renderer.stage.filters.push(twistFilter);
    }
};

/**
 * Removes the visual effects of this black hole from the game.
 * @param renderer: Physics.Renderer
 */
var renderDeactivate = function(renderer) {
    var newFilters = [];
    for (var i = 0; i < renderer.stage.filters.length; i++) {
        if (renderer.stage.filters[i] !== twistFilter) {
            newFilters.push(renderer.stage.filters);
        }
    }

    if (newFilters.length > 0) {
        renderer.stage.filters = newFilters;
    }
    else {
        renderer.stage.filters = undefined;
    }

    renderer.stage.removeChild(bhContainer);
};

/**
 * Animate the black hole so it looks interesting.
 * @param renderer: Physics.Renderer
 */
var renderTransform = function(renderer) {
    var clientCenter = renderer.getClientCenter();
    var relCenter = renderer.getRelativePoint(clientCenter);
    twistFilter.offset.x = relCenter.x;
    twistFilter.offset.y = relCenter.y;

    var twistMax = 23;
    var twistMin = 7;
    var twistChange = 0.3;

    if (twistUp) {
        twistFilter.angle += twistChange;
    }
    else {
        twistFilter.angle -= twistChange;
    }

    if (twistFilter.angle > twistMax) {
        twistUp = false;
    }
    else if (twistFilter.angle < twistMin) {
        twistUp = true;
    }

    if (Math.random() > 0.995) {
        twistUp = !twistUp;
    }
};

// ================================= Public ===================================
// ============================================================================

/**
 * This powerup create a gravitational pull in the center of the arena
 * @param config - See powerup config
 * @constructor
 */
var Blackhole = function(config){

    config.body.styles = StyleCommons.blackholeStyle;

    Powerup.call(this, config);
    this.name = Blackhole.Name;
};

inherits(Blackhole, Powerup);

/**
 * This holds all the logic to activate a blackhole
 * @param {Model} model
 */
// SRS Requirement - 3.2.2.15 Powerup Activated
// SRS Requirement - 3.2.2.15.3 Blackhole Powerup
Blackhole.prototype.activate = function(model){
    if (!this.active) {
        Blackhole.super_.prototype.activate.call(this, model);
        var arenaCenter = model.arenaContainer.getArena().getCenter();
        this.attractor = Physics.behavior('attractor', {
            order: 0,
            strength: 0.01,
            pos: arenaCenter
        });

        model.getWorld().add(this.attractor);

        this.active = true;
    }
};

/**
 * This holds all the logic to deactivate a blackhole
 * @param {Model} model
 */
Blackhole.prototype.deactivate = function (model){
    if (this.active){
        model.getWorld().remove(this.attractor);
        this.active = false;

        // This is a bit weird here, but it works.
        if (gameRenderer !== undefined) {
            renderDeactivate(gameRenderer);
        }
    }
};

Blackhole.prototype.render = function(renderer, model) { //jshint ignore:line
    if (Pixi === undefined) {
        Pixi = renderer.Pixi;
    }
    if (gameRenderer === undefined) {
        gameRenderer = renderer;
    }

    // Activate black hole
    if (renderer.stage.filters === undefined && this.active) {
        renderActivate(renderer);
    }
    if (renderer.stage.filters !== undefined) {
        // Activate black hole
        if (renderer.stage.filters.length === 0 && this.active) {
            renderActivate(renderer);
        }
        // Transform the black hole
        else if (renderer.stage.filters.length > 0 && this.active) {
            renderTransform(renderer);
        }
    }

};

Blackhole.prototype.toConfig = function (){
    var config = { name: this.name};
    _.assign(config, Blackhole.super_.prototype.toConfig.call(this));
    return config;
};

Blackhole.Name = 'Blackhole';


module.exports = Blackhole;
