/**
 * Created by ryan on 13/03/16.
 */
var EngineStatus = require('polyball/shared/EngineStatus.js');
var _ = require('lodash'); //jshint ignore:line
var CommsEvents = require('polyball/shared/CommsEvents');
var Logger = require('polyball/shared/Logger');
var Blackhole = require('polyball/shared/model/powerups/Blackhole'); //jshint ignore:line
var KingMidas = require('polyball/shared/model/powerups/KingMidas'); //jshint ignore:line
var BulletTime = require('polyball/shared/model/powerups/BulletTime'); //jshint ignore:line
var RoundEngine = require('polyball/shared/RoundEngine');
var RoundEvents = require('polyball/shared/RoundEvents');
var GoalBehavior = require('polyball/shared/model/behaviors/GoalBehavior');
var PowerupBehavior = require('polyball/shared/model/behaviors/PowerupBehavior');
var PowerupFactory = require('polyball/shared/PowerupFactory');
var Vote = require('polyball/shared/model/Vote');

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
    var backgroundSnapshotInterval;
    var powerupVoteInterval;

    // ============================= Private Methods ==============================
    // ============================================================================

    // Broadcast snapshots at a lower frequency while the round engine is not running.
    backgroundSnapshotInterval = setInterval(function () {
        if (model.gameStatus !== EngineStatus.gameRunning) {
            broadcastModel();
        }
    }, 200);

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

        Logger.info("Number of Players: " + model.playerCount());

        if (model.numberOfQueuedPlayers() + model.playerCount() >= configuration.minimumPlayers){
            setupPlayers();

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

            // This method sends a snapshot to clients at a regular interval
            roundEngine.on(RoundEvents.simulationStepped, broadcastModel);

            roundEngine.on(RoundEvents.gameEnded, endGame);

            comms.broadcastSynchronizedStart({
                snapshot: model.getSnapshot(),
                minimumDelay: 0
            }, startGame);
        } else {
            Logger.info(
                "Insufficient players (" +
                model.playerCount() +
                ") and queued players " +
                model.numberOfQueuedPlayers() +
                ").  Waiting to start game.");
        }
    };

    /**
     * Starts the engine:
     *  - Schedules the main loop
     */
    var startGame = function(){
        model.gameStatus = EngineStatus.gameRunning;

        //Add the balls to the game
        // SRS Requirement - 3.2.2.8 Ball Introduction
        _.times(model.playerCount(), function(x){
            setTimeout(addBall, x * 500);
        });

        setupPowerupVote();
        //startPoweupVote();

        //TEST Bullet Time
        //setTimeout(function(){
        //    var bodyConfig = generatePowerupBody();
        //    model.addPowerup({
        //        name: BulletTime.Name,
        //        body: bodyConfig,
        //        duration: config.configuration.powerupDuration,
        //        maxBallVelocity: config.configuration.ballMaxVelocity
        //    });
        //}, 5000);

        //setTimeout(function(){
        //    var bodyConfig = generatePowerupBody();
        //    model.addPowerup({
        //        name: Blackhole.Name,
        //        body: bodyConfig,
        //        duration: config.configuration.powerupDuration
        //    });
        //}, 5000);
        //
        //setTimeout(function(){
        //    var bodyConfig = generatePowerupBody();
        //    model.addPowerup({
        //        name: KingMidas.Name,
        //        body: bodyConfig,
        //        duration: config.configuration.powerupDuration
        //    });
        //}, 5000);

        roundEngine.start();

    };

    /**
     * Handles all the logic to end the game
     */
    var endGame = function(){
        model.gameStatus = EngineStatus.gameFinishing;
        comms.broadcastRoundEnded({winners: getWinners()});
        model.reset();
        removeBehaviors();
        resetPowerups();
        resetPlayScores();
        clearPowerupVote();
        setTimeout(initializeGame, config.configuration.roundIntermission);
    };

    /**
     * Handles all the logic to interface with server comms and broadcast
     * the model
     */
    var broadcastModel = function (){
        comms.broadcastSnapshot(model.getSnapshot());
    };

    var startPoweupVote = function (){
        if (model.gameStatus === EngineStatus.gameRunning &&
            model.getPowerupElection() == null) {
            model.setPowerupElection({powerups: PowerupFactory.getAllPowerupNames()});
            setTimeout(endPowerupVote, config.configuration.powerupVoteDuration);
        }
    };

    var endPowerupVote = function (){
        var winner = model.getPowerupElection().getWinner();
        model.clearPowerupElection();
        var bodyConfig = generatePowerupBody();
        model.addPowerup({
            name: winner,
            body: bodyConfig,
            duration: config.configuration.powerupDuration,
            maxBallVelocity: config.configuration.ballMaxVelocity
        });

    };

    // ============================= Game Setup Helpers ===============================
    // ============================================================================
    /**
     * Handles moving spectators who are in the playerQueue into the players list
     * SRS Requirement - 3.2.2.4 Join Game
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
        if (spectator == null) {
            Logger.warn('Spectator must have dropped after queueing.  Not converting to player.');
            return;
        }

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
        var paddleRadius = config.configuration.paddleRadius / players.length;
        for(var i=0; i < players.length; i++){
            var leftBound = model.getArena().getPaddleLeftBound(i);
            var rightBound = model.getArena().getPaddleRightBound(i);
            var paddlePos = model.getArena().getPaddleStartPosition(i);

            players[i].arenaPosition = i;

            var paddleConfig = {
                maxVelocity: config.configuration.paddleMaximumVelocity,
                radius: paddleRadius>= 30 ? paddleRadius : 30,
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
                },
                angular: {
                    vel: 0.01
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

    /**
     * Removes all powerups from the world
     */
    var resetPowerups = function(){
        model.getPowerups().forEach(function(powerup){
           powerup.deactivate(model);
        });

        model.clearPowerups();
    };

    /**
     * Resets all the player scores to 0
     */
    var resetPlayScores = function(){
        model.getPlayers().forEach(function(player){
            player.score = 0;
        });
    };

    var setupPowerupVote = function(){
        powerupVoteInterval = setInterval(startPoweupVote, 10000);
    };

    var clearPowerupVote = function(){
        clearInterval(powerupVoteInterval);
    };

    /**
     * Gets the top 3 players for the round
     * @returns {Array}
     */
    var getWinners = function(){
        var players = model.getPlayers().sort(function(a,b){
            return b.score - a.score;
        });
        var winners = [];
        _.times(3, function(i){
            if (players[i] != null) {
                winners.push({name: players[i].client.name, score: players[i].score});
            }
        });
        return winners;
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
     * @param {object} voteConfig
     */
    this.handleAddVote = function (voteConfig){
        var vote = new Vote(voteConfig);
        model.getPowerupElection().addVote(vote);
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
        clearInterval(backgroundSnapshotInterval);
        clearInterval(powerupVoteInterval);
    };

    // ========================== Engine Construction =============================
    // ============================================================================

    comms.on(CommsEvents.ServerToServer.newPlayerQueued, this.handleAddPlayerToQueue);
    comms.on(CommsEvents.ServerToServer.newVote, this.handleAddVote);

    initializeGame();
};

module.exports = Engine;