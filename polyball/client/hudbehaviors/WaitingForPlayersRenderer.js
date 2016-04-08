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

var WaitingForPlayersRenderer = function (config) {
    
    $.get('hudcomponents/waitingForPlayers.html', function (data) {
        Logger.debug('Injecting waiting for players.');

        $(config.appendTo).append(data);
    });
    
    this.render = function (waiting) {
        $('.waitingForPlayers').hide();
        if (waiting) {
            $('.waitingForPlayers').show();
        }
    };
};

module.exports = WaitingForPlayersRenderer;