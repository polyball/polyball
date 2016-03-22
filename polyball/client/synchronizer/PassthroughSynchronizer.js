/**
 * Created by kdban on 3/22/2016.
 */

var _ = require('lodash');
var Logger = require('polyball/shared/Logger');

function syncArenaExistence(arena, model) {
    if (arena != null && !model.hasArena(arena.id)) {
        Logger.info('Synchronizer constructing new arena');
        model.addOrResetArena(arena);
    }
}

function syncSpectatorExistence(spectators, model) { // jshint ignore: line
    
}

function syncPlayerExistence(players, model) { // jshint ignore: line
    
}

function syncBallExistence(balls, model) {
    
    if (balls != null) {
        Logger.debug('synchronizing balls');

        // clear out old balls
        var ballsToDelete = model.getBalls(function (ball) {
            var foundInSnapshot = _.find(balls, function (snapshotBall) {
                return snapshotBall.id === ball.id;
            });

            return foundInSnapshot == null;
        });

        ballsToDelete.forEach(function (ball) {
            model.deleteBall(ball.id);
        });

        // add new balls
        balls.forEach(function (snapshotBall) {
            if (!model.hasBall(snapshotBall.id)) {
                model.addBall(snapshotBall);
            }
        });
    }
}

function syncDiscreteBallState(balls, model) {
    if (balls != null) {
        balls.forEach(function (snapshotBall) {
            var ball = model.getBall(snapshotBall.id);
            
            if (ball == null) {
                throw 'syncDiscreteBallState could not find ball that MUST exist by now.';
            }
            
            ball.lastTouchedID = snapshotBall.lastTouchedID;
        });
    }
}


var PassthroughSynchronizer = {};
/**
 * 
 * @param snapshot
 * @param {Model} model
 */
PassthroughSynchronizer.sync = function (snapshot, model) {
    
    syncArenaExistence(snapshot.arena, model);
    syncSpectatorExistence(snapshot.spectators, model);
    syncPlayerExistence(snapshot.players, model);
    syncBallExistence(snapshot.balls, model);
    
    syncDiscreteBallState(snapshot.balls, model);
    
    //   TODO powerups and powerup elections need to be config/construct isomorphic before usable here.  see #136
    // syncPowerupExistence(snapshot, model);
    // model.setPowerupElection()

    model.setPlayerQueue(snapshot.playerQueue);
    model.setRoundLength(snapshot.roundLength);
};

module.exports = PassthroughSynchronizer;