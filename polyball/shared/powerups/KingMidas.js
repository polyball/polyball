/**
 * Created by ryan on 01/04/16.
 */
var inherits = require('inherits');
var Powerup = require('polyball/shared/powerups/Powerup');
var StyleCommons = require('polyball/shared/StyleCommons');
var _ = require('lodash');
var Events = require('polyball/shared/model/behaviors/Events');

// ================================= Private  =================================
// ============================================================================
var gameRenderer;

var renderDeactivate = function(self, renderer) {
    var emitters = renderer.getEmitters();

    var foundEmitters = emitters.filter(function (emitter) {
        return emitter.owner === self;
    });

    foundEmitters.forEach(function(emitter) {
        renderer.removeEmitter(emitter);
    });
};

// ================================= Public ===================================
// ============================================================================

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
        var player = this.model.playersContainer.getPlayer(this.owner);
        if (player != null){
            if (player.id !== event.entity.id){
                player.score += 1;
            } else {
                player.score -= 1;
            }
        }
    }
};

// SRS Requirement - 3.2.2.15 Powerup Activated
// SRS Requirement - 3.2.2.15.2 King Midas Powerup
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

    if (gameRenderer !== undefined) {
        renderDeactivate(this, gameRenderer);
    }
};

KingMidas.prototype.render = function(renderer, model) {
    var self = this;
    if (gameRenderer === undefined) {
        gameRenderer = renderer;
    }

    if (this.active) {
        var emitter;
        var emitters = renderer.getEmitters();

        // add paddle emitter
        var paddleEmitters = emitters.filter(function (emitter) {
            return emitter.owner === self && emitter.player === self.owner;
        });

        var ownerPaddle = model.playersContainer.getPlayer(this.owner).paddle;
        if (paddleEmitters.length === 0) {
            kingMidasPaddleParticleStyle.angleStart = ownerPaddle.body.state.angular.pos * 57.2958;
            paddleEmitters.push(renderer.addEmitter(['res/particle.png'], kingMidasPaddleParticleStyle));
            paddleEmitters[0].owner = this;
            paddleEmitters[0].player = this.owner;
        }

        renderer.moveEmitter(
            paddleEmitters[0], {
                x: ownerPaddle.body.state.pos.x,
                y: ownerPaddle.body.state.pos.y
            }
        );

        // add ball emitters
        var balls = model.getBalls();

        balls.forEach(function(ball) {
            // Find the emitter for this ball
            var foundEmitters = emitters.filter(function(emitter) {
                return emitter.ball === ball && emitter.owner === self;
            });

            if (ball.lastTouchedID === self.owner) {
                // SRS Requirement - 3.2.2.18.6 King Midas Sparkle
                if (foundEmitters.length === 0) { // Create a new emitter
                    emitter = renderer.addEmitter(['res/particle.png'], kingMidasBallParticleStyle);
                    emitter.ball = ball;
                    emitter.owner = self;
                    foundEmitters.push(emitter);
                }
                // Update emitter location
                var point = {
                    x: ball.body.state.pos.x,
                    y: ball.body.state.pos.y
                };

                emitter = foundEmitters[0];
                renderer.moveEmitter(emitter, point);
            }
            else {
                foundEmitters.forEach(function(emitter) {
                    renderer.removeEmitter(emitter);
                });
            }
        });
    }
};

KingMidas.prototype.toConfig = function (){
    var config = { name: this.name};
    _.assign(config, KingMidas.super_.prototype.toConfig.call(this));
    return config;
};

var kingMidasBallParticleStyle = {
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
    "emitterLifetime": -1,
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

var kingMidasPaddleParticleStyle = {
    "alpha": {
        "start": 0,
        "end": 0.22
    },
    "scale": {
        "start": 0.8,
        "end": 0.18,
        "minimumScaleMultiplier": 1
    },
    "color": {
        "start": "#ffcc00",
        "end": "#ffcc00"
    },
    "speed": {
        "start": 60,
        "end": 0
    },
    "acceleration": {
        "x": 0,
        "y": 0
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
        "min": 0.4,
        "max": 0.4
    },
    "blendMode": "add",
    "frequency": 0.01,
    "emitterLifetime": -1,
    "maxParticles": 500,
    "pos": {
        "x": 0,
        "y": 0
    },
    "addAtBack": true,
    "spawnType": "burst",
    "particlesPerWave": 8,
    "particleSpacing": 45,
    "angleStart": 45
};

KingMidas.Name = "KingMidas";

module.exports = KingMidas;