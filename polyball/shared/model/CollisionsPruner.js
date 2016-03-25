/**
 * Created by kdbanman on 2016-03-24.
 */

var Physics = require('physicsjs');
var lodash = require('lodash');

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
 * @constructor
 */
var CollisionsPruner = function (config) {
    var world = config.world;
    var ignoredBodies = [];


    world.add([
        Physics.behavior('body-impulse-response', {
            check: 'impulseCollisions:detected'
        }),
        Physics.behavior('body-collision-detection'),
        Physics.behavior('sweep-prune')
    ]);

    world.on('collisions:detected', function (event) {

        var nonImpulseEvent = {};
        lodash.assign(nonImpulseEvent, event);

        // extract collisions that involve ignored bodies
        nonImpulseEvent.collisions = lodash.remove(event.collisions, function (collision) {

            // iterate through ignored bodies, returning one that is in the collision (if any)
            var ignoredBodyFromCollision = lodash.find(ignoredBodies, function (ignoredBody) {
                return ignoredBody === collision.bodyA || ignoredBody === collision.bodyB;
            });

            // if an ignored body was found in the collision, return true so that the collision is removed
            return ignoredBodyFromCollision != null;
        });

        world.emit('nonimpulseCollisions:detected', nonImpulseEvent);
        world.emit('impulseCollisions:detected', event);
    });

    /**
     * Adds a body to the ignore list - body will not be given impulse response.
     * @param body
     */
    this.addIgnoredBody = function (body) {
        if (body != null) {
            ignoredBodies.push(body);
        }
    };

    /**
     * Removes a body from the ignore list - body will now be given impulse response.
     * @param body
     */
    this.removeIgnoredBody = function (body) {
        if (body != null) {
            lodash.remove(ignoredBodies, function (ignoredBody) { return body === ignoredBody;});
        }
    };

};

module.exports = CollisionsPruner;