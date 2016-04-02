/**
 * Created by kdban on 3/23/2016.
 */

/**
 * 
 * @param {Object} config
 * @property {Model} config.model
 * @constructor
 */
var Reconciler = function (config) {
    
    var model = config.model;

    var unsentCommands = [];

    /**
     * A function that returns sequential integers starting at 0;
     */
    var nextLocalCommandNumber = (function () {
        var nextID = -1;
        return function () {
            nextID += 1;
            return nextID;
        };
    }());
    
    
    this.registerMouseMove = function (delta) {

        unsentCommands.push({
            sequenceNumber: nextLocalCommandNumber(),
            moveDelta: delta
        });
        // affect model state, record resulting state
        // add to unsent commands
        // add to reconciliation buffer
    };
    
    this.getAndClearUnsentCommands = function () {
        // remove from unsent commands
        // return them

        var toReturn = unsentCommands;
        unsentCommands = [];
        return toReturn;
    };

    /**
     * Use acknowledged sequence numbers and states to mutate the model.
     * @param players
     */
    this.reconcileServerPlayerState = function (players) {

        if (players != null) {
            // compare received state to buffered state @ received sequence #
            // if the states are not the same:
            // repopulate buffer forward of sequence # based on received state
            // mutate model based on final buffered state
            // purge buffer at and before received sequence number

            var localPlayer = model.getPlayer(model.getLocalClientID());
            players.forEach(function (snapshotPlayer) {

                if (localPlayer != null &&
                    localPlayer.id === snapshotPlayer.id &&
                    localPlayer.paddle != null &&
                    snapshotPlayer.paddleConfig != null) {

                    localPlayer.paddle.body.state.pos.x = snapshotPlayer.paddleConfig.body.state.pos.x;
                    localPlayer.paddle.body.state.pos.y = snapshotPlayer.paddleConfig.body.state.pos.y;
                }
            });
        }
    };
};


module.exports = Reconciler;