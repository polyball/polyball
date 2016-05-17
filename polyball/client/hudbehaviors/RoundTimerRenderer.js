/**
 * Created by kdban on 4/8/2016.
 */

var $ = require('jquery');
var Logger = require('polyball/shared/Logger');
var Util = require('polyball/shared/utilities/Util');

/**
 *
 * @param {Object} config
 * @property {string} config.appendTo - css selector for the element to append the renderer to
 * @constructor
 */
var RoundTimerRenderer = function (config) {

    $.get('hudcomponents/roundTimer.html', function (data) {
        Logger.debug('Injecting round timer.');

        $(config.appendTo).append(data);
    });
    
    this.render = function (millisRemaining) {
        $('.roundTimer').text(Util.millisToCountDown(millisRemaining));
    };
};

module.exports = RoundTimerRenderer;