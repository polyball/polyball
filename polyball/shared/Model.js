"use strict";

var Physics = require('physicsjs');
var Util = require('polyball/shared/utilities/Util');
var EngineStatus = require('polyball/shared/EngineStatus.js');
var ArenaContainer = require('polyball/shared/model/containers/ArenaContainer');
var BallsContainer = require('polyball/shared/model/containers/BallsContainer');
var PlayersContainer = require('polyball/shared/model/containers/PlayersContainer');
var PowerupsContainer = require('polyball/shared/model/containers/PowerupsContainer');
var PowerupElectionContainer = require('polyball/shared/model/containers/PowerupElectionContainer');
var RoundTimeingContainer = require('polyball/shared/model/containers/RountTimingContainer');
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



    //
    //             PRIVATE STATE
    //
    ///////////////////////////////////////////////////////////////////////////

    var world = Physics({maxIPF: 10000});

    /**
     * IGNORED BY SERVER.
     * The Player (or Spectator) Client id for the client machine.
     * @type Number
     */
    var localClientID;

    var containers = [];

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
    containers.push(this.arenaContainer);

    /**
     * @type {BallsContainer}
     */
    this.ballsContainer = new BallsContainer({world: world});
    containers.push(this.ballsContainer);

    /**
     * @type {PlayersContainer}
     */
    this.playersContainer = new PlayersContainer({world: world});
    containers.push(this.playersContainer);

    /**
     * @type {PowerupsContainer}
     */
    this.powerupsContainer = new PowerupsContainer({world: world});
    containers.push(this.powerupsContainer);

    /**
     * @type {PowerupElectionContainer}
     */
    this.powerupElectionContainer = new PowerupElectionContainer();
    containers.push(this.powerupElectionContainer);

    /**
     * @type {RoundTimingContainer}
     */
    this.RoundTimingContainer = new RoundTimeingContainer();
    containers.push(this.RoundTimingContainer);

    /**
     * @type {SpectatorsContainer}
     */
    this.spectatorsContainer = new SpectatorsContainer();
    containers.push(this.spectatorsContainer);

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
        // SRS Requirement - 3.2.1.9 Game Model Snapshot
        // This function serializing the entire game state snapshot
    this.getSnapshot = function() {

        var toConfig = function(variable) {
            return variable != null ? variable.toConfig() : null;
        };

        var snapshot = {
            arena: toConfig(arena),
            players: Util.arrayToConfig(players),
            spectators: Util.arrayToConfig(spectators),
            balls: Util.arrayToConfig(balls),
            playerQueue: playerQueue,
            powerups: Util.arrayToConfig(powerups),
            powerupElection: toConfig(powerupElection),
            roundLength: roundLength,
            currentRoundTime: currentRoundTime,
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

        resetBalls();
        resetPaddles();
        world.unpause();
    };

    var resetBalls = function(){
        balls = [];
    };

    var resetPaddles = function(){
        players.forEach(function(player){
            player.paddle = null;
        });
    };
};


/**
 * A callback that returns true or false.
 * @callback Predicate
 * @param {Object} Instance of the type being queried.
 * @return {Boolean}
 */

module.exports = Model;