/**
 * Created by kdban on 3/10/2016.
 */
var should = require('should');
var Util = require('polyball/shared/utilities/Util');
var Model = require('polyball/shared/Model');
var _ = require('lodash');
var Logger = require('polyball/shared/Logger');
var Vote = require('polyball/shared/model/Vote');
var PowerupElection = require('polyball/shared/powerups/PowerupElection.js');
var Blackhole = require('polyball/shared/powerups/Blackhole');

describe('Model', function () {
   'use strict';

    var BALL_CONF = {
        body: {
            radius: 10,
            state: {
                pos: {x: 1, y: 2},
                vel: {x: 0.1, y: 0.1}
            }
        }
    };

    describe("#addOrResetArena", function () {
        var model, arena, arena2;
        it('should add an arena to the model.', function () {
            model = new Model();
            should.not.exist(model.arenaContainer.getArena());

            arena = model.arenaContainer.addOrResetArena({
                numberPlayers: 4,
                arenaRadius: 1000,
                bumperRadius: 25,
                marginX: 0,
                marginY: 0
            });

            model.arenaContainer.getArena().should.equal(arena);
        });

        it('should reset the arena.', function () {
            arena2 = model.arenaContainer.addOrResetArena({
                numberPlayers: 9,
                arenaRadius: 400,
                bumperRadius: 25,
                marginX: 0,
                marginY: 0
            });

            model.arenaContainer.getArena().should.not.equal(arena);
            model.arenaContainer.getArena().should.equal(arena2);
        });
    });

    describe("ball CRUD", function () {
        var model, ball, ball2, arena;

        describe("#addBall", function () {
            it('should add a queryable ball to the model.', function () {
                model = new Model();
                model.ballCount().should.equal(0);

                arena = model.arenaContainer.addOrResetArena({
                    numberPlayers: 9,
                    arenaRadius: 400,
                    bumperRadius: 25,
                    marginX: 0,
                    marginY: 0
                });

                ball = model.addBall(BALL_CONF);

                model.ballCount().should.equal(1);
                model.hasBall(ball.id).should.be.true; // jshint ignore:line
            });

            it('should add a second, distinct queryable ball to the model.', function () {
                ball2 = model.addBall(BALL_CONF);

                model.ballCount().should.equal(2);

                ball.should.not.equal(ball2);

                model.hasBall(ball.id).should.be.true; // jshint ignore:line
                model.hasBall(ball2.id).should.be.true; // jshint ignore:line
            });
        });

        describe('#getBall', function () {
            it('should get a ball by its id', function () {
                var tmpBall = model.getBall(ball.id);

                tmpBall.should.equal(ball);
            });

            it('should get a ball by any predicate', function () {
                ball2.body.state.pos.x = 987;
                var tmpBall = model.getBall(function (ball) {
                    return ball.body.state.pos.x === ball2.body.state.pos.x;
                });

                tmpBall.should.equal(ball2);
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
            });

            it('should delete a second ball.', function () {
                model.deleteBall(ball2.id);

                model.ballCount().should.equal(0);
                model.hasBall(ball.id).should.be.false; // jshint ignore:line
                model.hasBall(ball2.id).should.be.false; // jshint ignore:line
            });
        });

        describe("#clearBalls", function () {
            it('should delete all model balls.', function () {
                model.addBall(BALL_CONF);
                model.addBall(BALL_CONF);
                model.addBall(BALL_CONF);

                model.ballCount().should.equal(3);

                model.clearBalls();

                model.ballCount().should.equal(0);
            });
        });
    });

    describe("spectator CRUD", function () {
        var model, spectator, spectator2;

        describe("#addSpectator", function () {
            it('should add a queryable spectator to the model.', function () {
                model = new Model();
                model.spectatorCount().should.equal(0);

                spectator = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});

                model.spectatorCount().should.equal(1);
                model.hasSpectator(spectator.id).should.be.true; // jshint ignore:line
            });

            it('should add a second, distinct queryable spectator to the model.', function () {
                spectator2 = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});

                model.spectatorCount().should.equal(2);

                spectator.should.not.equal(spectator2);

                model.hasSpectator(spectator.id).should.be.true; // jshint ignore:line
                model.hasSpectator(spectator2.id).should.be.true; // jshint ignore:line
            });
        });

        describe('#getSpectator', function () {
            it('should get a spectator by its id', function () {
                var tmpSpectator = model.getSpectator(spectator.id);

                tmpSpectator.should.equal(spectator);
            });

            it('should get a spectator by any predicate', function () {
                var tmpSpectator = model.getSpectator(function (spectator) {
                    return spectator.client.name === spectator2.client.name;
                });

                tmpSpectator.should.equal(spectator2);
            });
        });

        describe('#getSpectators', function () {
            it('should get all spectators when passed nothing or null', function () {
                model.spectatorsContainer.getSpectators().length.should.equal(2);
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

        before(function (){
            Logger.setLevel('ERROR');
        });

        describe("#addPlayer", function () {
            it('should add a queryable player to the model.', function () {
                model = new Model();
                model.playersContainer.playerCount().should.equal(0);

                player = model.addPlayer({
                    clientConfig: {
                        name: Util.randomUsername(),
                        socket: 'dummy'}
                });

                model.playersContainer.playerCount().should.equal(1);
                model.playersContainer.hasPlayer(player.id).should.be.true; // jshint ignore:line
            });

            it('should add a second, distinct queryable player to the model.', function () {
                player2 = model.addPlayer({
                    clientConfig: {
                        name: Util.randomUsername(),
                        socket: 'dummy'}
                });

                model.playersContainer.playerCount().should.equal(2);

                player.should.not.equal(player2);

                model.playersContainer.hasPlayer(player.id).should.be.true; // jshint ignore:line
                model.playersContainer.hasPlayer(player2.id).should.be.true; // jshint ignore:line
            });
        });

        describe('#getPlayer', function () {
            it('should get a player by its id', function () {
                var tmpPlayer = model.playersContainer.getPlayer(player.id);

                tmpPlayer.should.equal(player);
            });

            it('should get a player by any predicate', function () {
                var tmpPlayer = model.playersContainer.getPlayer(function (player) {
                    return player.client.name === player2.client.name;
                });

                tmpPlayer.should.equal(player2);
            });
        });

        describe('#getPlayers', function () {
            it('should get all players when passed nothing or null', function () {
                model.playersContainer.getPlayers().length.should.equal(2);
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

                model.playersContainer.playerCount().should.equal(1);
                model.playersContainer.hasPlayer(player.id).should.be.false; // jshint ignore:line
                model.playersContainer.hasPlayer(player2.id).should.be.true; // jshint ignore:line

                player2.score.should.equal(0); // jshint ignore:line
            });

            it('should delete a second player.', function () {
                model.deletePlayer(player2.id);

                model.playersContainer.playerCount().should.equal(0);
                model.playersContainer.hasPlayer(player.id).should.be.false; // jshint ignore:line
                model.playersContainer.hasPlayer(player2.id).should.be.false; // jshint ignore:line
            });
        });

        describe("#addPaddleToPlayer", function () {

            it('should add a paddle to a player', function () {
                var player = model.addPlayer({
                    clientConfig: {
                        name: Util.randomUsername(),
                        socket: 'dummy'}
                });

                should.not.exists(player.paddle);

                model.addPaddleToPlayer({
                    playerID: player.id,
                    paddleConfig: {
                        leftBound: {x: 1, y: 1},
                        rightBound: {x: 2, y: 2},
                        maxVelocity: 22,
                        body: {
                            radius: 3,
                            state: {
                                pos: {x: 1, y: 1}
                            },
                            styles: {}
                        }
                    }
                });

                should.exists(player.paddle);
                player.paddle.body.state.pos.x.should.be.type('number');
            });

        });

        describe("#getPaddle", function () {
            it('should get a paddle for a player', function () {
                var ID = 3544;

                should.not.exists(model.getPaddle(ID));

                model.addPlayer({
                    id: ID,
                    clientConfig: {
                        name: Util.randomUsername(),
                        socket: 'dummy'}
                });

                should.not.exists(model.getPaddle(ID));

                model.addPaddleToPlayer({
                    playerID: ID,
                    paddleConfig: {
                        leftBound: {x: 1, y: 1},
                        rightBound: {x: 2, y: 2},
                        maxVelocity: 22,
                        body: {
                            radius: 3,
                            state: {
                                pos: {x: 1, y: 1}
                            },
                            styles: {}
                        }
                    }
                });

                should.exists(model.getPaddle(ID));
                model.getPaddle(ID).body.state.pos.x.should.be.type('number');
            });
        });

        after(function(){
            Logger.setLevel('INFO');
        });

    });

    describe("Player Queue CRUD", function () {
        describe("#addToPlayerQueue", function () {
            var model;
            it('should add a single player to the queue.', function () {
                model = new Model();
                var spectator1 = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});
                model.addToPlayerQueue(spectator1.id);

                var queuedPlayers = model.spectatorsContainer.getAllQueuedPlayers();

                model.numberOfQueuedPlayers().should.equal(1);
                queuedPlayers.length.should.equal(1);
                queuedPlayers.should.containEql(spectator1);
            });
            it('should not add the same player twice.', function () {
                model = new Model();
                var spectator1 = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});

                model.addToPlayerQueue(spectator1.id);
                model.addToPlayerQueue(spectator1.id);

                var queuedPlayers = model.spectatorsContainer.getAllQueuedPlayers();

                model.numberOfQueuedPlayers().should.equal(1);
                queuedPlayers.length.should.equal(1);
                queuedPlayers.should.containEql(spectator1);
            });
            it('should have playerQueue.length = 2 when 2 spectators added.', function () {
                model = new Model();
                var spectator1 = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});
                var spectator2 = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});

                model.addToPlayerQueue(spectator1.id);
                model.addToPlayerQueue(spectator2.id);

                var queuedPlayers = model.spectatorsContainer.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(2);
                queuedPlayers.length.should.equal(2);
                queuedPlayers.should.containEql(spectator2);
                queuedPlayers.should.containEql(spectator1);
            });
            it('should increase the playerQueue by 1 for each added spectator.', function () {
                model = new Model();
                var x = 5;

                _.times(x, function(){
                    var spectator1 = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});
                    model.addToPlayerQueue(spectator1.id);

                });

                var queuedPlayers = model.spectatorsContainer.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(x);
                queuedPlayers.length.should.equal(x);
            });
            it('should not allow clients that are players to add themselves to the queue', function () {
                Logger.setLevel('OFF');

                model = new Model();
                var x = 5;

                _.times(x, function(){
                    var spectator1 = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});
                    model.addToPlayerQueue(spectator1.id);

                });

                var player = model.addPlayer({
                    clientConfig: {
                        name: Util.randomUsername(),
                        socket: 'dummy'}
                });

                model.addToPlayerQueue(player.id);

                var queuedPlayers = model.spectatorsContainer.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(x);
                queuedPlayers.length.should.equal(x);
                queuedPlayers.should.not.containEql(player.id);

                Logger.setLevel('INFO');
            });
        });
        describe("#removeFromQueue", function () {
            var model;
            it('should remove a single player from the queue.', function () {
                model = new Model();
                var spectator1 = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});
                var spectator2 = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});

                model.addToPlayerQueue(spectator1.id);
                model.addToPlayerQueue(spectator2.id);
                model.removeFromPlayerQueue(spectator1.id);

                var queuedPlayers = model.spectatorsContainer.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(1);
                queuedPlayers.length.should.equal(1);
                queuedPlayers.should.containEql(spectator2);

                model.removeFromPlayerQueue(spectator2.id);

                queuedPlayers = model.spectatorsContainer.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(0);
                queuedPlayers.length.should.equal(0);

            });
            it('should not throw an error when a player is removed that does not exist', function () {
                model = new Model();
                var spectator1 = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});

                model.addToPlayerQueue(spectator1.id);
                model.removeFromPlayerQueue(spectator1.id);
                model.removeFromPlayerQueue(spectator1.id);

            });
        });
        describe("#popPlayerQueue", function () {
            var model;
            it('should remove the top spectator from the queue.', function () {
                model = new Model();
                var spectator1 = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});
                var spectator2 = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});

                model.addToPlayerQueue(spectator1.id);
                model.addToPlayerQueue(spectator2.id);
                var out = model.popPlayerQueue();

                var queuedPlayers = model.spectatorsContainer.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(1);
                queuedPlayers.length.should.equal(1);
                queuedPlayers.should.containEql(spectator2);
                out.should.equal(spectator1);

                out = model.popPlayerQueue();

                queuedPlayers = model.spectatorsContainer.getAllQueuedPlayers();
                model.numberOfQueuedPlayers().should.equal(0);
                queuedPlayers.length.should.equal(0);
                out.should.equal(spectator2);

            });
        });
        describe("#setPowerupElection", function () {

            it('should add a powerup election.', function() {
                var model = new Model();

                var pu = [1,2,3];
                var pe = new PowerupElection({powerups: pu});
                var vote = new Vote({spectatorID: 1, powerup:1});
                pe.addVote(vote);
                pe.votes.length.should.equal(1);

                model.setPowerupElection(pe);

                var pe2 = model.powerupElectionContainer.getPowerupElection();

                pe2.votes.length.should.equal(1);
                pe2.votes.should.containEql(vote);
                pe2.powerups.should.equal(pu);
            });
        });
    });

    describe('#toSnapshot', function () {
        it('should not contain client sockets', function () {
            var model = new Model();

            var spectatorConfig = {
                id: 56,
                clientConfig: {
                    name: 'bob',
                    socket: 'dummy_socket'
                }
            };

            model.addSpectator(spectatorConfig);

            var snap = model.getSnapshot();

            var spectator = snap.spectators[0];

            spectator.id.should.equal(56);
            spectator.clientConfig.name.should.equal('bob');
            should.not.exist(spectator.clientConfig.socket);
        });
    });

    describe('Powerup CRUD', function(){
        var addPowerup = function(){
            var model = new Model();

            var arena = model.arenaContainer.addOrResetArena({
                numberPlayers: 9,
                arenaRadius: 400,
                bumperRadius: 25,
                marginX: 0,
                marginY: 0
            });

            var powerup = model.addPowerup({
                name: Blackhole.Name,
                body: getPowerupBody()
            });

          return {
            model: model,
            arena: arena,
            powerup: powerup
          };
        };

        var getPowerupBody = function(){
            return {
                state:{
                    pos: {
                        x: 100,
                        y: 100
                    },
                    vel: {
                        x: 0,
                        y: 0
                    },
                    angular: {
                        vel: 1
                    }
                },
                radius: 50
            };
        };
       describe('#addPowerup', function(){
           it('should add a queryable powerup', function(){
               var init = addPowerup();
               init.model.powerupCount().should.equal(1);
           });
           it('should add a distinct powerup', function(){
               var init = addPowerup();

               var bh2 = init.model.addPowerup({
                   name: Blackhole.Name,
                   body: getPowerupBody()
               });

               init.model.powerupCount().should.equal(2);
               var ids = init.model.powerupsContainer.getPowerups().map(function(val, index, array){
                   return array[index].id;
               });

               ids.should.containEql(init.powerup.id);
               ids.should.containEql(bh2.id);
               init.powerup.id.should.not.equal(bh2.id);
           });
       });
       describe('#getPowerup', function(){
           it('should get a powerup by its id', function(){
                var init = addPowerup();
                init.model.getPowerup(init.powerup.id).should.equal(init.powerup);
           });
       });
        describe('#getPowerups', function(){
           it('should get all balls when passed nothing',function(){
                var init = addPowerup();
                init.model.powerupsContainer.getPowerups().length.should.equal(1);

                init.model.addPowerup({
                   name: Blackhole.Name,
                   body: getPowerupBody()
                });

               init.model.powerupsContainer.getPowerups().length.should.equal(2);
           });
        });
        describe('#deletePowerup', function(){
            it('should delete a powerup from the list and remove from world', function(){
                var init = addPowerup();
                init.model.getWorld().getBodies().should.containEql(init.powerup.body);
                init.model.powerupsContainer.getPowerups().should.containEql(init.powerup);

                init.model.deletePowerup(init.powerup.id);
                init.model.getWorld().getBodies().should.not.containEql(init.powerup.body);
                init.model.powerupsContainer.getPowerups().length.should.equal(0);
            });
        });
        describe('#deletePowerup', function(){
            it('should delete a powerup from the list and remove from world', function(){
                var init = addPowerup();
                init.model.getWorld().getBodies().should.containEql(init.powerup.body);
                init.model.powerupsContainer.getPowerups().should.containEql(init.powerup);

                init.model.deletePowerup(init.powerup.id);
                init.model.getWorld().getBodies().should.not.containEql(init.powerup.body);
                init.model.powerupsContainer.getPowerups().length.should.equal(0);
            });
        });
        describe('#clearPowerups', function(){
            it('should delete all powerups from the list and remove from world', function(){
                var init = addPowerup();
                var powerup = init.model.addPowerup({
                    name: Blackhole.Name,
                    body: getPowerupBody()
                });

                init.model.powerupsContainer.getPowerups().length.should.equal(2);

                init.model.clearPowerups();
                init.model.getWorld().getBodies().should.not.containEql(init.powerup.body);
                init.model.getWorld().getBodies().should.not.containEql(powerup.body);
                init.model.powerupsContainer.getPowerups().length.should.equal(0);
            });
        });
    });
});