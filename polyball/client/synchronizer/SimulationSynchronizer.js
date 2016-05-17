/**
 * Created by kdban on 3/22/2016.
 */

var Util = require('polyball/shared/utilities/Util');
var Logger = require('polyball/shared/Logger');

/**
 * Synchronizes the balls and powerups of a model by simulating physics state between snapshots.
 * 
 * @param {Object} config
 * @property {Number} config.largeDelta - The minimum distance between two objects to be rapidly decayed
 * @property {Number} config.rapidDecayRate - In interval (0, 1].   The fraction that large deltas are decayed.
 * @property {Number} config.slowDecayRate - In interval (0, 1].   The fraction that small deltas are decayed.
 * @constructor
 */
var SimulationSynchronizer = function (config) {
    
    this.largeDelta = config.largeDelta;
    this.rapidDecayRate = config.rapidDecayRate;
    this.slowDecayRate = config.slowDecayRate;

    var authoritativeSnapshot;

    /**
     * Give the simulation a source of truth to simulate.
     * @param {Object} simulationSnapshot
     * @property {Ball[]) simulationSnapshot.balls
     */
    this.setAuthoritativeSnapshot = function (simulationSnapshot) {
        authoritativeSnapshot = simulationSnapshot;
    };

    /**
     * Mutate the physics simulation of a model to converge upon a state predicted from the authoritative snapshot.
     * The balls and powerups (before activation) are the only things mutated, though other state is used to simulate.
     *
     * @param {Model} model - The model to mutate.
     */
    this.tick = function (model) {
        if (authoritativeSnapshot == null) {
            Logger.warn("Cannot synchronize simulation without authoritative snapshot.");
            return;
        }

        if (authoritativeSnapshot.balls != null) {
            authoritativeSnapshot.balls.forEach(function (snapshotBall) {
                var ball = model.getBall(snapshotBall.id);

                if (ball == null) {
                    Logger.warn('Snapshot ball not found in model!  Should not be possible.');
                    return;
                }

                Util.assignPhysicsState(snapshotBall.body.state, ball.body.state);
            });
        }

        if (authoritativeSnapshot.powerups != null) {
            authoritativeSnapshot.powerups.forEach(function (snapshotPowerup) {
                var powerup  = model.getPowerup(snapshotPowerup.id);

                if (powerup == null) {
                    Logger.warn('Snapshot ball not found in model!  Should not be possible.');
                    return;
                }

                Util.assignPhysicsState(snapshotPowerup.body.state, powerup.body.state);
            });
        }
        
    };
};

module.exports = SimulationSynchronizer;