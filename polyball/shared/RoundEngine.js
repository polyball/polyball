/**
 * Created by ryan on 29/03/16.
 */

var PubSub = require('polyball/shared/PubSub');
var RoundEvents = require('polyball/shared/RoundEvents');
var Physics = require('physicsjs');
var PaddleBehavior = require('polyball/shared/model/behaviors/PaddleBehavior');
var BallBehavior = require('polyball/shared/model/behaviors/BallBehavior');
var BallOwnershipBehavior = require('polyball/shared/model/behaviors/BallOwnershipBehavior');
var BodyCollider = require('polyball/shared/model/BodyCollider');

/**
 * This class essentially "Runs" the rounds:
 *  - Steps simulation
 *  - Mutates time
 *  - Controls behaviors
 * @param {Object} config
 * @property {Model} config.model
 * @property {Object} config.paddleEventsPublisher
 * @property {String} config.paddleMoveEvent
 * @property {number} config.tickRate
 * @property {number} config.maxBallVelocity
 * @property
 * @constructor
 */
var RoundEngine = function(config){
    var model = config.model;
    var gameStartTime;
    var gameLoop;
    var behaviors = [];

    /**
     * For event subscribers.
     * @type {PubSub}
     */
    var pubsub = new PubSub({
            events: RoundEvents
        });

    //
    //
    //          PUBLIC
    //
    /////////////////////////////////////////////////////////////////
    this.start = function(){
        initializeGame();
    };

    /**
     * Register a callback with an event.
     * @param {String} eventName
     * @param {Function} callback
     */
    this.on = function (eventName, callback) {
        pubsub.on(eventName, callback);
    };

    this.kill = function(){
        clearInterval(gameLoop);
    };


    //
    //
    //          PRIVATE
    //
    /////////////////////////////////////////////////////////////////
    var initializeGame = function(){
        model.collisionsPruner = new BodyCollider({world: model.getWorld(), model: model});

        addPhysicsBehavior(PaddleBehavior, {paddleEventsPublisher: config.paddleEventsPublisher,
            paddleMoveEvent: config.paddleMoveEvent,
            model: model}).applyTo(model.getPlayers());
        addCustomBehavior(BallBehavior, {ballMaxVelocity: config.maxBallVelocity, model: model});
        addCustomBehavior(BallOwnershipBehavior, {model: model});
        pubsub.fireEvent(RoundEvents.initializationFinished);

        startGame();
    };

    var startGame = function(){
        gameStartTime = Date.now();
        model.setCurrentRoundTime(0);
        gameLoop = setInterval(update, config.tickRate);
        pubsub.fireEvent(RoundEvents.gameStarted);
    };

    var update = function(){
        var time = Date.now();
        model.getWorld().step();
        model.setCurrentRoundTime(time - gameStartTime);

        pubsub.fireEvent(RoundEvents.simulationStepped);

        if(model.getCurrentRoundTime() >= model.getRoundLength()){
            endGame();
        }
    };

    var endGame = function(){
        clearInterval(gameLoop);
        removeBehaviors();
        model.collisionsPruner.disconnect();
        pubsub.fireEvent(RoundEvents.gameEnded);
    };


    //
    //
    //         UTILITIES
    //
    /////////////////////////////////////////////////////////////////
    /**
     * Helper to add behvaiors to the world
     * @param {Object} constructor
     * @param {Object} args
     * @returns {Physics.behavior}
     */
    var addPhysicsBehavior = function(constructor, args){
        new constructor(args);
        var behavior = Physics.behavior(constructor.Name);
        model.getWorld().add(behavior);
        return behavior;

    };

    var addCustomBehavior = function(constructor, args){
        var behavior = new constructor(args);
        behavior.connect();
        behaviors.push(behavior);
    };

    var removeBehaviors = function(){
        behaviors.forEach(function(behavior){
           behavior.disconnect();
        });
        behaviors = [];
    };
};

module.exports = RoundEngine;