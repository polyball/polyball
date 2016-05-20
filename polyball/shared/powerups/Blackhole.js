/**
 * Created by ryan on 27/03/16.
 */

var Physics = require('physicsjs');
var inherits = require('inherits');
var Powerup = require('polyball/shared/powerups/Powerup');
var StyleCommons = require('polyball/shared/StyleCommons');

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
    this.gameRenderer = undefined;
    this.twistUp = null;
    this.twistFilter = null;
    this.bhContainer = null;
    this.Pixi = null;
};

inherits(Blackhole, Powerup);

/**
 * This holds all the logic to activate a blackhole
 * @param {Model} model
 */
Blackhole.prototype.activate = function(model){
    var arenaCenter = model.arenaContainer.getArena().getCenter();
    this.attractor = Physics.behavior('attractor', {
        order: 0,
        strength: 0.01,
        pos: arenaCenter
    });

    model.getWorld().add(this.attractor);
};

/**
 * This holds all the logic to deactivate a blackhole
 * @param {Model} model
 */
Blackhole.prototype.deactivate = function (model){
    model.getWorld().remove(this.attractor);
};

/**
 * Applies the visual effects for the black hole to the game.
 * @param renderer: Physics.Renderer
 */
Blackhole.prototype.renderActivate = function(renderer) {
    if (this.Pixi == null) {
        this.Pixi = renderer.Pixi;
    }

    if (this.gameRenderer == null) {
        this.gameRenderer = renderer;
    }

    var center = this.gameRenderer.getWorldCenter();
    var clientCenter = this.gameRenderer.getClientCenter();
    var relCenter = this.gameRenderer.getRelativePoint(clientCenter);

    var bhSprite = this.Pixi.Sprite.fromImage('res/blackhole.png');
    bhSprite.anchor.set(0.5, 0.5);
    bhSprite.position.set(center.x, center.y);

    this.bhContainer = new this.Pixi.Container();
    this.bhContainer.layer = 11;
    this.bhContainer.addChild(bhSprite);

    this.twistFilter = new this.Pixi.filters.TwistFilter();
    this.twistFilter.radius = 0.08;
    this.twistFilter.offset.x = relCenter.x;
    this.twistFilter.offset.y = relCenter.y;
    this.twistFilter.angle = 0;

    this.twistUp = true;

    this.gameRenderer.stage.addChild(this.bhContainer);


    if (this.gameRenderer.stage.filters === undefined) {
        this.gameRenderer.stage.filters = [this.twistFilter];
    }
    else {
        this.gameRenderer.stage.filters.push(this.twistFilter);
    }
};

/**
 * Removes the visual effects of this black hole from the game.
 */
Blackhole.prototype.renderDeactivate = function() {
    if (this.gameRenderer.stage.filters !== undefined) {
        var newFilters = [];
        for (var i = 0; i < this.gameRenderer.stage.filters.length; i++) {
            if (this.gameRenderer.stage.filters[i] !== this.twistFilter) {
                newFilters.push(this.gameRenderer.stage.filters[i]);
            }
        }

        if (newFilters.length > 0) {
            this.gameRenderer.stage.filters = newFilters;
        }
        else {
            this.gameRenderer.stage.filters = undefined;
        }

        this.gameRenderer.stage.removeChild(this.bhContainer);
    }
};

/**
 * Animate the black hole so it looks interesting.
 */
Blackhole.prototype.renderUpdate = function() {
    var clientCenter = this.gameRenderer.getClientCenter();
    var relCenter = this.gameRenderer.getRelativePoint(clientCenter);
    this.twistFilter.offset.x = relCenter.x;
    this.twistFilter.offset.y = relCenter.y;

    var twistMax = 23;
    var twistMin = 7;
    var twistChange = 0.3;

    if (this.twistUp) {
        this.twistFilter.angle += twistChange;
    }
    else {
        this.twistFilter.angle -= twistChange;
    }

    if (this.twistFilter.angle > twistMax) {
        this.twistUp = false;
    }
    else if (this.twistFilter.angle < twistMin) {
        this.twistUp = true;
    }

    if (Math.random() > 0.995) {
        this.twistUp = !this.twistUp;
    }

    if (this.gameRenderer.stage.filters !== undefined ){
        if (this.gameRenderer.stage.filters.indexOf(this.twistFilter) < 0){
            this.gameRenderer.stage.filters.push(this.twistFilter);
        }
    } else {
        this.gameRenderer.stage.filters = [this.twistFilter];
    }
};

Blackhole.prototype.powerupConfig = function (){
    return {};
};

Blackhole.Name = 'Blackhole';


module.exports = Blackhole;
