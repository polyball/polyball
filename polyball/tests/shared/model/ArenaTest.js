
var should = require('should'); // jshint ignore:line
var Arena = require('polyball/shared/model/Arena.js');

describe('Arena', function() {
    "use strict";
    describe('#getCoordinates(theta, radius, midX, midY)', function() {
        it('should give {0, 1} when given (Math.PI/2, 1, 0, 0)', function() {
            Arena.getCoordinates(Math.PI/2, 1, 0, 0).x.should.be.exactly(0);
            Arena.getCoordinates(Math.PI/2, 1, 0, 0).y.should.be.exactly(1);
        });
    });
});