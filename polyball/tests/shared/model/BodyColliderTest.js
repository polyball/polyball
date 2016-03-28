/**
 * Created by kdbanman on 3/24/16.
 */

var BodyCollider = require('polyball/shared/model/BodyCollider');
var Physics = require('physicsjs');


describe('BodyCollider', function () {
    "use strict";

    var world, collisionsPruner, event, ball1, ball2, ball3;

    beforeEach(function () {
        world = Physics();
        collisionsPruner = new BodyCollider({world: world});

        ball1 = Physics.body('circle');
        ball2 = Physics.body('circle');
        ball3 = Physics.body('circle');

        event = {
            collisions: [
                {
                    bodyA: ball1,
                    bodyB: ball2
                },
                {
                    bodyA: ball3,
                    bodyB: ball2
                }
            ]
        };
    });

    it('should pass through collisions on impulseCollisions:detected channel when in default state', function (done) {
        world.on('impulseCollisions:detected', function (evt) {
            evt.collisions.length.should.equal(2);
            done();
        });

        world.emit('collisions:detected', event);
    });

    describe('#addIgnoredBody', function () {


        it('should pass through collisions unignored bodies on impulseCollisions:detected channel', function (done) {
            world.on('impulseCollisions:detected', function (evt) {
                evt.collisions.length.should.equal(1);
                evt.collisions[0].bodyA.should.equal(ball3);

                done();
            });

            collisionsPruner.addIgnoredBody(ball1);

            world.emit('collisions:detected', event);
        });

        it('should retransmit collisions of ignored body on nonimpulseCollisions:detected channel', function (done) {
            world.on('nonimpulseCollisions:detected', function (evt) {
                evt.collisions.length.should.equal(1);
                evt.collisions[0].bodyA.should.equal(ball1);
                done();
            });

            collisionsPruner.addIgnoredBody(ball1);

            world.emit('collisions:detected', event);
        });

        it('should filter collisions of ignored body regardless of which body is ignored', function (done) {
            world.on('impulseCollisions:detected', function (evt) {
                evt.collisions.length.should.equal(0);
                done();
            });

            collisionsPruner.addIgnoredBody(ball2);

            world.emit('collisions:detected', event);
        });
    });

    describe('#removeIgnoredBody', function () {

        it('should pass previously ignored collisions on impulseCollisions:detected channel', function (done) {
            world.on('impulseCollisions:detected', function (evt) {
                evt.collisions.length.should.equal(1);
                done();
            });

            collisionsPruner.addIgnoredBody(ball2);
            collisionsPruner.addIgnoredBody(ball1);

            collisionsPruner.removeIgnoredBody(ball2);

            world.emit('collisions:detected', event);
        });

    });
});