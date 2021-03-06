
var should = require('should'); // jshint ignore:line
var Arena = require('polyball/shared/model/Arena.js');

describe('Arena', function() {
    "use strict";

    var fpDelta = 0.001;

    describe('#Arena(config)', function() {
        it('should create bumpers in the correct spots with 3 players', function() {
            var arena = new Arena({
                numberPlayers: 3,
                arenaRadius: 500,
                bumperRadius: 25,
                marginX: 0,
                marginY: 0
            });

            // There should be 3 bumpers
            var b1 = arena.getBumper(0);
            var b2 = arena.getBumper(1);
            var b3 = arena.getBumper(2);

            b1.state.pos.x.should.approximately(66.9875, fpDelta);
            b1.state.pos.y.should.approximately(750, fpDelta);

            b2.state.pos.x.should.approximately(933.0125, fpDelta);
            b2.state.pos.y.should.approximately(750, fpDelta);

            b3.state.pos.x.should.approximately(500, fpDelta);
            b3.state.pos.y.should.approximately(0, fpDelta);
        });

        it('should create bumpers in the correct spots with 4 players', function() {
            var arena = new Arena({
                numberPlayers: 4,
                arenaRadius: 500,
                bumperRadius: 25,
                marginX: 0,
                marginY: 0
            });

            // There should be 3 bumpers
            var b1 = arena.getBumper(0);
            var b2 = arena.getBumper(1);
            var b3 = arena.getBumper(2);
            var b4 = arena.getBumper(3);

            b1.state.pos.x.should.approximately(146.447, fpDelta);
            b1.state.pos.y.should.approximately(853.553, fpDelta);

            b2.state.pos.x.should.approximately(853.553, fpDelta);
            b2.state.pos.y.should.approximately(853.553, fpDelta);

            b3.state.pos.x.should.approximately(853.553, fpDelta);
            b3.state.pos.y.should.approximately(146.447, fpDelta);

            b4.state.pos.x.should.approximately(146.447, fpDelta);
            b4.state.pos.y.should.approximately(146.447, fpDelta);
        });

        it('should create goals in the correct spots with 3 players', function() {

            var arena = new Arena({
                numberPlayers: 3,
                arenaRadius: 500,
                bumperRadius: 25,
                marginX: 0,
                marginY: 0
            });

            // There should be 3 bumpers
            var g1 = arena.getGoal(0);
            var g2 = arena.getGoal(1);
            var g3 = arena.getGoal(2);

            g1.state.pos.x.should.approximately(500, fpDelta);
            g1.state.pos.y.should.approximately(750, fpDelta);

            g2.state.pos.x.should.approximately(716.50625, fpDelta);
            g2.state.pos.y.should.approximately(375, fpDelta);

            g3.state.pos.x.should.approximately(283.49375, fpDelta);
            g3.state.pos.y.should.approximately(375, fpDelta);
        });


        it('should deserialize and serialize in a reversible way', function() {

            var arena = new Arena({
                numberPlayers: 3,
                arenaRadius: 500,
                bumperRadius: 25,
                marginX: 0,
                marginY: 0
            });

            var arenaConfig = arena.toConfig();


            var arena2 = new Arena(arenaConfig);

            // There should be 3 bumpers
            var g1 = arena2.getGoal(0);
            var g2 = arena2.getGoal(1);
            var g3 = arena2.getGoal(2);

            g1.state.pos.x.should.approximately(500, fpDelta);
            g1.state.pos.y.should.approximately(750, fpDelta);

            g2.state.pos.x.should.approximately(716.50625, fpDelta);
            g2.state.pos.y.should.approximately(375, fpDelta);

            g3.state.pos.x.should.approximately(283.49375, fpDelta);
            g3.state.pos.y.should.approximately(375, fpDelta);

            arena2.getRadius().should.equal(500);
        });

        /*it('should give the players expected score location', function() {
            var arena = new Arena({
                numberPlayers: 3,
                arenaRadius: 500,
                bumperRadius: 25,
                marginX: 0,
                marginY: 0
            });

            var score1 = arena.getScorePosition(0);
            var score2 = arena.getScorePosition(1);
            var score3 = arena.getScorePosition(2);

            score1.x.should.approximately(500, fpDelta);
            score1.y.should.approximately(1000, fpDelta);

            score2.x.should.approximately(933.0127, fpDelta);
            score2.y.should.approximately(250, fpDelta);

            score3.x.should.approximately(66.9873, fpDelta);
            score3.y.should.approximately(250, fpDelta);
        });*/
    });
});