/**
 * Created by kdban on 4/3/2016.
 */

var $ = require('jquery');
var Logger = require('polyball/shared/Logger');

var closedVoteCallback = function (powerupName) {
    return function () {
        console.log(powerupName);
    };
};


/**
 * 
 * @param {Object} config
 * @property {string} config.appendTo - the css selector of the element(s) to append the renderer to.
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

    /**
     *
     * @param {Object<string,number>} tally
     */
    var fillResults = function (tally) {
        scoreElements = {};

        Object.keys(tally).forEach(function (powerupName) {

            var powerupScoreElement = $('<td>').text(tally[powerupName]).addClass('voteScore');
            scoreElements[powerupName] = powerupScoreElement;

            resultsBody.append(
                $('<tr>').append(
                    $('<td>').text(powerupName).attr('id', powerupName)
                ).append(
                    powerupScoreElement
                ).click(closedVoteCallback(powerupName))
            );
        });
    };

    /**
     *
     * @param {Object<string,number>} tally
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

        // on new election, clear the table and refill the rows
        if (currentElectionID !== election.id) {
            resultsBody.empty();
            fillResults(election.getTally());
            mainElement.show();

            currentElectionID = election.id;
        } else {
            updateResults(election.getTally());
        }
    };
    
};

module.exports = PowerupElectionRenderer;