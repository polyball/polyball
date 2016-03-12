/**
 * Created by kdban on 3/10/2016.
 */
var Util = require('polyball/shared/Util');
var Model = require('polyball/shared/Model');
var Client = require('polyball/shared/model/Client');

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

            model.getBalls(function (ball) {return (typeof ball.id) === 'number';}).length.should.equal(1);

            model.deleteBall(ball2.id);

            model.ballCount().should.equal(0);
            model.hasBall(ball.id).should.be.false; // jshint ignore:line
            model.hasBall(ball2.id).should.be.false; // jshint ignore:line
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