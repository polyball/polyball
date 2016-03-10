
var should = require('should'); // jshint ignore:line
var Arena = require('polyball/shared/model/Arena.js');

describe('Arena', function() {
    "use strict";

    var fpDelta = 0.001;

    describe('#getCoordinates(theta, radius, midX, midY)', function() {
        it('should match the unit circles cardinal values (in game coordinates)', function() {
            var test0 = Arena.getCoordinates(0, 1, 0, 0);
            var test1 = Arena.getCoordinates(Math.PI/2, 1, 0, 0);
            var test2 = Arena.getCoordinates(Math.PI, 1, 0, 0);
            var test3 = Arena.getCoordinates(Math.PI*3/2, 1, 0, 0);
            var test4 = Arena.getCoordinates(Math.PI*2, 1, 0, 0);

            test0.x.should.approximately(1, fpDelta);
            test0.y.should.approximately(0, fpDelta);

            test1.x.should.approximately(0, fpDelta);
            test1.y.should.approximately(-1, fpDelta);

            test2.x.should.approximately(-1, fpDelta);
            test2.y.should.approximately(0, fpDelta);

            test3.x.should.approximately(0, fpDelta);
            test3.y.should.approximately(1, fpDelta);

            test4.x.should.approximately(1, fpDelta);
            test4.y.should.approximately(0, fpDelta);
        });

        it('should match the unit circles non-cardinal values (in game coordinates)', function() {
            var test1 = Arena.getCoordinates((1/4)*Math.PI, 1, 0, 0);
            var test2 = Arena.getCoordinates((3/4)*Math.PI, 1, 0, 0);
            var test3 = Arena.getCoordinates((5/4)*Math.PI, 1, 0, 0);
            var test4 = Arena.getCoordinates((7/4)*Math.PI, 1, 0, 0);

            test1.x.should.approximately(Math.sqrt(2)/2, fpDelta);
            test1.y.should.approximately(-Math.sqrt(2)/2, fpDelta);

            test2.x.should.approximately(-Math.sqrt(2)/2, fpDelta);
            test2.y.should.approximately(-Math.sqrt(2)/2, fpDelta);

            test3.x.should.approximately(-Math.sqrt(2)/2, fpDelta);
            test3.y.should.approximately(Math.sqrt(2)/2, fpDelta);

            test4.x.should.approximately(Math.sqrt(2)/2, fpDelta);
            test4.y.should.approximately(Math.sqrt(2)/2, fpDelta);
        });
    });

    describe('#Arena(config)', function() {
        it('should create bumpers in the correct spots with 3 players', function() {
            var config = {};
            config.numberPlayers = 3;
            config.arenaRadius = 500;

            var arena = new Arena(config);

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
            var config = {};
            config.numberPlayers = 4;
            config.arenaRadius = 500;

            var arena = new Arena(config);

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

        // Needs tests for the goals.
    });
});