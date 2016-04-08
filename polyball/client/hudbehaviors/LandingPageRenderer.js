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

    var landingModal;
    var self = this;

    $.get('hudcomponents/landingModal.html', function (data) {
        Logger.debug('Injecting Landing Modal.');

        $(config.prependTo).prepend(data);

        landingModal = $('.landingModal');

        var changeName = throttle(function () {
            if (!config.onNameChange) {
                Logger.warn("LandingPageRenderer: no onNameChange listener.");
                return;
            }
            config.onNameChange($('.landingNameChooser input').val());
        }, 100);
        $('.landingNameChooser input').keypress(changeName);
        $('.landingNameChooser input').change(changeName);

        $('.landingSpectateButton').click(function () {
            if (config.onWatchClick) {
                config.onWatchClick();
            }
            self.remove();
        });
        $('.landingQueueButton').click(function () {
            if (config.onQueueClick) {
                config.onQueueClick();
            }
            self.remove();
        });
    });
    
    this.render = function (name) {
        if (landingModal != null) {
            $('.localUsername').text(name);
            if (!$('.landingNameChooser input').is(":focus")) {
                $('.landingNameChooser input').val(name);
            }
        }
    };

    this.remove = function () {
        if (landingModal != null) {
            landingModal.remove();
        }
    };
};

module.exports = LandingPageRenderer;