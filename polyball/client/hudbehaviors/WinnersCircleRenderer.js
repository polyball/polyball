/**
 * Created by kdban on 4/8/2016.
 */

var $ = require('jquery');
var Logger = require('polyball/shared/Logger');

/**
 * 
 * @param {Object} config
 * @property {string} config.appendTo - css selector for the element to append the renderer to
 * @constructor
 */
var WinnersCircleRenderer = function (config) {

    // SRS Requirement - 3.2.2.12 Ending Game
    this.renderWinnersCircle = function (roundEndData) {
        $.get('hudcomponents/winnersCircle.html', function (data) {
            Logger.debug('Injecting Winners Circle.');

            $(config.appendTo).append(data);
            roundEndData.winners.forEach(function (winner) {
                $('#winners-list').append("<li>" + winner.name + " : " + winner.score + "</li>");
            });
        });
    };

    this.hideWinnersCircle = function () {
        var winnersCircle = $('.winners-circle');
        if (winnersCircle != null) {
            winnersCircle.remove();
        }
    };

};

module.exports = WinnersCircleRenderer;