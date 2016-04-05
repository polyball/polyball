/**
 * Created by ryan on 01/04/16.
 */
var Physics = require('physicsjs');
var inherits = require('inherits');
var Powerup = require('polyball/shared/model/powerups/Powerup');
var StyleCommons = require('polyball/shared/StyleCommons');
var _ = require('lodash');
var Events = require('polyball/shared/model/behaviors/Events');

// ================================= Private  =================================
// ============================================================================
var gameRenderer;
var bulletTimeout;
var zoomPivot;
var xStep;
var yStep;
var scaleGoal;
var scaleStep;
var self;

var renderDeactivate = function(renderer) {
    var emitters = renderer.getEmitters();
    var foundEmitters = emitters.filter(function (emitter) {
        return emitter.owner === self;
    });

    foundEmitters.forEach(function(emitter) {
        renderer.removeEmitter(emitter);
    });

    renderer.stage.scale.x = 1;
    renderer.stage.scale.y = 1;
};

// ================================= Public ===================================
// ============================================================================

/**
 * This powerup slows balls down in a certain area around the owners goal
 * @param config - See powerup Constructor
 * @property {number} config.maxBallVelocity
 * @constructor
 */
var BulletTime = function(config){
    config.body.styles = StyleCommons.bulletTimeStyle;

    Powerup.call(this, config);
    this.name = BulletTime.Name;
    this.radius = 0;
    this.duration = 20000;
    this.affectedBalls = {};
    this.velVect = new Physics.vector(0,0);
    this.maxBallVelocity = config.maxBallVelocity || 3;
    this.model = null;

    bulletTimeout = 5000;
    scaleGoal = 1.1;
};

inherits(BulletTime, Powerup);

BulletTime.prototype.createBulletTimeBody = function(model){
    var player = model.getPlayer(this.owner);
    var pos = model.getArena().getGoal(player.arenaPosition).state.pos;
    var radiusVect = new Physics.vector(0,0);

    radiusVect.clone(player.paddle.goalRightBound);
    radiusVect.vsub(player.paddle.goalLeftBound);
    this.radius = radiusVect.norm();

    return Physics.body('rectangle',{
        x: pos.x,
        y: pos.y,
        width: this.radius,
        angle: radiusVect.angle(),
        height: player.paddle.radius * 2,
        treatment: 'static',
        styles:{
            visible: false
        }
    });
};

/**
 * This holds all the logic to activate a blackhole
 * @param {Model} model
 */
BulletTime.prototype.activate = function(model){
    if (!this.active) {
        this.zone = this.createBulletTimeBody(model);
        if (model.collisionsPruner != null) {
            model.collisionsPruner.addIgnoredBody(this.zone);
            model.getWorld().on(Events.nonImpulsiveCollision, this.handleCollisions, this);
        }
        this.model = model;
        model.getWorld().addBody(this.zone);
        BulletTime.super_.prototype.activate.call(this, model);


        this.active = true;
    }
};

/**
 * This holds all the logic to deactivate a blackhole
 * @param {Model} model
 */
BulletTime.prototype.deactivate = function (model){
    if (this.active){
        this.active = false;
        if (model.collisionsPruner != null) {
            model.collisionsPruner.removeIgnoredBody(this.zone);
            model.getWorld().off(Events.nonImpulsiveCollision, this.handleCollisions, this);
        }

        if (gameRenderer !== undefined) {
            renderDeactivate(gameRenderer);
        }

        model.getWorld().removeBody(this.zone);
        this.fireBalls(model);
    }
};

