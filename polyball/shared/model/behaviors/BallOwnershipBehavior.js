/**
 * Created by ryan on 28/03/16.
 */
var Physics = require('physicsjs');
var Events = require('polyball/shared/model/behaviors/Events');

/**
 *
 * @param config
 * @property {model} config.model
 * @constructor
 */
var BallOwnershipBehavior = function(config){
    Physics.behavior(BallOwnershipBehavior.Name, function(parent){
        return {
            init: function(options){
                parent.init.call(this);
                this.options(options);

                this.players = {};
                this.balls = {};
                this.ballsLength = 0;

                if (config.model.getPlayers().filter(function(player){
                        return player.paddle;
                    }).length > 0){
                    this.setupPlayers();
                }
            },

            setupPlayers: function(){
                var self = this;
                config.model.getPlayers().forEach(function(player){
                    self.players[player.paddle.body.uid] = player;
                });
            },

            setupBalls: function(){
                var self = this;
                this.balls = {};
                config.model.getBalls().forEach(function(ball){
                    self.balls[ball.body.uid] = ball;
                });
                this.ballsLength = Object.keys(self.balls).length;
            },

            handleCollision: function(event){
                var self = this;
                if (this.ballsLength !== config.model.getBalls().length){
                    self.setupBalls();
                }
                this.balls[event.ball.uid].lastTouchedID = this.players[event.paddle.uid].id;
            },

            // extended
            connect: function (world) {
                world.on(Events.paddleBallCollision, this.handleCollision, this);
            },

            // extended
            disconnect: function (world) {
                // unsubscribe when disconnected
                world.off(Events.paddleBallCollision, this.handleCollision, this);
            }
        };
    });
};

BallOwnershipBehavior.Name = 'BallOwnershipBehavior';

module.exports = BallOwnershipBehavior;