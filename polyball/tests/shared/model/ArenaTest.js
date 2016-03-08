
var should = require('should'); // jshint ignore:line
var Arena = require('polyball/shared/model/Arena.js');

describe('Arena', function() {
    "use strict";
    describe('#getCoordinates(theta, radius, midX, midY)', function() {
        it('should match the unit circles cardinal values', function() {
            var test0 = Arena.getCoordinates(0, 1, 0, 0);
            var test1 = Arena.getCoordinates(Math.PI/2, 1, 0, 0);
            var test2 = Arena.getCoordinates(Math.PI, 1, 0, 0);
            var test3 = Arena.getCoordinates(Math.PI*3/2, 1, 0, 0);
            var test4 = Arena.getCoordinates(Math.PI*2, 1, 0, 0);

            test0.x.should.equal(1);
            test0.y.should.equal(0);

            test1.x.should.equal(0);
            test1.y.should.equal(1);

            test2.x.should.equal(-1);
            test2.y.should.equal(0);

            test3.x.should.equal(0);
            test3.y.should.equal(-1);

            test4.x.should.equal(1);
            test4.y.should.equal(0);
        });
    });
});