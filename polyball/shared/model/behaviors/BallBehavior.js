/**
 * Created by ryan on 27/03/16.
 */
var Physics = require('physicsjs');
var _ = require('lodash');

/**
 *
 * @param config
 * @property {number} config.ballMaxVelocity
 * @property {model} config.model
 * @constructor
 */
var BallBehavior = function(config){
    Physics.behavior(BallBehavior.Name, function(parent){
        return {
            init: function(options){
                parent.init.call(this);
                this.options(options);

                this.balls = {};
                this.ballsLength = 0;
                this.markedBalls = {};
                this.paddles = {};

                if (config.model.getPlayers().filter(function(player){
                        return player.paddle;
                    }).length > 0){
                        this.setupPaddles();
                }
            },

            setupPaddles: function(){
                var self = this;
                config.model.getPlayers().forEach(function(player){
                    self.paddles[player.paddle.body.uid] = player.paddle.body;
                });
            },

            setupBalls: function(){
                var self = this;
                this.balls = {};
                config.model.getBalls().forEach(function(ball){
                    self.balls[ball.body.uid] = ball.body;
                });
                this.ballsLength = Object.keys(this.balls).length;
            },

            clampVelocities: function(){
                if (!_.isEmpty(this.markedBalls)){
                    for (var index in this.markedBalls){
                        if (this.markedBalls.hasOwnProperty(index)){
                            var ball = this.markedBalls[index];
                            if (ball.state.vel.norm() > config.ballMaxVelocity){
                                ball.state.vel.normalize().mult(config.ballMaxVelocity);
                            }
                        }
                    }
                    this.markedBalls = {};
                }
            },

            handleCollision: function(event){
                var self = this;
                if (self.ballsLength !== config.model.getBalls().length){
                    self.setupBalls();
                }

                event.collisions.forEach(function(collision){
                    if (self.paddles[collision.bodyA.uid] || self.paddles[collision.bodyB.uid]){
                        if (self.balls[collision.bodyA.uid] || self.balls[collision.bodyB.uid]){
                            if (self.balls[collision.bodyA.uid]){
                                self.markedBalls[collision.bodyA.uid] = collision.bodyA;
                            } else {
                                self.markedBalls[collision.bodyB.uid] = collision.bodyB;
                            }
                        }
                    }
                });
            },

            // extended
            connect: function (world) {
                world.on('integrate:velocities', this.clampVelocities, this);
                world.on('collisions:detected', this.handleCollision, this);
            },

            // extended
            disconnect: function (world) {

                // unsubscribe when disconnected
                world.off('integrate:velocities', this.clampVelocities, this);
                world.off('collisions:detected', this.handleCollision, this);

            }
        };
    });
};

BallBehavior.Name = 'BallBehavior';

module.exports = BallBehavior;