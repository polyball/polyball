/**
 * Created by kdban on 3/10/2016.
 */
var should = require('should');
var Util = require('polyball/shared/Util');
var Model = require('polyball/shared/Model');
var Client = require('polyball/shared/model/Client');
var _ = require('lodash');

describe('Model', function () {
   'use strict';

    describe("#addOrResetArena", function () {
        var model, arena, arena2;
        it('should add an arena to the model.', function () {
            model = new Model();
            should.not.exist(model.getArena());

            arena = model.addOrResetArena({numberPlayers: 4, arenaRadius: 1000});

            model.getArena().should.equal(arena);
        });

        it('should reset the arena.', function () {
            arena2 = model.addOrResetArena({numberPlayers: 9, arenaRadius: 400});

            model.getArena().should.not.equal(arena);
            model.getArena().should.equal(arena2);
        });
    });

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
        var model, spectator, spectator2;

        describe("#addSpectator", function () {
            it('should add a queryable spectator to the model.', function () {
                model = new Model();
                model.spectatorCount().should.equal(0);

                spectator = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'dummy'}));

                model.spectatorCount().should.equal(1);
                model.hasSpectator(spectator.id).should.be.true; // jshint ignore:line
            });

            it('should add a second, distinct queryable spectator to the model.', function () {
                spectator2 = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'dummy'}));

                model.spectatorCount().should.equal(2);

                spectator.should.not.equal(spectator2);

                model.hasSpectator(spectator.id).should.be.true; // jshint ignore:line
                model.hasSpectator(spectator2.id).should.be.true; // jshint ignore:line
            });
        });

        describe("#updateSpectator", function () {
            it('should update a spectator, and delete them.', function () {

                model.updateSpectator(spectator2.id, {client: {name: 'some_guy'}});

                spectator2.client.name.should.equal('some_guy');
                spectator2.queued.should.be.false; // jshint ignore:line

            });
        });

        describe('#getSpectators', function () {
            it('should get all spectators when passed nothing or null', function () {
                model.getSpectators().length.should.equal(2);
            });

            it('should get only a spectator specified by a predicate', function () {
                var spectators = model.getSpectators(function (spectator) {
                    return spectator.id === spectator2.id;
                });
                spectators.length.should.equal(1);
                spectators[0].should.equal(spectator2);
            });
        });

        describe("#deleteSpectator", function () {
            it('should delete a spectator and only that spectator.', function () {

                model.deleteSpectator(spectator.id);

                model.spectatorCount().should.equal(1);
                model.hasSpectator(spectator.id).should.be.false; // jshint ignore:line
                model.hasSpectator(spectator2.id).should.be.true; // jshint ignore:line

                spectator2.client.name.should.equal('some_guy');
                spectator2.queued.should.be.false; // jshint ignore:line
            });

            it('should delete a second spectator.', function () {
                model.deleteSpectator(spectator2.id);

                model.spectatorCount().should.equal(0);
                model.hasSpectator(spectator.id).should.be.false; // jshint ignore:line
                model.hasSpectator(spectator2.id).should.be.false; // jshint ignore:line
            });
        });
    });

    describe("player CRUD", function () {
        var model, player, player2;

        describe("#addPlayer", function () {
            it('should add a queryable player to the model.', function () {
                model = new Model();
                model.playerCount().should.equal(0);

                player = model.addPlayer(new Client({name: Util.randomUsername(), socket: 'dummy'}));

                model.playerCount().should.equal(1);
                model.hasPlayer(player.id).should.be.true; // jshint ignore:line
            });

            it('should add a second, distinct queryable player to the model.', function () {
                player2 = model.addPlayer(new Client({name: Util.randomUsername(), socket: 'dummy'}));

                model.playerCount().should.equal(2);

                player.should.not.equal(player2);

                model.hasPlayer(player.id).should.be.true; // jshint ignore:line
                model.hasPlayer(player2.id).should.be.true; // jshint ignore:line
            });
        });

        describe("#updatePlayer", function () {
            it('should update a player, and delete them.', function () {

                model.updatePlayer(player2.id, {client: {name: 'some_guy'}});

                player2.client.name.should.equal('some_guy');
                player2.score.should.equal(0); // jshint ignore:line

            });
        });

        describe('#getPlayers', function () {
            it('should get all players when passed nothing or null', function () {
                model.getPlayers().length.should.equal(2);
            });

            it('should get only a player specified by a predicate', function () {
                var players = model.getPlayers(function (player) {
                    return player.id === player2.id;
                });
                players.length.should.equal(1);
                players[0].should.equal(player2);
            });
        });

        describe("#deletePlayer", function () {
            it('should delete a player and only that player.', function () {

                model.deletePlayer(player.id);

                model.playerCount().should.equal(1);
                model.hasPlayer(player.id).should.be.false; // jshint ignore:line
                model.hasPlayer(player2.id).should.be.true; // jshint ignore:line

                player2.client.name.should.equal('some_guy');
                player2.score.should.equal(0); // jshint ignore:line
            });

            it('should delete a second player.', function () {
                model.deletePlayer(player2.id);

                model.playerCount().should.equal(0);
                model.hasPlayer(player.id).should.be.false; // jshint ignore:line
                model.hasPlayer(player2.id).should.be.false; // jshint ignore:line
            });
        });
    });

    describe("Player Queue CRUD", function () {
        describe("#addToPlayerQueue", function () {
            var model;
            it('should add a single player to the queue.', function () {
                model = new Model();
                var spectator1 = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'dummy'}));
                model.addToPlayerQueue(spectator1.id);

                var queuedPlayers = model.getAllQueuedPlayers();

                model.numberOfQueuedPlayers().should.equal(1);
                queuedPlayers.length.should.equal(1);
                queuedPlayers.should.containEql(spectator1);
            });
            it('should not add the same player twice.', function () {
                model = new Model();
                var spectator1 = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'dummy'}));

                model.addToPlayerQueue(spectator1.id);
                model.addToPlayerQueue(spectator1.id);

                var queuedPlayers = model.getAllQueuedPlayers();

                model.numberOfQueuedPlayers().should.equal(1);
                queuedPlayers.length.should.equal(1);
                queuedPlayers.should.containEql(spectator1);
            });
            it('should have playerQueue.length = 2 when 2 spectators added.', function () {
                model = new Model();
                var spectator1 = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'dummy'}));
                var spectator2 = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'dummy'}));

                model.addToPlayerQueue(spectator1.id);
                model.addToPlayerQueue(spectator2.id);

                var queuedPlayers = model.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(2);
                queuedPlayers.length.should.equal(2);
                queuedPlayers.should.containEql(spectator2);
                queuedPlayers.should.containEql(spectator1);
            });
            it('should increase the playerQueue by 1 for each added spectator.', function () {
                model = new Model();
                var x = 5;

                _.times(x, function(){
                    var spectator1 = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'dummy'}));
                    model.addToPlayerQueue(spectator1.id);

                });

                var queuedPlayers = model.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(x);
                queuedPlayers.length.should.equal(x);
            });
        });
        describe("#removeFromQueue", function () {
            var model;
            it('should remove a single player from the queue.', function () {
                model = new Model();
                var spectator1 = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'dummy'}));
                var spectator2 = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'dummy'}));

                model.addToPlayerQueue(spectator1.id);
                model.addToPlayerQueue(spectator2.id);
                model.removeFromPlayerQueue(spectator1.id);

                var queuedPlayers = model.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(1);
                queuedPlayers.length.should.equal(1);
                queuedPlayers.should.containEql(spectator2);

                model.removeFromPlayerQueue(spectator2.id);

                queuedPlayers = model.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(0);
                queuedPlayers.length.should.equal(0);

            });
            it('should not throw an error when a player is removed that does not exist', function () {
                model = new Model();
                var spectator1 = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'dummy'}));

                model.addToPlayerQueue(spectator1.id);
                model.removeFromPlayerQueue(spectator1.id);
                model.removeFromPlayerQueue(spectator1.id);

            });
        });
        describe("#popPlayerQueue", function () {
            var model;
            it('should remove the top spectator from the queue.', function () {
                model = new Model();
                var spectator1 = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'dummy'}));
                var spectator2 = model.addSpectator(new Client({name: Util.randomUsername(), socket: 'dummy'}));

                model.addToPlayerQueue(spectator1.id);
                model.addToPlayerQueue(spectator2.id);
                var out = model.popPlayerQueue();

                var queuedPlayers = model.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(1);
                queuedPlayers.length.should.equal(1);
                queuedPlayers.should.containEql(spectator2);
                out.should.equal(spectator1);

                out = model.popPlayerQueue();

                queuedPlayers = model.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(0);
                queuedPlayers.length.should.equal(0);
                out.should.equal(spectator2);

            });
        });
    });
});