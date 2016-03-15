/**
 * Created by ryan on 13/03/16.
 */

//TODO remove lint ignore flags

var Physics = require('physicsjs'); //jshint ignore:line
var EngineStatus = require('polyball/server/EngineStatus.js');
var Comms = require('polyball/server/Comms'); //jshint ignore:line
var Configuration = require('polyball/server/Configuration'); //jshint ignore:line
var _ = require('lodash');

/**
 * Initializes the engine
 *
 * @param {{comms: Comms,
 *          configuration: Configuration,
 *          model: Model}} config
 * @constructor
 */
function Engine(config) {
    this.comms = config.comms;
    this.configuration = config.configuration;
    this.model = config.model;

    // TODO Add Comms Subs
    // - Need to pub sub "Add Spectator"
    // - Need to pub sub "Add Player to queue"
    // - Need to pub sub "Add Vote"
    // - Need to pub sub collect input

    // Initialize some physics stuff, probably need a shared class to do this properly
    // Since client will perform a similar setup
    this.model.getWorld().add([
        Physics.behavior('constant-acceleration'),
        Physics.behavior('body-impulse-response'),
        Physics.behavior('body-collision-detection'),
        Physics.behavior('sweep-prune')
    ]);

    this.initializeGame();
}

/**
 * Initializes the game:
 *  - Pulls players out of player queue
 *  - Checks to see if we have enough players to start
 *  - Broadcasts the start time to clients
 */
Engine.prototype.initializeGame = function(){
    this.status = EngineStatus.gameInitializing;

    //TODO un-queue players and add them to game

    //TODO Change this "3" constant to a reference to some "Constants" Object containing minPlayers
    if (this.model.playerCount() > 3){
        //TODO figure out radius as a function of # players
        this.model.addOrResetArena({
            numberPlayers: this.model.playerCount(),
            arenaRadius: 1000
        });

        //TODO get longest client latency
        var startTime = 10;

        //TODO broadcast to all clients, start in startTime miliseconds

        setTimeout(this.startGame(), startTime);
    }
};


/**
 * Starts the engine:
 *  - Schedules the main loop
*/
Engine.prototype.startGame = function(){
    //Add the balls to the game
    _.times(this.model.playerCount(), function(x){
        setTimeout(this.model.addBall, x * 500);
    });

    //TODO change this 30 constant to reference to some "Constants" Object containing serverTick
    this.gameLoop = setInterval(this.update(), 30);
};

/**
 * The game loop
 */
Engine.prototype.update = function(){
    // TODO progress game simulation
    this.model.getWorld().step();
    // TODO Broadcast new model
    this.broadcastModel();
};


/**
 * Handles all the logic to end the game
 */
Engine.prototype.endGame = function(){
    this.status = EngineStatus.gameFinishing;
    clearInterval(this.gameLoop);

    // TODO tell all clients to show top 3 players for 5 seconds

    // TODO replace 5000 with a reference to some "Constants" object
    setTimeout(5000, this.initializeGame());
};

/**
 * Handles all the logic to interface with server comms and broadcast
 * the model
 */
Engine.prototype.broadcastModel = function (){
    // TODO Interface to comms, and broadcast the model
};

/**
 * Handles all the logic to interface with server comms and broadcast
 * the
 * @param {Number} spectatorID
 */
Engine.prototype.handleAddPlayerToQueue = function (spectatorID){

    this.model.addToPlayerQueue(spectatorID);

    // Are we waiting for players to start?
    if (this.status === EngineStatus.gameInitializing){
        this.initializeGame();
    }
};

module.exports = Engine;