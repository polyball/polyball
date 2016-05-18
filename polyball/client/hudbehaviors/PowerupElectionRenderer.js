/**
 * Created by kdban on 4/3/2016.
 */

var $ = require('jquery');
var Logger = require('polyball/shared/Logger');


/**
 * 
 * @param {Object} config
 * @property {string} config.appendTo - the css selector of the element(s) to append the renderer to.
 * @property {function) config.voteCallback - the function to call with a vote name when one is cast.
 * @constructor
 */
// SRS Requirement - 3.2.2.16 Powerup Vote
var PowerupElectionRenderer = function (config) {
    
    var mainElement;
    var resultsBody;
    var scoreElements;
    var rowElements;

    var currentElectionID;
    
    $.get('hudcomponents/powerupElection.html', function (data) {
        Logger.debug('Injecting powerup election.');

        $(config.appendTo).append(data);
        mainElement = $('.powerupElection');
        resultsBody = mainElement.find('tbody');
    });

    var closedVoteCallback = function (powerupName) {
        return function () {
            if (typeof config.voteCallback === 'function') {
                config.voteCallback(powerupName);
            }
        };
    };

    /**
     *
     * @param {Object<string,number>} tally - the number of votes for each powerup
     * @param {bool} countVotes - whether or not to count the votes of the client
     */
    var fillResults = function (tally, countVotes) {
        scoreElements = {};
        rowElements = {};

        Object.keys(tally).forEach(function (powerupName) {

            var powerupNameElement = $('<td>').text(powerupName).attr('id', powerupName);
            
            var powerupScoreElement = $('<td>').text(tally[powerupName]).addClass('voteScore');
            scoreElements[powerupName] = powerupScoreElement;

            var powerupRowElement = 
                $('<tr>')
                    .append(powerupNameElement)
                    .append(powerupScoreElement)
                    .addClass('powerupRow');
            rowElements[powerupName] = powerupRowElement;
            
            if (countVotes) {
                powerupRowElement.click(closedVoteCallback(powerupName));
                powerupRowElement.addClass('voteButton');
            }
            
            resultsBody.append(powerupRowElement);
        });
    };

    /**
     *
     * @param {Object<string,number>} tally - the number of votes for each powerup
     * @param {Vote} localVote - the vote made locally (or null)
     */
    var updateResults = function (tally, localVote) {
        Object.keys(tally).forEach(function (powerupName) {
            scoreElements[powerupName].text(tally[powerupName]);
            rowElements[powerupName].removeClass('votedButton');
        });

        if (localVote != null) {
            rowElements[localVote.powerup].addClass('votedButton');
        }
    };



    /**
     * 
     * @param {Model} model
     */
    this.render = function (model) {
        
        if (mainElement == null) {
            return;
        }
        
        var election = model.powerupElectionContainer.getPowerupElection();
        if (election == null) {
            mainElement.hide();
            return;
        }

        var countVotes = !model.playersContainer.hasPlayer(model.getLocalClientID());

        // on new election, clear the table and refill the rows
        if (currentElectionID !== election.id) {
            resultsBody.empty();
            fillResults(election.getTally(), countVotes);
            mainElement.show();

            currentElectionID = election.id;
        } else {
            var localVoteIndex = election.getPlayerVoteIndex(model.getLocalClientID());
            var localVote = localVoteIndex === -1 ? null : election.votes[localVoteIndex];
            updateResults(election.getTally(), localVote);
        }

        if (countVotes) {
            $('.voteMessage').show();
        } else {
            $('.voteMessage').hide();
        }
    };
    
};

module.exports = PowerupElectionRenderer;