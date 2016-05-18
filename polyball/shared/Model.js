"use strict";

var Physics = require('physicsjs');
var EngineStatus = require('polyball/shared/EngineStatus.js');
var ArenaContainer = require('polyball/shared/model/containers/ArenaContainer');
var BallsContainer = require('polyball/shared/model/containers/BallsContainer');
var PlayersContainer = require('polyball/shared/model/containers/PlayersContainer');
var PowerupsContainer = require('polyball/shared/model/containers/PowerupsContainer');
var PowerupElectionContainer = require('polyball/shared/model/containers/PowerupElectionContainer');
var RoundTimeingContainer = require('polyball/shared/model/containers/RoundTimingContainer');
var SpectatorsContainer = require('polyball/shared/model/containers/SpectatorsContainer');


/**
 * Holds all data for client and server game instances.  Exposes CRUD operations for data.
 * @constructor
*/
var Model = function () {

    //
    //    ########  ########  #### ##     ##    ###    ######## ########
    //    ##     ## ##     ##  ##  ##     ##   ## ##      ##    ##
    //    ##     ## ##     ##  ##  ##     ##  ##   ##     ##    ##
    //    ########  ########   ##  ##     ## ##     ##    ##    ######
    //    ##        ##   ##    ##   ##   ##  #########    ##    ##
    //    ##        ##    ##   ##    ## ##   ##     ##    ##    ##
    //    ##        ##     ## ####    ###    ##     ##    ##    ########
    //
    ///////////////////////////////////////////////////////////////////////////

    var world = Physics({maxIPF: 10000});

    /**
     * IGNORED BY SERVER.
     * The Player (or Spectator) Client id for the client machine.
     * @type Number
     */
    var localClientID;

    //
    //    ########  ##     ## ########  ##       ####  ######
    //    ##     ## ##     ## ##     ## ##        ##  ##    ##
    //    ##     ## ##     ## ##     ## ##        ##  ##
    //    ########  ##     ## ########  ##        ##  ##
    //    ##        ##     ## ##     ## ##        ##  ##
    //    ##        ##     ## ##     ## ##        ##  ##    ##
    //    ##         #######  ########  ######## ####  ######
    //
    ///////////////////////////////////////////////////////////////////////////
    this.gameStatus = EngineStatus.gameInitializing;
    this.collisionsPruner = null;

    /**
     * @type {ArenaContainer}
     */
    this.arenaContainer = new ArenaContainer({world: world});

    /**
     * @type {BallsContainer}
     */
    this.ballsContainer = new BallsContainer({world: world});

    /**
     * @type {PlayersContainer}
     */
    this.playersContainer = new PlayersContainer({world: world});

    /**
     * @type {PowerupsContainer}
     */
    this.powerupsContainer = new PowerupsContainer({world: world});

    /**
     * @type {PowerupElectionContainer}
     */
    this.powerupElectionContainer = new PowerupElectionContainer();

    /**
     * @type {RoundTimingContainer}
     */
    this.roundTimingContainer = new RoundTimeingContainer();

    /**
     * @type {SpectatorsContainer}
     */
    this.spectatorsContainer = new SpectatorsContainer();

    /**
     * @returns {World}
     */
    this.getWorld = function () {
        return world;
    };

    /**
     * IGNORED BY SERVER.
     * Get the Player or Spectator Client ID for the local client machine.
     * @returns {Number}
     */
    this.getLocalClientID = function () {
        return localClientID;
    };

    /**
     * IGNORED BY SERVER.
     * Set the Player or Spectator Client ID for the local client machine.
     * @param {Number} newID
     */
    this.setLocalClientID = function (newID) {
        localClientID = newID;
    };

    //
    //             SNAPSHOT
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Converts this Model object into it's config (serializable) form
     * @return {Object}
     */
    this.getSnapshot = function() {

        var snapshot = {
            arena: this.arenaContainer.arenaConfig(),
            players: this.playersContainer.playersConfig(),
            spectators: this.spectatorsContainer.spectatorsConfig(),
            balls: this.ballsContainer.ballsConfig(),
            playerQueue: this.spectatorsContainer.playerQueueConfig(),
            powerups: this.powerupsContainer.powerupsConfig(),
            powerupElection: this.powerupElectionContainer.powerupElectionConfig(),
            roundLength: this.roundTimingContainer.getRoundLength(),
            currentRoundTime: this.roundTimingContainer.getCurrentRoundTime(),
            gameStatus: this.gameStatus
        };

        snapshot.players.forEach(function (playerConfig) {
            delete playerConfig.clientConfig.socket;
        });

        snapshot.spectators.forEach(function (spectatorConfig) {
            delete spectatorConfig.clientConfig.socket;
        });

        return snapshot;
    };

    //
    //
    //  Reset / Cleanup
    //
    /////////////////////////////////////////////////////////////////////////////////

    this.reset = function(){
        world.pause();

        world.remove(world.getBodies());
        world.remove(world.getBehaviors());

        this.ballsContainer.clearBalls();
        this.playersContainer.clearPaddles();
        world.unpause();
    };

};

module.exports = Model;