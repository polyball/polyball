/**
 * Created by ryan on 01/04/16.
 */
var inherits = require('inherits');
var Powerup = require('polyball/shared/powerups/Powerup');
var StyleCommons = require('polyball/shared/StyleCommons');
var Events = require('polyball/shared/model/behaviors/Events');

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

KingMidas.prototype.activate = function(model){
    this.model = model;
    model.getWorld().on(Events.ballGoalCollision, this.handleGoal, this);
};

KingMidas.prototype.deactivate = function(model){
    model.getWorld().off(Events.ballGoalCollision, this.handleGoal, this);
};

KingMidas.prototype.renderDeactivate = function() {
    var emitters = this.gameRenderer.getEmitters();
    var self = this;

    var foundEmitters = emitters.filter(function (emitter) {
        return emitter.owner === self;
    });

    foundEmitters.forEach(function(emitter) {
        self.gameRenderer.removeEmitter(emitter);
    });
};

KingMidas.prototype.renderActivate = function(renderer, model) {
    this.gameRenderer = renderer;

    var ownerPaddle = model.playersContainer.getPlayer(this.owner).paddle;
    var paddleEmitters = this.getPaddleEmitters(this.gameRenderer);

    if (paddleEmitters.length === 0) {
        kingMidasPaddleParticleStyle.angleStart = ownerPaddle.body.state.angular.pos * 57.2958;
        paddleEmitters.push(this.gameRenderer.addEmitter(['res/particle.png'], kingMidasPaddleParticleStyle));
        paddleEmitters[0].owner = this;
        paddleEmitters[0].player = this.owner;
    }
};

KingMidas.prototype.renderUpdate = function(model) {
    var emitter;
    var emitters = this.gameRenderer.getEmitters();

    var self = this;
    var ownerPaddle = model.playersContainer.getPlayer(this.owner).paddle;

    var paddleEmitters = this.getPaddleEmitters(this.gameRenderer);
    this.gameRenderer.moveEmitter(
        paddleEmitters[0], {
            x: ownerPaddle.body.state.pos.x,
            y: ownerPaddle.body.state.pos.y
        }
    );

    // add ball emitters
    var balls = model.ballsContainer.getBalls();

    balls.forEach(function(ball) {
        // Find the emitter for this ball
        var foundEmitters = emitters.filter(function(emitter) {
            return emitter.ball === ball && emitter.owner === self;
        });

        if (ball.lastTouchedID === self.owner) {
            // SRS Requirement - 3.2.2.18.6 King Midas Sparkle
            if (foundEmitters.length === 0) { // Create a new emitter
                emitter = self.gameRenderer.addEmitter(['res/particle.png'], kingMidasBallParticleStyle);
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
            self.gameRenderer.moveEmitter(emitter, point);
        }
        else {
            foundEmitters.forEach(function(emitter) {
                self.gameRenderer.removeEmitter(emitter);
            });
        }
    });
};

KingMidas.prototype.getPaddleEmitters = function (renderer) {
    var emitters = renderer.getEmitters();
    var self = this;
    return emitters.filter(function (emitter) {
        return emitter.owner === self && emitter.player === self.owner;
    });
};

KingMidas.prototype.powerupConfig = function (){
    return {};
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