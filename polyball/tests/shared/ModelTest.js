/**
 * Created by kdban on 3/10/2016.
 */
var Util = require('polyball/shared/Util');
var Model = require('polyball/shared/Model');
var Client = require('polyball/shared/model/Client');

describe('Model', function () {
   'use strict';

    describe("ball CRUD", function () {
        var model, ball, ball2;

        describe("#addBall", function () {
            it('should add a queryable ball to the model.', function () {
                model = new Model();
                model.ballCount().should.equal(0);

                ball = model.addBall();

                model.ballCount().should.equal(1);
                model.hasBall(ball.id).should.be.true; // jshint ignore:line
            });

            it('should add a second, distinct queryable ball to the model.', function () {
                ball2 = model.addBall();

                model.ballCount().should.equal(2);

                ball.should.not.equal(ball2);

                model.hasBall(ball.id).should.be.true; // jshint ignore:line
                model.hasBall(ball2.id).should.be.true; // jshint ignore:line
            });
        });

        describe("#updateBall", function () {
            it('should update a ball, and delete them.', function () {

                model.updateBall(ball2.id, {body: {x: 35, y: 3}});

                ball2.body.x.should.equal(35);
                ball2.body.y.should.equal(3);

            });
        });

        describe('#getBalls', function () {
            it('should get all balls when passed nothing or null', function () {
                model.getBalls().length.should.equal(2);
            });

            it('should get only a ball specified by a predicate', function () {
                var balls = model.getBalls(function (ball) { return ball.id === ball2.id; });
                balls.length.should.equal(1);
                balls[0].should.equal(ball2);
            });
        });

        describe("#deleteBall", function () {
            it('should delete a ball and only that ball.', function () {

                model.deleteBall(ball.id);

                model.ballCount().should.equal(1);
                model.hasBall(ball.id).should.be.false; // jshint ignore:line
                model.hasBall(ball2.id).should.be.true; // jshint ignore:line

                ball2.body.x.should.equal(35);
                ball2.body.y.should.equal(3);
            });

            it('should delete a second ball.', function () {
                model.deleteBall(ball2.id);

                model.ballCount().should.equal(0);
                model.hasBall(ball.id).should.be.false; // jshint ignore:line
                model.hasBall(ball2.id).should.be.false; // jshint ignore:line
            });
        });
    });

    describe("spectator CRUD", function () {
        it('should add 2 spectators to the model, then query, update, and delete them.', function () {
            var model = new Model();

            model.spectatorCount().should.equal(0);

            var spectator = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'socket'}));

            model.spectatorCount().should.equal(1);
            model.hasSpectator(spectator.id).should.be.true; // jshint ignore:line

            var spectator2 = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'socket'}));

            model.spectatorCount().should.equal(2);
            model.hasSpectator(spectator.id).should.be.true; // jshint ignore:line
            model.hasSpectator(spectator2.id).should.be.true; // jshint ignore:line

            model.updateSpectator(spectator2.id, {client: {name: 'some_guy'}});

            spectator2.client.name.should.equal('some_guy');
            spectator2.queued.should.be.false; // jshint ignore:line

            model.deleteSpectator(spectator.id);

            model.spectatorCount().should.equal(1);
            model.hasSpectator(spectator.id).should.be.false; // jshint ignore:line
            model.hasSpectator(spectator2.id).should.be.true; // jshint ignore:line

            spectator2.client.name.should.equal('some_guy');
            spectator2.queued.should.be.false; // jshint ignore:line

            model.getSpectators(function (spectator) {return !spectator.queued;}).length.should.equal(1);

            model.deleteSpectator(spectator2.id);

            model.spectatorCount().should.equal(0);
            model.hasSpectator(spectator.id).should.be.false; // jshint ignore:line
            model.hasSpectator(spectator2.id).should.be.false; // jshint ignore:line
        });
    });

    describe("player CRUD", function () {
        it('should add 2 players to the model, then query, update, and delete them.', function () {
            var model = new Model();

            model.playerCount().should.equal(0);

            var player = model.addPlayer(new Client({name: Util.randomUsername(), socket: 'socket'}));

            model.playerCount().should.equal(1);
            model.hasPlayer(player.id).should.be.true; // jshint ignore:line

            var player2 = model.addPlayer(new Client({name: Util.randomUsername(), socket: 'socket'}));

            model.playerCount().should.equal(2);
            model.hasPlayer(player.id).should.be.true; // jshint ignore:line
            model.hasPlayer(player2.id).should.be.true; // jshint ignore:line

            model.updatePlayer(player2.id, {client: {name: 'some_guy'}});

            player2.client.name.should.equal('some_guy');
            player2.score.should.equal(0); // jshint ignore:line

            model.deletePlayer(player.id);

            model.playerCount().should.equal(1);
            model.hasPlayer(player.id).should.be.false; // jshint ignore:line
            model.hasPlayer(player2.id).should.be.true; // jshint ignore:line

            player2.client.name.should.equal('some_guy');
            player2.score.should.equal(0); // jshint ignore:line

            model.getPlayers(function (player) {return player.score === 0;}).length.should.equal(1);

            model.deletePlayer(player2.id);

            model.playerCount().should.equal(0);
            model.hasPlayer(player.id).should.be.false; // jshint ignore:line
            model.hasPlayer(player2.id).should.be.false; // jshint ignore:line
        });
    });
});