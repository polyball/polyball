/**
 * Created by ryan on 30/03/16.
 */
var Events = require('polyball/shared/model/behaviors/Events');

/**
 *
 * @param config
 * @property {model} config.model
 * @constructor
 */
// SRS Requirement - 3.2.2.10 Goal Scoring
var GoalBehavior = function(config){

    var handleCollision = function(event){
        var player = config.model.getPlayer(event.ball.lastTouchedID);
        if (player != null){
            if (player.id !== event.entity.id){
                player.score += 1;
            } else {
                player.score -= 1;
            }
        }
    };

    // extended
    this.connect = function () {
        config.model.getWorld().on(Events.ballGoalCollision, handleCollision, this);
    };

    // extended
    this.disconnect = function () {
        // unsubscribe when disconnected
        config.model.getWorld().off(Events.ballGoalCollision, handleCollision, this);
    };

};

module.exports = GoalBehavior;