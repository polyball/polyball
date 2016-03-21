/**
 * Created by thornhil on 3/7/16.
 */

'use strict';
var Vote = require('polyball/shared/model/Vote');
var Util = require('polyball/shared/Util');

/**
 * Elects a powerup to be spawned in the arena.
 * @param {Object} config
 * @param {Object[]} config.powerups - The powerup configs for initializing powerups
 * @param {Object[]} config.votes - The vote configs for initializing votes
 * @constructor
 */
function PowerupElection(config) {
    //TODO expand powerups from powerup configs array
    //TODO also update toConfig()
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
 * Converts this PowerupElection object into it's config (serializable) form
 * @return {Object}
 */
PowerupElection.prototype.toConfig = function (){
    var voteConfigs = [];
    this.votes.forEach(function(vote){
       voteConfigs.push(vote.toConfig());
    });

    return {
        votes: voteConfigs,
        powerups: this.powerups
        //TODO Add powerups
    };
};

module.exports = PowerupElection;