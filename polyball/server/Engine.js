/**
 * Created by ryan on 13/03/16.
 */

//TODO remove lint ignore flags

var Physics = require('physicsjs'); //jshint ignore:line
var EngineStatus = require('polyball/server/EngineStatus.js');
var _ = require('lodash');
var CommsEvents = require('polyball/shared/CommsEvents');
var Logger = require('polyball/shared/Logger');

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
        Logger.info('Initializing game');

        setupPlayers();
        Logger.info("Number of Players: " + model.playerCount());

        if (model.playerCount() >= configuration.minimumPlayers){
            //TODO figure out radius as a function of # players
            model.addOrResetArena({
                numberPlayers: model.playerCount(),
                arenaRadius: 300,
                bumperRadius: 35,
                marginX: 60,
                marginY: 60
            });

            addAllPaddles();

            comms.broadcastSynchronizedStart({
                snapshot: model.getSnapshot(),
                minimumDelay: 0
            }, startGame);
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
            setTimeout(addBall, x * 500);
        });

        gameStartTime = Date.now();
        model.currentRoundTime = 0;
        this.gameLoop = setInterval(update, config.configuration.serverTick);
    };


    /**
     * The game loop
     */
    var update = function(){
        var time = Date.now;
        model.getWorld().step(time-model.currentRoundTime);
        model.currentRoundTime = time - gameStartTime;

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

        setTimeout(initializeGame, config.roundIntermission);
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

        //TODO Client probably wants to know it is now a player
        // broadcastModel();
    };

    /**
     * Converts a spectator into a player
     * @param {Spectator} spectator
     */
    var convertSpectatorToPlayer = function (spectator) {
        model.addPlayer({
            clientConfig: spectator.client.toConfig()
        });
        model.deleteSpectator(spectator.id);
    };

    /**
     * Handles adding paddles to each player
     */
    var addAllPaddles = function () {
        var players = model.getPlayers();
        for(var i=0; i < players.length; i++){
            var leftBound = model.getArena().getPaddleLeftBound(i);
            var rightBound = model.getArena().getPaddleRightBound(i);
            var paddlePos = model.getArena().getPaddleStartPosition(i);

            players[i].arenaPosition = i;

            var paddleConfig = {
                leftBound: {
                    x: leftBound.x,
                    y: leftBound.y
                },
                rightBound: {
                    x: rightBound.x,
                    y: rightBound.y
                },
                //TODO get this from config
                body:{
                    state:{
                        pos:{
                            x: paddlePos.x,
                            y: paddlePos.y
                        }
                    },
                    radius: 50
                }
            };

            model.addPaddleToPlayer({playerID: players[i].id, paddleConfig: paddleConfig});
        }
    };

    var addBall = function (){
        model.addBall({
            body: {
                radius: 10,
                state: model.getArena().generateNewBallState()
            }
        });
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
    comms.on(CommsEvents.ServerToServer.newPlayerQueued, this.handleAddPlayerToQueue);
    // - Need to pub sub "Add Vote"
    // comms.on('Add Vote', this.handleAddVote);

    initializeGame();
};

module.exports = Engine;