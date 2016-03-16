
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
                bumperRadius: 25
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
                bumperRadius: 25
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
                bumperRadius: 25
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

        // Needs tests for the goals.
    });
});