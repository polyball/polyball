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
var GoalBehavior = function(config){

    var handleCollision = function(event){
        var player = config.model.getPlayer(event.ball.lastTouchedID);
        if (player != null){
            player.score += 1;
            console.log(player.client.name + ' : ' + player.score);
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