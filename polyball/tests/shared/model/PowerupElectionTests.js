// Include assertion library "Should"
var should = require('should'); // jshint ignore:line
var PowerupElection = require('polyball/shared/powerups/PowerupElection.js');
var Vote = require('polyball/shared/model/Vote.js');

// An example test that runs using Mocha and uses "Should" for assertion testing
describe('Powerup Election', function() {
    "use strict";
    describe('#addVote()', function() {
        it('should increase the size of the votes array by 1', function() {
            var pe = new PowerupElection({powerups: [1,2,3]});
            pe.addVote(new Vote({spectatorID: 1, powerup:1}));
            pe.votes.length.should.equal(1);
        });
        it('should increase the size of the votes array by 1 for each added vote', function() {
            var pe = new PowerupElection({powerups: [1,2,3]});
            var n = 10;
            for (var i = 0; i < n; i++){
                pe.addVote(new Vote({spectatorID: i, powerup:1}));
            }
            pe.votes.length.should.equal(n);
        });
        it('should replace the current vote with new vote', function() {
            var pe = new PowerupElection({powerups: [1,2,3]});
            pe.addVote(new Vote({spectatorID: 1, powerup:1}));
            pe.addVote(new Vote({spectatorID: 1, powerup:2}));
            pe.votes.length.should.equal(1);
            (pe.votes[0]).powerup.should.equal(2);
        });
        it('should replace the current vote with new vote for each additional ' +
            'vote from same spectator', function() {
            var pe = new PowerupElection({powerups: [1,2,3]});
            var n = 10;

            var firstVote = 1;
            var secondVote = 2;
            for (var i = 0; i < n; i++){
                pe.addVote(new Vote({spectatorID: i, powerup: firstVote}));
                pe.addVote(new Vote({spectatorID: i, powerup: secondVote}));
            }
            pe.votes.length.should.equal(n);
            pe.votes.forEach(function(elm){
                elm.powerup.should.equal(secondVote);
            });
        });
    });
    describe('#removeVote()', function() {
        it('should decrease the size of the votes array by 1', function() {
            var pe = new PowerupElection({powerups: [1,2,3]});
            pe.addVote(new Vote({spectatorID: 1, powerup:1}));
            pe.removeVote(1);
            pe.votes.length.should.equal(0);
        });
        it('should decrease the size of the votes array by 1 for each additional call', function() {
            var pe = new PowerupElection({powerups: [1,2,3]});
            var n = 10;
            for (var i = 0; i < n; i++){
                pe.addVote(new Vote({spectatorID: i, powerup:1}));
            }
            for (i = 0; i < n; i++){
                pe.removeVote(i);
            }
            pe.votes.length.should.equal(0);
        });
    });
    describe('#getWinner()', function() {
        it('should return the powerup with the most votes ', function() {
            var pe = new PowerupElection({powerups: [1,2,3]});
            pe.addVote(new Vote({spectatorID: 1, powerup:1}));
            pe.addVote(new Vote({spectatorID: 2, powerup:2}));
            pe.addVote(new Vote({spectatorID: 3, powerup:2}));

            pe.getWinner().should.equal(2);
        });
        it('should decrease the size of the votes array by 1 for each additional call', function() {
            var pe = new PowerupElection({powerups: [1,2,3]});
            var winner = pe.getWinner();
            (winner != null).should.be.ok; //jshint ignore:line
            [1,2,3].should.containEql(winner);

        });
    });
});