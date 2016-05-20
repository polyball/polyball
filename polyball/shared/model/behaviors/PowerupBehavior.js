/**
 * Created by ryan on 30/03/16.
 */
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
var PowerupBehavior = function(config){

    var handleCollision = function(event){
        var player = config.model.playersContainer.getPlayer(event.ball.lastTouchedID);
        if (player != null){
            event.entity.owner = player.id;
            event.entity._powerupActivate(config.model);
        }
    };

    // extended
    this.connect = function () {
        config.model.getWorld().on(Events.ballPowerupCollision, handleCollision, this);
    };

    // extended
    this.disconnect = function () {
        // unsubscribe when disconnected
        config.model.getWorld().off(Events.ballPowerupCollision, handleCollision, this);
    };

};

module.exports = PowerupBehavior;