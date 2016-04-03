/**
 * Created by thornhil on 3/7/16.
 */

'use strict';
var Vote = require('polyball/shared/model/Vote');
var Util = require('polyball/shared/Util');

/**
 * Elects a powerup to be spawned in the arena.
 * @param {Object} config
 * @param {String[]} config.powerups - The powerup configs for initializing powerups
 * @param {Object[]} config.votes - The vote configs for initializing votes
 * @constructor
 */
function PowerupElection(config) {
    this.powerups = config.powerups;
    this.votes = [];

    Util.expandArray(this.votes, config.votes, Vote);
}

/**
 * Adds a vote to the powerup election. Ensures that spectators can only vote
 * once.
 * @param {Vote} vote
 */
PowerupElection.prototype.addVote = function (vote) {
    var index = this.getPlayerVoteIndex(vote.spectatorID);
    if (index !== -1){
        this.votes[index].powerup = vote.powerup;
    } else {
        this.votes.push(vote);
    }
};

/**
 * Removes a vote from a certain spectator
 * @param {Number} spectatorID
 * @return {Vote} the vote that was removed
 */
PowerupElection.prototype.removeVote = function (spectatorID) {
    var index = this.getPlayerVoteIndex(spectatorID);
    if (index !== -1) {
        return this.votes.splice(index, 1)[0];
    }
};


/**
 * @param {Number} spectatorID
 * @return {Number} index in votes or -1 if the spectator has not voted
 */
PowerupElection.prototype.getPlayerVoteIndex = function (spectatorID) {
    for (var i = 0; i < this.votes.length; i++){
        if (this.votes[i].spectatorID === spectatorID){
            return i;
        }
    }
    return -1;
};

/**
 * Returns the current tally for the vote of the form
 * {powerup: #votes}
 * @returns {{}}
 */
PowerupElection.prototype.getTally = function(){
    var tally = {};

    this.votes.forEach(function(vote){
        if (!tally[vote.powerup]){
            tally[vote.powerup] = 1;
        } else {
            tally[vote.powerup] += 1;
        }
    });

    return tally;
};

/**
 * @return {String} winning powerup name
 */
PowerupElection.prototype.getWinner = function (){
    var tally = {};
    var maxVotes = 0;
    var powerup = null;

    this.votes.forEach(function(vote){
        if (!tally[vote.powerup]){
            tally[vote.powerup] = 1;
        } else {
            tally[vote.powerup] += 1;
        }

        if (tally[vote.powerup] > maxVotes){
            powerup = vote.powerup;
        }
    });

    if (powerup != null){
        return powerup;
    } else {
        return this.powerups[Math.floor(Math.random()*this.powerups.length)];
    }
};

/**
 * Converts this PowerupElection object into it's config (serializable) form
 * @return {Object}
 */
PowerupElection.prototype.toConfig = function (){
    var voteConfigs = [];
    this.votes.forEach(function(vote){
       voteConfigs.push(vote.toConfig());
    });

    return {
        votes: Util.arrayToConfig(this.votes),
        powerups: this.powerups
    };
};

module.exports = PowerupElection;