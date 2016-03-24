/**
 * Created by kdbanman on 2016-03-24.
 */

var Physics = require('physicsjs');
var lodash = require('lodash');

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

            // iterate throuh ignored bodies, returning one that is in the collision (if any)
            var ignoredBodyFromCollision = lodash.find(ignoredBodies, function (ignoredBody) {
                return ignoredBody === collision.bodyA || ignoredBody === collision.bodyB;
            });

            // if an ignored body was found in the collision, return true so that the collision is removed
            return ignoredBodyFromCollision != null;
        });

        world.emit('nonimpulseCollisions:detected', nonImpulseEvent);
        world.emit('impulseCollisions:detected', event);
    });

    this.addIgnoredBody = function (body) {
        if (body != null) {
            ignoredBodies.push(body);
        }
    };

    this.removeIgnoredBody = function (body) {
        if (body != null) {
            lodash.remove(ignoredBodies, function (ignoredBody) { return body === ignoredBody;});
        }
    };

};

module.exports = CollisionsPruner;