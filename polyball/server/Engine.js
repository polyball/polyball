/**
 * Created by ryan on 13/03/16.
 */

//TODO remove lint ignore flags

var Physics = require('physicsjs'); //jshint ignore:line
var EngineStatus = require('polyball/server/EngineStatus.js');
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

    // =========================== Private Variables ==============================
    // ============================================================================
    var comms = config.comms;
    var configuration = config.configuration;
    var model = config.model;

    // ============================= Private Methods ==============================
    // ============================================================================

    /**
     * Initializes the game:
     *  - Pulls players out of player queue
     *  - Checks to see if we have enough players to start
     *  - Broadcasts the start time to clients
     */
    var initializeGame = function(){
        this.status = EngineStatus.gameInitializing;

        //TODO un-queue players and add them to game

        if (model.playerCount() > configuration.minimumPlayers()){
            //TODO figure out radius as a function of # players
            model.addOrResetArena({
                numberPlayers: model.playerCount(),
                arenaRadius: 1000
            });

            //TODO get longest client latency
            var startTime = 10;

            //TODO broadcast to all clients, start in startTime miliseconds

            setTimeout(startGame(), startTime);
        }
    };

    /**
     * Starts the engine:
     *  - Schedules the main loop
     */
    var startGame = function(){
        //Add the balls to the game
        _.times(model.playerCount(), function(x){
            setTimeout(model.addBall, x * 500);
        });

        this.gameLoop = setInterval(this.update(), config.serverTick);
    };


    /**
     * The game loop
     */
        //TODO STOP IGNORING THIS LINE
    var update = function(){    //jshint ignore:line
        // TODO progress game simulation
        model.getWorld().step();
        // TODO Broadcast new model
        broadcastModel();
    };

    /**
     * Handles all the logic to end the game
     */
    //TODO STOP IGNORING THIS LINE
    var endGame = function(){ //jshint ignore:line
        this.status = EngineStatus.gameFinishing;
        clearInterval(this.gameLoop);

        // TODO tell all clients to show top 3 players for 5 seconds

        setTimeout(initializeGame(), config.roundIntermission);
    };

    /**
     * Handles all the logic to interface with server comms and broadcast
     * the model
     */
    var broadcastModel = function (){
        // TODO Interface to comms, and broadcast the model
    };

    // ============================= Public Methods ===============================
    // ============================================================================

    /**
     * Handles the comms event to add a spectator to the player queue
     * @param {{spectatorID: Number}} data
     */
    this.handleAddPlayerToQueue = function (data){

        model.addToPlayerQueue(data.spectatorID);

        // Are we waiting for players to start?
        if (this.status === EngineStatus.gameInitializing){
            initializeGame();
        }
    };

    /**
     * Handles the comms event to add a spectator to the model
     * @param {{spectatorID: Number}} data
     */
    //TODO Stop ignoring this line!
    this.handleAddSpectator = function (data){      //jshint ignore:line
        //TODO handle add spectator to model
    };

    /**
     * Handles the comms event to add a spectator to the model
     * @param {{vote: Vote}} data
     */
        //TODO Stop ignoring this line!
    this.handleAddVote = function (data){      //jshint ignore:line
        //TODO handle add vote to model
    };

    //TODO change this jsdoc to have a proper type for input
    /**
     * Handles the comms event to add client input
     * @param {{input: Object}} data
     */
        //TODO Stop ignoring this line!
    this.handleInput = function (data){      //jshint ignore:line
        //TODO handle add input to model
    };

    // ========================== Engine Construction =============================
    // ============================================================================

    // TODO Add Comms Subs
    // - Need to pub sub "Add Spectator"
    comms.on('Add Spectator', this.handleAddSpectator);
    // - Need to pub sub "Add Player to queue"
    comms.on('Add Player To Queue', this.handleAddPlayerToQueue);
    // - Need to pub sub "Add Vote"
    comms.on('Add Vote', this.handleAddVote);
    // - Need to pub sub collect input
    comms.on('Add Input', this.handleAddVote);

    // Initialize some physics stuff, probably need a shared class to do this properly
    // Since client will perform a similar setup
    model.getWorld().add([
        Physics.behavior('constant-acceleration'),
        Physics.behavior('body-impulse-response'),
        Physics.behavior('body-collision-detection'),
        Physics.behavior('sweep-prune')
    ]);

    initializeGame();
}

module.exports = Engine;