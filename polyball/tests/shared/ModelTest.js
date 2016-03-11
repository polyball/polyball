/**
 * Created by kdban on 3/10/2016.
 */
var Model = require('polyball/shared/model');

describe('Model', function () {
   'use strict';

    describe("ball CRUD", function () {
        it('should add 2 balls to the model, then query, update, and delete them.', function () {
            var model = new Model();

            model.ballCount().should.equal(0);

            var ball = model.addBall();

            model.ballCount().should.equal(1);
            model.hasBall(ball.id).should.be.true; // jshint ignore:line

            var ball2 = model.addBall();

            model.ballCount().should.equal(2);
            model.hasBall(ball.id).should.be.true; // jshint ignore:line
            model.hasBall(ball2.id).should.be.true; // jshint ignore:line

            model.updateBall(ball2.id, {body: {x: 35, y: 3}});

            ball2.body.x.should.equal(35);
            ball2.body.y.should.equal(3);

            model.deleteBall(ball.id);

            model.ballCount().should.equal(1);
            model.hasBall(ball.id).should.be.false; // jshint ignore:line
            model.hasBall(ball2.id).should.be.true; // jshint ignore:line

            ball2.body.x.should.equal(35);
            ball2.body.y.should.equal(3);

            model.deleteBall(ball2.id);

            model.ballCount().should.equal(0);
            model.hasBall(ball.id).should.be.false; // jshint ignore:line
            model.hasBall(ball2.id).should.be.false; // jshint ignore:line
        });
    });
});