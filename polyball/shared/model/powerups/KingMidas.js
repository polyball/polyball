/**
 * Created by ryan on 01/04/16.
 */
var inherits = require('inherits');
var Powerup = require('polyball/shared/model/powerups/Powerup');
var StyleCommons = require('polyball/shared/StyleCommons');
var _ = require('lodash');
var Events = require('polyball/shared/model/behaviors/Events');

/**
 * This powerup makes balls worth an additional point
 * @param config - see powerup config
 * @constructor
 */
var KingMidas = function (config){
    config.body.styles = StyleCommons.kingMidasStyle;

    Powerup.call(this, config);
    this.name = KingMidas.Name;
    this.renderer = config.renderer;
};

inherits(KingMidas, Powerup);

KingMidas.prototype.handleGoal = function(event){
    if (event.ball.lastTouchedID === this.owner){
        var player = this.model.getPlayer(this.owner);
        if (player != null){
            if (player.id !== event.entity.id){
                player.score += 1;
            } else {
                player.score -= 1;
            }
        }
    }
};

KingMidas.prototype.activate = function(model){
    if (!this.active){
        this.model = model;
        KingMidas.super_.prototype.activate.call(this, model);
        model.getWorld().on(Events.ballGoalCollision, this.handleGoal, this);
        this.active = true;
    }
};

KingMidas.prototype.deactivate = function(model){
    if (this.active){
        model.getWorld().off(Events.ballGoalCollision, this.handleGoal, this);
        this.active = false;
    }
};

KingMidas.prototype.render = function(renderer) {

    if (this.active) {
        var self = this;
        var emitter;
        var emitters = renderer.getEmitters();

        var balls = this.model.getBalls(function(ball) {
            return ball.lastTouchedID === self.owner;
        });

        balls.forEach(function(ball) {
            // Find the emitter for this ball
            var foundEmitters = emitters.filter(function(emitter) {
                return emitter.ball === ball;
            });

            if (foundEmitters.length === 0) { // Create a new emitter
                emitter = renderer.addEmitter(['res/particle.png'], kingMidasParticleStyle);
                emitter.ball = ball;
            }
            else if (foundEmitters.length === 1) { // Update emitter location
                emitter = foundEmitters[0];
                var point = {
                    x: ball.body.state.pos.x,
                    y: ball.body.state.pos.y
                };

                renderer.moveEmitter(emitter, point);
            }
        });

        // Remove any emitters if they hit an opposing players paddle.
        balls = this.model.getBalls(function(ball) {
            return ball.lastTouchedID !== self.owner;
        });

        balls.forEach(function(ball) {
            var foundEmitters = emitters.filter(function(emitter) {
                return emitter.ball === ball;
            });

            foundEmitters.forEach(function(emitter) {
                renderer.removeEmitter(emitter);
            });
        });
    }
};

KingMidas.prototype.toConfig = function (){
    var config = { name: this.name};
    _.assign(config, KingMidas.super_.prototype.toConfig.call(this));
    return config;
};

var kingMidasParticleStyle = {
    "alpha": {
        "start": 1,
        "end": 0
    },
    "scale": {
        "start": 0.11,
        "end": 0.01
    },
    "color": {
        "start": StyleCommons.midasParticleStartColor,
        "end": StyleCommons.midasParticleEndColor
    },
    "speed": {
        "start": 12,
        "end": 0
    },
    "startRotation": {
        "min": 0,
        "max": 0
    },
    "rotationSpeed": {
        "min": 0,
        "max": 0
    },
    "lifetime": {
        "min": 1,
        "max": 2
    },
    "blendMode": "normal",
    "frequency": 0.005,
    "emitterLifetime": this.duration,
    "maxParticles": 500,
    "pos": {
        "x": 0,
        "y": 0
    },
    "addAtBack": true,
    "spawnType": "circle",
    "spawnCircle": {
        "x": 0,
        "y": 0,
        "r": 6
    }
};

KingMidas.Name = "KingMidas";

module.exports = KingMidas;