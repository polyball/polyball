// Include assertion library "Should"
var should = require('should'); // jshint ignore:line

// An example test that runs using Mocha and uses "Should" for assertion testing
describe('Array', function() {
    "use strict";
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            [1,2,3].indexOf(5).should.be.exactly(-1);
            [1,2,3].indexOf(0).should.be.exactly(-1);
        });
        it('should return 0 for the index of 1', function() {
            [1,2,3].indexOf(1).should.equal(0);
        });
    });
});