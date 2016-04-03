/**
 * Created by ryan on 27/03/16.
 */

var Physics = require('physicsjs');
var inherits = require('inherits');
var Powerup = require('polyball/shared/model/powerups/Powerup');
var StyleCommons = require('polyball/shared/StyleCommons');
var _ = require('lodash');


// ================================= Private  =================================
// ============================================================================
var twistUp;
var twistFilter;
var bhContainer;
var Pixi;

/**
 * Applies the visual effects for the black hole to the game.
 * @param renderer: Physics.Renderer
 */
var renderActivate = function(renderer) {
    var center = renderer.getWorldCenter();

    var bhSprite = Pixi.Sprite.fromImage('res/blackhole.png');
    bhSprite.anchor.set(0.5, 0.5);
    bhSprite.position.set(center.x, center.y);

    bhContainer = new Pixi.Container();
    bhContainer.layer = 11;
    bhContainer.addChild(bhSprite);
    bhContainer.pivot.set(center.x, center.y);
    bhContainer.position.set(center.x, center.y);

    twistFilter = new Pixi.filters.TwistFilter();
    twistFilter.radius = 0.08;
    twistFilter.offset.x = 0.5;
    twistFilter.offset.y = 0.5;
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
    for (var i = 0; i < renderer.stage.filters.length; i++) {
        if (renderer.stage.filters[i] === twistFilter) {
            renderer.stage.filters.splice(i, 1);
        }
    }

    renderer.stage.removeChild(bhContainer);
};

/**
 * Animate the black hole so it looks interesting.
 */
var renderTransform = function() {
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
Blackhole.prototype.activate = function(model){
    if (!this.active) {
        Blackhole.super_.prototype.activate.call(this, model);
        var arenaCenter = model.getArena().getCenter();
        this.attractor = Physics.behavior('attractor', {
            order: 0,
            strength: 0.003,
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
    }
};

Blackhole.prototype.render = function(renderer) {
    if (Pixi === undefined) {
        Pixi = renderer.Pixi;
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
        // Deactivate black hole
        else if (renderer.stage.filters.length > 0 && !this.active) {
            renderDeactivate(renderer);
        }
        // Transform the black hole
        else if (renderer.stage.filters.length > 0 && this.active) {
            renderTransform();
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