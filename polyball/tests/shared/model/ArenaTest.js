
var should = require('should'); // jshint ignore:line
var Arena = require('polyball/shared/model/Arena.js');

describe('Arena', function() {
    "use strict";

    var fpDelta = 0.001;

    describe('#getCoordinates(theta, radius, midX, midY)', function() {
        it('should match the unit circles cardinal values', function() {
            var test0 = Arena.getCoordinates(0, 1, 0, 0);
            var test1 = Arena.getCoordinates(Math.PI/2, 1, 0, 0);
            var test2 = Arena.getCoordinates(Math.PI, 1, 0, 0);
            var test3 = Arena.getCoordinates(Math.PI*3/2, 1, 0, 0);
            var test4 = Arena.getCoordinates(Math.PI*2, 1, 0, 0);

            test0.x.should.approximately(1, fpDelta);
            test0.y.should.approximately(0, fpDelta);

            test1.x.should.approximately(0, fpDelta);
            test1.y.should.approximately(1, fpDelta);

            test2.x.should.approximately(-1, fpDelta);
            test2.y.should.approximately(0, fpDelta);

            test3.x.should.approximately(0, fpDelta);
            test3.y.should.approximately(-1, fpDelta);

            test4.x.should.approximately(1, fpDelta);
            test4.y.should.approximately(0, fpDelta);
        });
    });
});