/**
 * Created by ryan on 13/03/16.
 */
var EngineStatus = require('polyball/server/EngineStatus.js');
var _ = require('lodash');
var CommsEvents = require('polyball/shared/CommsEvents');
var Logger = require('polyball/shared/Logger');
var Physics = require('physicsjs');
var PaddleBehavior = require('polyball/shared/model/behaviors/PaddleBehavior');
var BallBehavior = require('polyball/shared/model/behaviors/BallBehavior');
var Blackhole = require('polyball/shared/model/powerups/Blackhole');

/**
 * Initializes the engine
 *
 * @param {{comms: Comms,
 *          configuration: Object,
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
    var gameLoop;

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
        model.gameStatus = EngineStatus.gameInitializing;
        Logger.info('Initializing game');

        setupPlayers();
        Logger.info("Number of Players: " + model.playerCount());

        if (model.playerCount() >= configuration.minimumPlayers){
            //TODO figure out radius as a function of # players
            model.addOrResetArena({
                numberPlayers: model.playerCount(),
                arenaRadius: 400,
                bumperRadius: 60,
                marginX: 0,
                marginY: 0
            });

            addAllPaddles();

            // Behaviors
            new PaddleBehavior({comms: comms, model: model});
            var beh = Physics.behavior('paddleBehavior');
            beh.applyTo(model.getPlayers());
            model.getWorld().add(beh);

            new BallBehavior({ballMaxVelocity: config.configuration.ballMaxVelocity, model: model});
            var ballBehavior = Physics.behavior(BallBehavior.Name);
            model.getWorld().add(ballBehavior);

            //TEST BLACKHOLE
            var blackhole = model.addPowerup({
                name: Blackhole.Name,
                body: model.generatePowerupBody()
            });

            setTimeout(function(){
                blackhole.activate(model);
            }, 10000);

            model.setRoundLength(config.configuration.roundLength);

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
        model.gameStatus = EngineStatus.gameRunning;

        //Add the balls to the game
        _.times(model.playerCount(), function(x){
            setTimeout(addBall, x * 500);
        });

        gameStartTime = Date.now();
        model.currentRoundTime = 0;
        gameLoop = setInterval(update, config.configuration.serverTick);
    };


    /**
     * The game loop
     */
    var update = function(){
        var time = Date.now();
        model.getWorld().step();
        model.currentRoundTime = time - gameStartTime;

        broadcastModel();

        if(model.currentRoundTime >= model.getRoundLength()){
            endGame();
        }
    };

    /**
     * Handles all the logic to end the game
     */
    var endGame = function(){
        model.gameStatus = EngineStatus.gameFinishing;
        clearInterval(gameLoop);

        // TODO tell all clients to show top 3 players for 5 seconds
        model.reset();
        setTimeout(initializeGame, config.configuration.roundIntermission);
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
        var config = {
            clientConfig: spectator.client.toConfig(),
            id: spectator.id
        };

        model.deleteSpectator(spectator.id);
        model.addPlayer(config);
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
                maxVelocity: config.configuration.paddleMaximumVelocity,
                leftBound: {
                    x: leftBound.x,
                    y: leftBound.y
                },
                rightBound: {
                    x: rightBound.x,
                    y: rightBound.y
                },
                body:{
                    state:{
                        pos:{
                            x: paddlePos.x,
                            y: paddlePos.y
                        }
                    },
                    radius: config.configuration.paddleRadius
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
        if (model.gameStatus === EngineStatus.gameInitializing){
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

    /**
     * This function handles play command aggregate events
     * @param {Object} data
     * @property {number} data.playerID
     * @property {Object[]} data.newCommands
     */
    this.handlePlayerCommandReceived = function(data){
        var player = model.getPlayer(data.playerID);
        data.newCommands.forEach(function(command){
            player.paddle.setPosition(command.moveDelta);
            player.lastSequenceNumberAccepted = command.sequenceNumber;
        });
    };

    /**
     * Returns the current game status
     * @returns {number}
     */
    this.getGameStatus = function (){
        return model.gameStatus;
    };

    /**
     * Stop execution of engine
     */
    this.kill = function(){
        clearInterval(gameLoop);
    };

    // ========================== Engine Construction =============================
    // ============================================================================

    // - Need to pub sub "Add Player to queue"
    comms.on(CommsEvents.ServerToServer.newPlayerQueued, this.handleAddPlayerToQueue);
    // - Need to pub sub "Add Vote"
    //comms.on(CommsEvents.ServerToServer.playerCommandsReceived, this.handlePlayerCommandReceived);

    initializeGame();
};

module.exports = Engine;