BulletTime.prototype.render = function(renderer, model) { //jshint ignore:line
    self = this;
    if (gameRenderer === undefined) {
        gameRenderer = renderer;
    }

    if (this.active) {
        var emitter;
        var emitters = renderer.getEmitters();
        var balls = model.getBalls(function(ball) {
            return ball.body.treatment === 'static' && ball.lastTouchedID === self.owner;
        });
        balls.forEach(function(ball) {
            var foundEmitters = emitters.filter(function(emitter) {
                return emitter.ball === ball;
            });
            if (foundEmitters.length === 0) {
                emitter = renderer.addEmitter(['res/particle.png'], bulletTimeEmitterStyle);
                emitter.ball = ball;
                emitter.owner = self;
                foundEmitters.push(emitter);
            }
            var point = {
                x: ball.body.state.pos.x,
                y: ball.body.state.pos.y
            };

            emitter = foundEmitters[0];
            renderer.moveEmitter(emitter, point);
        });

        // Handle the subtle zoom.
        if (model.getArena() !== undefined) {
            var player = model.getPlayer(this.owner);
            var pos = model.getArena().getGoal(player.arenaPosition).state.pos;
            var pivot = renderer.stage.pivot;

            if(zoomPivot === undefined) {
                zoomPivot = {x: pivot.x, y: pivot.y};
            }

            xStep = (pos.x - zoomPivot.x) / 200;
            yStep = (pos.y - zoomPivot.y) / 200;
            scaleStep = (scaleGoal - renderer.stage.scale.x) / 200;

            zoomPivot.x += xStep;
            zoomPivot.y += yStep;

            renderer.stage.pivot.set(zoomPivot.x, zoomPivot.y);
            renderer.stage.scale.x += scaleStep;
            renderer.stage.scale.y += scaleStep;


        }
    }
};

BulletTime.prototype.toConfig = function (){
    var config = {
        name: this.name,
        maxBallVelocity: this.maxBallVelocity
    };
    _.assign(config, BulletTime.super_.prototype.toConfig.call(this));
    return config;
};

BulletTime.prototype.handleCollisions = function (event){
    if (!this.affectedBalls[event.ball.id]){
        var ball = event.ball;
        var self = this;
        ball.lastTouchedID = this.owner;
        this.affectedBalls[ball.id] = ball;
        ball.body.treatment = 'static';
        ball.body.state.vel.x = 0;
        ball.body.state.vel.y = 0;

        if (Object.keys(this.affectedBalls).length === this.model.ballCount()){
            clearTimeout(this.deleteTimeout);
            this.deleteTimeout = setTimeout(function(){
                self.model.deletePowerup(self.id);
            }, bulletTimeout);
        }
    }
};

BulletTime.prototype.fireBalls = function (model){
    var player = model.getPlayer(this.owner);
    var ball;

    for (var index in this.affectedBalls){
      if (this.affectedBalls.hasOwnProperty(index) && player !== undefined){
          var zonePosition = model.getArena().getGoal(player.arenaPosition).state.pos;

          ball = this.affectedBalls[index];
          this.velVect.x = ball.body.state.pos.x;
          this.velVect.y = ball.body.state.pos.y;
          this.velVect.sub(zonePosition.x, zonePosition.y);
          this.velVect.normalize().mult(this.maxBallVelocity);
          ball.body.treatment = 'dynamic';
          ball.body.state.vel.clone(this.velVect);
      }
        else if (this.affectedBalls.hasOwnProperty(index)) {
          ball = this.affectedBalls[index];
          ball.body.treatment = 'dynamic';
          ball.body.state.vel.x = Math.random();
          ball.body.state.vel.y = Math.random();
      }
    }

    this.affectedBalls = {};
};

var bulletTimeEmitterStyle = {
    "alpha": {
        "start": 1,
        "end": 1
    },
    "scale": {
        "start": 0.1,
        "end": 0.01,
        "minimumScaleMultiplier": 1
    },
    "color": {
        "start": "#5264eb",
        "end": "#ff573d"
    },
    "speed": {
        "start": 200,
        "end": 50
    },
    "acceleration": {
        "x": 0,
        "y": 0
    },
    "startRotation": {
        "min": 0,
        "max": 360
    },
    "rotationSpeed": {
        "min": 0,
        "max": 0
    },
    "lifetime": {
        "min": 0.6,
        "max": 0.6
    },
    "blendMode": "normal",
    "frequency": 0.001,
    "emitterLifetime": -1,
    "maxParticles": 300,
    "pos": {
        "x": 0,
        "y": 0
    },
    "addAtBack": false,
    "spawnType": "burst",
    "particlesPerWave": 300,
    "particleSpacing": 2,
    "angleStart": 3
};

BulletTime.Name = 'BulletTime';

module.exports = BulletTime;