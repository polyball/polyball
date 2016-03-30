/**
 * Created by ryan on 28/03/16.
 */
var Events = require('polyball/shared/model/behaviors/Events');

/**
 *
 * @param config
 * @property {model} config.model
 * @constructor
 */
var BallOwnershipBehavior = function(config){

    var handleCollision = function(event){
        event.ball.lastTouchedID = event.entity.id;
    };

    // extended
    this.connect = function () {
        config.model.getWorld().on(Events.paddleBallCollision, handleCollision, this);
    };

    // extended
    this.disconnect = function () {
        // unsubscribe when disconnected
        config.model.getWorld().off(Events.paddleBallCollision, handleCollision, this);
    };

};

module.exports = BallOwnershipBehavior;