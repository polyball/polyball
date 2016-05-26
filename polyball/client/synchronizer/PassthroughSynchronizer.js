/**
 * Created by kdban on 3/22/2016.
 */

var _ = require('lodash');
var Logger = require('polyball/shared/Logger');
var EngineStatus = require('polyball/shared/EngineStatus');


/*
 *
 * Generic creation and deletion functions
 */

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

        searchAndDelete(spectators, model.spectatorsContainer.getSpectators, model.spectatorsContainer.deleteSpectator, model);
        searchAndCreate(spectators, model.spectatorsContainer.hasSpectator, model.spectatorsContainer.addSpectator, model);
    }
}


/*
 *
 * Existential synchronization functions.
 */

function syncArenaExistence(arena, model) {
    if (arena != null && !model.arenaContainer.hasArena(arena.id)) {
        Logger.info('Synchronizer constructing new arena');
        model.arenaContainer.addOrResetArena(arena);
    }
}

function syncPlayerExistence(players, model) {
    if (players != null) {
        Logger.debug('synchronizing players');

        players.forEach(function (player) {
           if (isLocalClient(player.id, model)){
                if (player.paddleConfig){
                    player.paddleConfig.local = true;
                }
           }
        });

        searchAndDelete(players, model.playersContainer.getPlayers, model.playersContainer.deletePlayer, model);
        searchAndCreate(players, model.playersContainer.hasPlayer, model.playersContainer.addPlayer, model);
    }
}

function syncBallExistence(balls, model) {
    if (balls != null) {
        Logger.debug('synchronizing balls');

        searchAndDelete(balls, model.ballsContainer.getBalls, model.ballsContainer.deleteBall, model);
        searchAndCreate(balls, model.ballsContainer.hasBall, model.ballsContainer.addBall, model);
    }
}

function syncPowerupExistence(powerups, model) {
    if (powerups != null) {
        Logger.debug('synchronizing powerup');

        searchAndDelete(powerups, model.powerupsContainer.getPowerups, model.powerupsContainer.deletePowerup, model);
        searchAndCreate(powerups, model.powerupsContainer.hasPowerup, model.powerupsContainer.addPowerup, model);
    }
}


/*
 *
 * Discrete state synchronization functions.
 * (Other state sync handled by Interpolator and Reconciler.)
 */

function syncDiscreteSpectatorState(spectators, model) {
    if (spectators != null) {
        spectators.forEach(function (snapshotSpectator) {
            var spectator = model.spectatorsContainer.getSpectator(snapshotSpectator.id);

            if (spectator == null) {
                throw 'syncDiscreteSpectatorState could not find spectator that MUST exist by now.';
            }

            spectator.client.name = snapshotSpectator.clientConfig.name;
        });
    }
}

function syncDiscretePlayerState(players, model) {
    if (players != null) {
        players.forEach(function (snapshotPlayer) {
            var player = model.playersContainer.getPlayer(snapshotPlayer.id);

            if (player == null) {
                throw 'syncDiscretePlayerState could not find player that MUST exist by now.';
            }

            if (player.paddle == null && snapshotPlayer.paddleConfig != null) {
                snapshotPlayer.paddleConfig.local = isLocalClient(snapshotPlayer.id, model);
                var paddleAddConfig = {
                    playerID: snapshotPlayer.id,
                    paddleConfig: snapshotPlayer.paddleConfig
                };
                model.playersContainer.addPaddleToPlayer(paddleAddConfig);
            }
            player.arenaPosition = snapshotPlayer.arenaPosition;
            player.score = snapshotPlayer.score;
            player.client.name = snapshotPlayer.clientConfig.name;
        });
    }
}

function syncDiscreteBallState(balls, model) {
    if (balls != null) {
        balls.forEach(function (snapshotBall) {
            var ball = model.ballsContainer.getBall(snapshotBall.id);

            if (ball == null) {
                throw 'syncDiscreteBallState could not find ball that MUST exist by now.';
            }

            ball.lastTouchedID = snapshotBall.lastTouchedID;
            ball.body.treatment = snapshotBall.body.treatment ? snapshotBall.body.treatment : 'dynamic';
        });
    }
}

function syncDiscretePowerupState(powerups, model) {
    if (powerups != null) {
        powerups.forEach(function (snapshotPowerup) {
            var powerup = model.powerupsContainer.getPowerup(snapshotPowerup.id);

            if (powerup == null) {
                throw 'syncDiscretePowerupState could not find powerup that MUST exist by now.';
            }

            if (!powerup.isActive() && snapshotPowerup.active) {
                Logger.info("PassthroughSync activating powerup");
                powerup._powerupActivate(model);
            } else if (powerup.isActive() && !snapshotPowerup.active) {
                Logger.info('PassthroughSync deactivating powerup');
                powerup._powerupDeactivate(model);
            }

            powerup.owner = snapshotPowerup.owner;
        });
    }
}


function syncPowerupElection(election, model) {
    if (election != null) {
        model.powerupElectionContainer.setPowerupElection(election);
    } else {
        model.powerupElectionContainer.clearPowerupElection();
    }
}

function isLocalClient(entityID, model) {
    return entityID === model.getLocalClientID();
}


/*
 *
 * Module definition.
 */

var PassthroughSynchronizer = {};

/**
 * Sync the existence and discrete state of game entities.
 * 
 * @param {Object} snapshot
 * @param {Model} model
 */
PassthroughSynchronizer.sync = function (snapshot, model) {
    
    syncArenaExistence(snapshot.arena, model);
    syncSpectatorExistence(snapshot.spectators, model);
    syncPlayerExistence(snapshot.players, model);
    syncBallExistence(snapshot.balls, model);
    syncPowerupExistence(snapshot.powerups, model);

    syncDiscreteSpectatorState(snapshot.spectators, model);
    syncDiscretePlayerState(snapshot.players, model);
    syncDiscreteBallState(snapshot.balls, model);
    syncDiscretePowerupState(snapshot.powerups, model);
    
    syncPowerupElection(snapshot.powerupElection, model);

    model.spectatorsContainer.setPlayerQueue(snapshot.playerQueue);
    model.roundTimingContainer.setRoundLength(snapshot.roundLength);
    model.gameStatus = snapshot.gameStatus;

    if (snapshot.gameStatus !== EngineStatus.gameRunning) {
        model.powerupsContainer.clearPowerups();
        model.powerupElectionContainer.clearPowerupElection();
    }
};

module.exports = PassthroughSynchronizer;