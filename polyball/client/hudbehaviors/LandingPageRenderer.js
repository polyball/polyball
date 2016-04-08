/**
 * Created by kdban on 4/8/2016.
 */

var $ = require('jquery');
var Logger = require('polyball/shared/logger');
var throttle = require('physicsjs').util.throttle;

/**
 *
 * @param {Object} config
 * @property {string} config.prependTo - css selector for the element to prepend the renderer to
 * @property {function} config.onNameChange
 * @property {function} config.onWatchClick
 * @property {function} config.onQueueClick
 * @constructor
 */
var LandingPageRenderer = function (config) {

    $.get('hudcomponents/landingModal.html', function (data) {
        Logger.debug('Injecting Landing Modal.');

        $(config.prependTo).prepend(data);

        $('.landingNameChooser input').change(throttle(function () {
            config.onNameChange($('.landingNameChooser input').val());
        }, 1000));
    });
    
    this.render = function (name) {
        $('.localUsername').text(name);
    };
};

module.exports = LandingPageRenderer;