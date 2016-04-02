/**
 * Created by ryan on 01/04/16.
 */
var inherits = require('inherits');
var Powerup = require('polyball/shared/model/powerups/Powerup');
var StyleCommons = require('polyball/shared/StyleCommons');
var _ = require('lodash');
var Events = require('polyball/shared/model/behaviors/Events');

/**
 * This powerup makes balls worth an additional point
 * @param config - see powerup config
 * @constructor
 */
var KingMidas = function (config){
    config.body.styles = StyleCommons.kingMidasStyle;

    Powerup.call(this, config);
    this.name = KingMidas.Name;
};

inherits(KingMidas, Powerup);

KingMidas.prototype.handleGoal = function(event){
    if (event.ball.lastTouchedID === this.owner){
        var player = this.model.getPlayer(this.owner);
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
    if (!this.active){
        this.model = model;
        KingMidas.super_.prototype.activate.call(this, model);
        model.getWorld().on(Events.ballGoalCollision, this.handleGoal, this);
        this.active = true;
    }
};

KingMidas.prototype.deactivate = function(model){
    if (this.active){
        model.getWorld().off(Events.ballGoalCollision, this.handleGoal, this);
        this.active = false;
    }
};

KingMidas.prototype.toConfig = function (){
    var config = { name: this.name};
    _.assign(config, KingMidas.super_.prototype.toConfig.call(this));
    return config;
};


KingMidas.Name = "KingMidas";

module.exports = KingMidas;