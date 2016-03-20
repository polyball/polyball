/**
 * Created by ryan on 13/03/16.
 */

//TODO remove lint ignore flags

var Physics = require('physicsjs'); //jshint ignore:line
var EngineStatus = require('polyball/server/EngineStatus.js');
var _ = require('lodash');
var Paddle = require('polyball/shared/model/Paddle');

/**
 * Initializes the engine
 *
 * @param {{comms: Comms,
 *          configuration: Configuration,
 *          model: Model}} config
 * @constructor
 */
var Engine = function (config) {

    // =========================== Private Variables ==============================
    // ============================================================================
    var comms = config.comms;
    var configuration = config.configuration;
    var model = config.model;
    var gameStartTime;

    // ============================= Private Methods ==============================
    // ============================================================================

    // ========================= Game Lifecycle Functions =========================
    // ============================================================================
    /**
     * Initializes the game:
     *  - Pulls players out of player queue
     *  - Checks to see if we have enough players to start
     *  - Broadcasts the start time to clients
     */
    var initializeGame = function(){
        this.status = EngineStatus.gameInitializing;

        setupPlayers();

        if (model.playerCount() > configuration.minimumPlayers()){
            //TODO figure out radius as a function of # players
            model.addOrResetArena({
                numberPlayers: model.playerCount(),
                arenaRadius: 1000
            });

            addAllPaddles();

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
        this.status = EngineStatus.gameRunning;

        //Add the balls to the game
        _.times(model.playerCount(), function(x){
            setTimeout(model.addBall, x * 500);
        });

        gameStartTime = Date.now();
        model.currentRoundTime = 0;
        this.gameLoop = setInterval(update(), config.configuration.serverTick);
    };


    /**
     * The game loop
     */
    var update = function(){
        var time = Date.now;
        model.getWorld().step(time-model.currentRoundTime);
        model.currentRoundTime = time - gameStartTime;

        // TODO Broadcast new model
        broadcastModel();

        if(model.currentRoundTime >= model.roundLength){
            endGame();
        }
    };

    /**
     * Handles all the logic to end the game
     */
    var endGame = function(){
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
        comms.broadcastSnapshot(model.getSnapshot());
    };


    // ============================= Game Setup Helpers ===============================
    // ============================================================================
    /**
     * Handles moving spectators who are in the playerQueue into the players list
     */
    var setupPlayers = function (){
        while(model.playerCount() < config.configuration.maximumPlayers && model.numberOfQueuedPlayers() > 0){
            convertSpectatorToPlayer(model.popPlayerQueue());
        }
    };

    /**
     * Converts a spectator into a player
     * @param {Spectator} spectator
     */
    var convertSpectatorToPlayer = function (spectator) {
        model.addPlayer(spectator.client.toConfig());
        model.deleteSpectator(spectator.id);
    };

    /**
     * Handles adding paddles to each player
     */
    var addAllPaddles = function () {
        var players = model.getPlayers();
        for(var i=0; i < players.length; i++){
            players[i].addPaddle(Paddle.fromGoal({
                size: config.configuration.paddleSize,
                padding: config.configuration.paddlePadding,
                goal: model.getArena().getGoal(i)
            }));
        }
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
     * @param {{vote: Vote}} data
     */
    this.handleAddVote = function (data){
        model.getPowerupElection().addVote(data.vote);
    };

    // ========================== Engine Construction =============================
    // ============================================================================

    // - Need to pub sub "Add Player to queue"
    comms.on('Add Player To Queue', this.handleAddPlayerToQueue);
    // - Need to pub sub "Add Vote"
    comms.on('Add Vote', this.handleAddVote);

    // Initialize some physics stuff, probably need a shared class to do this properly
    // Since client will perform a similar setup
    model.getWorld().add([
        Physics.behavior('constant-acceleration'),
        Physics.behavior('body-impulse-response'),
        Physics.behavior('body-collision-detection'),
        Physics.behavior('sweep-prune')
    ]);

    initializeGame();
};

module.exports = Engine;