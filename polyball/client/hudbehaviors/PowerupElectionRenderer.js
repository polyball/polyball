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
var PowerupElectionRenderer = function (config) {
    
    var mainElement;
    var resultsBody;
    var scoreElements;

    var currentElectionID;
    
    $.get('hudcomponents/powerupElection.html', function (data) {
        Logger.debug('Injecting powerup election.');

        $(config.appendTo).append(data);
        mainElement = $('.powerupElection');
        resultsBody = mainElement.find('tbody');
    });

    var closedVoteCallback = function (powerupName, countVotes) {
        return function () {
            if (typeof config.voteCallback === 'function' && countVotes) {
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

        Object.keys(tally).forEach(function (powerupName) {

            var powerupScoreElement = $('<td>').text(tally[powerupName]).addClass('voteScore');
            scoreElements[powerupName] = powerupScoreElement;

            resultsBody.append(
                $('<tr>').append(
                    $('<td>').text(powerupName).attr('id', powerupName)
                ).append(
                    powerupScoreElement
                ).addClass('powerupRow').click(closedVoteCallback(powerupName, countVotes))
            );
        });
    };

    /**
     *
     * @param {Object<string,number>} tally - the number of votes for each powerup
     */
    var updateResults = function (tally) {
        Object.keys(tally).forEach(function (powerupName) {
            scoreElements[powerupName].text(tally[powerupName]);
        });
    };



    /**
     * 
     * @param {Model} model
     */
    this.render = function (model) {
        
        if (mainElement == null) {
            return;
        }
        
        var election = model.getPowerupElection();
        if (election == null) {
            mainElement.hide();
            return;
        }

        var countVotes = !model.hasPlayer(model.getLocalClientID());

        // on new election, clear the table and refill the rows
        if (currentElectionID !== election.id) {
            resultsBody.empty();
            fillResults(election.getTally(), countVotes);
            mainElement.show();

            currentElectionID = election.id;
        } else {
            updateResults(election.getTally());
        }

        if (countVotes) {
            $('.voteMessage').show();
        } else {
            $('.voteMessage').hide();
        }
    };
    
};

module.exports = PowerupElectionRenderer;