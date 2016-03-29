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

function searchAndDelete(snapshotArray, modelGet, modelDelete, model) {
    var toDelete = modelGet.call(model, function (modelEntity) {
        var foundInSnapshot = _.find(snapshotArray, function (snapshotEntity) {
            return snapshotEntity.id === modelEntity.id;
        });

        return foundInSnapshot == null;
    });

    toDelete.forEach(function (modelEntity) {
        modelDelete.call(model, modelEntity.id);
    });
}

function searchAndCreate(snapshotArray, modelHas, modelAdd, model) {
    snapshotArray.forEach(function (snapshotEntity) {
        if (!modelHas.call(model, snapshotEntity.id)) {
            modelAdd.call(model, snapshotEntity);
        }
    });
}

function syncSpectatorExistence(spectators, model) {
    if (spectators != null) {
        Logger.debug('synchronizing spectators');

        searchAndDelete(spectators, model.getSpectators, model.deleteSpectator, model);
        searchAndCreate(spectators, model.hasSpectator, model.addSpectator, model);
    }
}

function syncPlayerExistence(players, model) {
    if (players != null) {
        Logger.debug('synchronizing players');

        searchAndDelete(players, model.getPlayers, model.deletePlayer, model);
        searchAndCreate(players, model.hasPlayer, model.addPlayer, model);
    }
}

function syncBallExistence(balls, model) {
    if (balls != null) {
        Logger.debug('synchronizing balls');

        searchAndDelete(balls, model.getBalls, model.deleteBall, model);
        searchAndCreate(balls, model.hasBall, model.addBall, model);
    }
}

function syncPowerupExistence(powerups, model) {
    if (powerups != null) {
        Logger.debug('synchronizing powerup');

        searchAndDelete(powerups, model.getPowerups, model.deletePowerup, model);
        searchAndCreate(powerups, model.hasPowerup, model.addPowerup, model);
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
    syncPowerupExistence(snapshot.powerups, model);
    
    syncDiscreteBallState(snapshot.balls, model);
    
    //   TODO powerups and powerup elections need to be config/construct isomorphic before usable here.  see #136
    // syncPowerupExistence(snapshot, model);
    // model.setPowerupElection()

    model.setPlayerQueue(snapshot.playerQueue);
    model.setRoundLength(snapshot.roundLength);
};

module.exports = PassthroughSynchronizer;