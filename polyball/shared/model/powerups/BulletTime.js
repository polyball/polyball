/**
 * Created by ryan on 01/04/16.
 */
var Physics = require('physicsjs');
var inherits = require('inherits');
var Powerup = require('polyball/shared/model/powerups/Powerup');
var StyleCommons = require('polyball/shared/StyleCommons');
var _ = require('lodash');
var Events = require('polyball/shared/model/behaviors/Events');

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

        model.getWorld().removeBody(this.zone);
        this.fireBalls(model);
    }
};

BulletTime.prototype.render = function(renderer) { //jshint ignore:line

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
        ball.lastTouchedID = this.owner;
        this.affectedBalls[ball.id] = ball;
        ball.body.treatment = 'static';
        ball.body.state.vel.x = 0;
        ball.body.state.vel.y = 0;
    }
};

BulletTime.prototype.fireBalls = function (model){
    var player = model.getPlayer(this.owner);
    var zonePosition = model.getArena().getGoal(player.arenaPosition).state.pos;

    for (var index in this.affectedBalls){
      if (this.affectedBalls.hasOwnProperty(index)){
          var ball = this.affectedBalls[index];
          this.velVect.x = ball.body.state.pos.x;
          this.velVect.y = ball.body.state.pos.y;
          this.velVect.sub(zonePosition.x, zonePosition.y);
          this.velVect.normalize().mult(this.maxBallVelocity);
          ball.body.treatment = 'dynamic';
          ball.body.state.vel.clone(this.velVect);
      }
    }

    this.affectedBalls = {};
};


BulletTime.Name = 'BulletTime';

module.exports = BulletTime;