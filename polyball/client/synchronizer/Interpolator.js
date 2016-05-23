/**
 * Created by kdban on 3/26/2016.
 */

var InterpolationBuffer = require('polyball/client/synchronizer/InterpolationBuffer');

/**
 * Interpolates from past snapshot state smoothly to current times.  Results in increase delay but increase smoothness.
 *
 * @param {Object} config
 * @property {Number} config.receiptInterval - The interval between which new frames ar *ideally* added.
 * @constructor
 */
var Interpolator = function (config) {

    var receiptInterval = config.receiptInterval;  // jshint ignore:line
    
    var buffer = new InterpolationBuffer();

    this.addPastServerState = function(receivedTime, players) {
        if (players != null) {
            buffer.addNewFrame({
                receivedTime: receivedTime,
                playerStates: players
            });
        }
    };

    /**
     * Interpolate local states based on past remote states.
     * 
     * @param {Model} model - the Model whose remote paddles should be interpolated
     * TODO @param currentTime
     */
    this.interpolateState = function (model) {
        var mostRecent = buffer.getMostRecentFrame();
        
        if (mostRecent != null && mostRecent.playerStates != null) {
            mostRecent.playerStates.forEach(function (playerState) {
                var remotePlayer = model.playersContainer.getPlayer(playerState.id);
                var remotePaddle = remotePlayer ? remotePlayer.paddle : null;

                if (playerState.id !== model.getLocalClientID() && remotePlayer != null &&
                    remotePaddle != null && playerState.paddleConfig) {
                    remotePaddle.body.state.pos.x = playerState.paddleConfig.body.state.pos.x;
                    remotePaddle.body.state.pos.y = playerState.paddleConfig.body.state.pos.y;

                    remotePaddle.body.state.vel.x = playerState.paddleConfig.body.state.vel.x;
                    remotePaddle.body.state.vel.y = playerState.paddleConfig.body.state.vel.y;
                }
            });
        }
    };

};


module.exports = Interpolator;