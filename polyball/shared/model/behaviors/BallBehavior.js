/**
 * Created by ryan on 27/03/16.
 */
var _ = require('lodash');
var Events = require('polyball/shared/model/behaviors/Events');

/**
 *
 * @param config
 * @property {number} config.ballMaxVelocity
 * @property {model} config.model
 * @constructor
 */
var BallBehavior = function(config){

    /**
     * The balls marked for velocity clamping
     * @type {{Ball}}
     */
    var markedBalls = {};

        var clampVelocities = function(){
            if (!_.isEmpty(markedBalls)){
                for (var index in markedBalls){
                    if (markedBalls.hasOwnProperty(index)){
                        var ball = markedBalls[index];
                        if (ball.body.state.vel.norm() > config.ballMaxVelocity){
                            ball.body.state.vel.normalize().mult(config.ballMaxVelocity);
                        }
                    }
                }
                markedBalls = {};
            }
        };

    /**
     * Handles collision events
     * @param event
     * @property {Ball} event.ball
     * @property {Paddle} event.entity
     */
    var handleCollision = function(event){
            markedBalls[event.ball.id] = event.ball;
    };

    this.connect = function () {
        config.model.getWorld().on('integrate:velocities', clampVelocities, this);
        config.model.getWorld().on(Events.paddleBallCollision, handleCollision, this);
    };

    this.disconnect = function () {
        // unsubscribe when disconnected
        config.model.getWorld().off('integrate:velocities', clampVelocities, this);
        config.model.getWorld().off(Events.paddleBallCollision, handleCollision, this);
    };

};

BallBehavior.Name = 'BallBehavior';

module.exports = BallBehavior;