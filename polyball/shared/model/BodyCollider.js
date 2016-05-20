/**
 * Created by kdbanman on 2016-03-24.
 */

var Physics = require('physicsjs');
var lodash = require('lodash');
var Events = require('polyball/shared/model/behaviors/Events');

/**
 *
 * Splits and retransmits physics world collisions:detected events on one of two channels:
 *
 * - impulseCollisions:detected for the collisions that do not involve an ignored body
 * - nonimpulseCollisions:detected for the collisions that do involve an ignored body
 *
 * The above events are rebroadcast through the same world that CollisionsPruner was constructed with.
 * The world is also given impulse response, collision detection, and sweep prune behaviours.
 *
 * @param {Object} config
 * @property {Physics.world} config.world - the world whose collision events will be retransmitted.
 * @property {Model} config.model - the model who'se entities will be collided
 * @constructor
 */
var BodyCollider = function (config) {
    var world = config.world;
    var ignoredBodies = {};
    var model = config.model;

    // Model Entities
    // We create reverse lookup hashes with Physics.body keys and model entities as values
    var balls = {};
    var ballsLength;
    var paddles = {};
    var powerups = {};
    var powerupsLength = 0;

    // Goals are unique in that they map goal bodies to players
    var goals = {};

    //
    //
    //          Private Functions
    //
    //
    //////////////////////////////////////////////////////////////////////////

    //================================= Collision Logic =================================
    var handleCollision = function (event) {

        var nonImpulseEvent = {};
        lodash.assign(nonImpulseEvent, event);

        // extract collisions that involve ignored bodies
        nonImpulseEvent.collisions = lodash.remove(event.collisions, function (collision) {
            if (model != null) {
                setupBalls();
                setupPowerups();

                handleEntityBallCollision(collision, paddles, Events.paddleBallCollision);
                handleEntityBallCollision(collision, goals, Events.ballGoalCollision);
                handleEntityBallCollision(collision, powerups, Events.ballPowerupCollision);
                handleEntityBallCollision(collision, ignoredBodies, Events.nonImpulsiveCollision);
            }

            // iterate through ignored bodies, returning one that is in the collision (if any)
            var ignoredBodyFromCollision = lodash.find(ignoredBodies, function (ignoredBody) {
                return ignoredBody === collision.bodyA || ignoredBody === collision.bodyB;
            });

            // if an ignored body was found in the collision, return true so that the collision is removed
            return ignoredBodyFromCollision != null;
        });

        world.emit('impulseCollisions:detected', event);
    };

    var handleEntityBallCollision = function(collision, entities, event){
        if (entities[collision.bodyA.uid] || entities[collision.bodyB.uid]){
            if (balls[collision.bodyA.uid] || balls[collision.bodyB.uid]){
                var ball;
                var entity;
                if (balls[collision.bodyA.uid]){
                    ball = collision.bodyA;
                    entity = collision.bodyB;
                } else {
                    ball = collision.bodyB;
                    entity = collision.bodyA;
                }
                config.model.getWorld().emit( event,
                    {   ball: balls[ball.uid],
                        entity: entities[entity.uid]
                    });
            }
        }
    };

    //================================== Setup Helpers =================================
    var setupBalls = function(){
        if (ballsLength !== model.ballsContainer.getBalls().length) {
            balls = {};
            config.model.ballsContainer.getBalls().forEach(function (ball) {
                balls[ball.body.uid] = ball;
            });
            ballsLength = Object.keys(balls).length;

        }
    };

    var setupPaddles = function(){
        config.model.playersContainer.getPlayers().forEach(function(player){
            paddles[player.paddle.body.uid] = player;
        });
    };

    var setupGoals = function(){
        var arena = model.arenaContainer.getArena();
        config.model.playersContainer.getPlayers().forEach(function (player){
            var goal = arena.getGoal(player.arenaPosition);
            goals[goal.uid] = player;
        });
    };

    var setupPowerups = function(){
        if (powerupsLength !== model.powerupsContainer.getPowerups().length) {
            powerups = {};
            config.model.powerupsContainer.getPowerups().forEach(function (powerup) {
               powerups[powerup.body.uid] = powerup;
            });
            powerupsLength = Object.keys(powerups).length;

        }
    };

    //
    //
    //      Public Functions
    //
    //
    //////////////////////////////////////////////////////////////////////////

    /**
     * Adds a body to the ignore list - body will not be given impulse response.
     * @param body
     */
    this.addIgnoredBody = function (body) {
        if (body != null) {
            ignoredBodies[body.uid] = body;
        }
    };

    /**
     * Removes a body from the ignore list - body will now be given impulse response.
     * @param body
     */
    this.removeIgnoredBody = function (body) {
        if (body != null) {
            ignoredBodies = lodash.omit(ignoredBodies, [body.uid]);
        }
    };

    this.disconnect = function(){
        world.off('collisions:detected', handleCollision);
    };

    //
    //
    //      Initialization
    //
    //
    //////////////////////////////////////////////////////////////////////////
    if (model != null) {
        setupPaddles();
        setupGoals();
    }

    world.add([
        Physics.behavior('body-impulse-response', {
            check: 'impulseCollisions:detected'
        }),
        Physics.behavior('body-collision-detection'),
        Physics.behavior('sweep-prune')
    ]);

    world.on('collisions:detected', handleCollision);

};

module.exports = BodyCollider;