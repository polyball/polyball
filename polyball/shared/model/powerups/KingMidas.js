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

    if (typeof this.deactivateRender === 'function') {
        this.deactivateRender();
    }
};

KingMidas.prototype.render = function(renderer) {
    var self = this;

    if (this.active) {
        var emitter;
        var emitters = renderer.getEmitters();

        // add paddle emitter
        var paddleEmitters = emitters.filter(function (emitter) {
            return self.owner === emitter.owner;
        });

        var ownerPaddle = self.model.getPlayer(self.owner).paddle;
        if (paddleEmitters.length === 0) {
            kingMidasPaddleParticleStyle.angleStart = ownerPaddle.body.state.angular.pos * 57.2958;
            paddleEmitters.push(renderer.addEmitter(['res/particle.png'], kingMidasPaddleParticleStyle));
            paddleEmitters[0].owner = self.owner;
        }
        renderer.moveEmitter(
            paddleEmitters[0],
            {x: ownerPaddle.body.state.pos.x, y: ownerPaddle.body.state.pos.y}
        );

        // add ball emmitters
        var balls = this.model.getBalls(function(ball) {
            return ball.lastTouchedID === self.owner;
        });

        balls.forEach(function(ball) {
            // Find the emitter for this ball
            var foundEmitters = emitters.filter(function(emitter) {
                return emitter.ball === ball;
            });

            if (foundEmitters.length === 0) { // Create a new emitter
                emitter = renderer.addEmitter(['res/particle.png'], kingMidasBallParticleStyle);
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

    if (!this.renderedAtLeastOnce) {
        this.deactivateRender = function () {

            var emitters = renderer.getEmitters();
            var balls = self.model.getBalls(function (ball) {
                return ball.lastTouchedID === self.owner;
            });

            var foundEmitters = emitters.filter(function (emitter) {
                return emitter.owner === self.owner;
            });

            foundEmitters.forEach(function(emitter) {
                renderer.removeEmitter(emitter);
            });

            balls.forEach(function (ball) {
                var foundEmitters = emitters.filter(function (emitter) {
                    return emitter.ball === ball;
                });

                foundEmitters.forEach(function(emitter) {
                    renderer.removeEmitter(emitter);
                });
            });
        };
    }

    this.renderedAtLeastOnce = true;
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