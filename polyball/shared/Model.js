"use strict";

var _ = require('lodash');
var Physics = require('physicsjs');
var Util = require('polyball/shared/utilities/Util');
var EngineStatus = require('polyball/shared/EngineStatus.js');
var PowerupElection = require('polyball/shared/powerups/PowerupElection');

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
     * The number of milliseconds in the current round.
     * @type {Number}
     */
    var roundLength;

    /**
     * The number of milliseconds elapsed in the current round.
     * @type {Number}
     */
    var currentRoundTime;

    /**
     * @type PowerupElection
     */
    this.powerupElection;

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
     * @returns {World}
     */
    this.getWorld = function () {
        return world;
    };

    /**
     * The round length in milliseconds.
     * @returns {Number}
     */
    this.getRoundLength = function () {
        return roundLength;
    };

    /**
     * Set the round length in milliseconds.
     * @param newRoundLength
     */
    this.setRoundLength = function (newRoundLength) {
        roundLength = newRoundLength;
    };

    /**
     * The current time elapsed in the round.
     * @returns {Number}
     */
    this.getCurrentRoundTime = function () {
        return currentRoundTime;
    };

    /**
     * Set the current round elapsed time.
     * @param newCurrentTime
     */
    this.setCurrentRoundTime = function (newCurrentTime) {
        currentRoundTime = newCurrentTime;
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
    //             Powerup Election
    //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Returns the internal instance of Powerup Election
     * @Returns {PowerupElection}
     */
    this.getPowerupElection = function (){
        return this.powerupElection;
    };

    /**
     * Sets the internal instance of Powerup Election
     * @param {PowerupElection} config
     */
    this.setPowerupElection = function(config){

        var newConfig = {
            id: config.id ? config.id : nextID()
        };

        _.assign(newConfig, config);

        this.powerupElection = new PowerupElection(newConfig);
    };

    /**
     * Stops the current powerup election
     */
    this.clearPowerupElection = function(){
        this.powerupElection = null;
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

