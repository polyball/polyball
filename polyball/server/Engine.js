/**
 * Created by ryan on 13/03/16.
 */
var EngineStatus = require('polyball/server/EngineStatus.js');
var _ = require('lodash');
var CommsEvents = require('polyball/shared/CommsEvents');
var Logger = require('polyball/shared/Logger');
var Blackhole = require('polyball/shared/model/powerups/Blackhole'); //jshint ignore:line
var RoundEngine = require('polyball/shared/RoundEngine');
var RoundEvents = require('polyball/shared/RoundEvents');
var GoalBehavior = require('polyball/shared/model/behaviors/GoalBehavior');
var PowerupBehavior = require('polyball/shared/model/behaviors/PowerupBehavior');

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
    var roundEngine;
    var behaviors = [];

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
                arenaRadius: 350,
                bumperRadius: 60,
                marginX: 0,
                marginY: 0
            });

            addAllPaddles();
            addCustomBehavior(GoalBehavior, {model: model});
            addCustomBehavior(PowerupBehavior, {model: model});

            model.setRoundLength(config.configuration.roundLength);

            roundEngine = new RoundEngine({
                model: model,
                paddleEventsPublisher: comms,
                paddleMoveEvent: CommsEvents.ServerToServer.playerCommandsReceived,
                tickRate: config.configuration.serverTick,
                maxBallVelocity: config.configuration.ballMaxVelocity
            });

            roundEngine.on(RoundEvents.simulationStepped, broadcastModel);
            roundEngine.on(RoundEvents.gameEnded, endGame);

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

        //TEST BLACKHOLE
        setTimeout(function(){
            var bodyConfig = generatePowerupBody();
            bodyConfig.styles = {
                fillStyle: '#000000',
                lineWidth: 1,
                strokeStyle: '#000000',
                layer: 6,
                icon: '\uf069',
                fontstyle: {
                    fill: '#ffffff',
                    font: '30px fontawesome'
                }
            };
            model.addPowerup({
                name: Blackhole.Name,
                body: bodyConfig
            });
        }, 5000);

        roundEngine.start();

    };

    /**
     * Handles all the logic to end the game
     */
    var endGame = function(){
        model.gameStatus = EngineStatus.gameFinishing;
        // TODO tell all clients to show top 3 players for 5 seconds
        model.reset();
        removeBehaviors();
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
                radius: config.configuration.paddleRadius,
                leftBound: {
                    x: leftBound.x,
                    y: leftBound.y
                },
                rightBound: {
                    x: rightBound.x,
                    y: rightBound.y
                },
                body:{
                    cof: 0,
                    state:{
                        pos:{
                            x: paddlePos.x,
                            y: paddlePos.y
                        }
                    },
                }
            };

            model.addPaddleToPlayer({playerID: players[i].id, paddleConfig: paddleConfig});
        }
    };

    var addBall = function (){
        model.addBall({
            body: {
                radius: 10,
                cof: 0,
                state: model.getArena().generateNewBallState()
            }
        });
    };

    /**
     * Generates a body for a new powerup
     * @returns {Object}
     */
    var generatePowerupBody = function(){           //jshint ignore:line
        var position = model.getArena().getCenter();

        return {
            state:{
                pos: {
                    x: position.x,
                    y: position.y
                },
                vel: {
                    x: 0,
                    y: 0
                }
            },
            radius: config.configuration.powerupRadius
        };
    };

    /**
     * Adds Custom behaviors to the world
     * @param constructor
     * @param args
     */
    var addCustomBehavior = function(constructor, args){
        var behavior = new constructor(args);
        behavior.connect();
        behaviors.push(behavior);
    };

    /**
     * Removes all custom behaviors from the world
     */
    var removeBehaviors = function(){
        behaviors.forEach(function(behavior){
            behavior.disconnect();
        });
        behaviors = [];
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
        if (roundEngine) {
            roundEngine.kill();
        }
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