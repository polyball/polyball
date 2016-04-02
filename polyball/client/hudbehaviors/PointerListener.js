/**
 * Created by kdban on 4/1/2016.
 */

var $ = require('jquery');
var Physics = require('physicsjs');

/**
 * Listens to mouse and touch events, registering them with a synchronizer.
 *
 * @param {Object} config
 * @property {Number} config.accumulationInterval - the interval to accumulate movement before event registration.
 * @property {Synchronizer} config.synchronizer - the synchronizer to register movements with.
 * @constructor
 */
var PointerListener = function (config) {

    var synchronizer = config.synchronizer;
    var accumulationInterval = config.accumulationInterval;
    
    var previousPointerX;
    var accumulatedDeltaX = 0;

    var registerPointerMove = function() {
        // Do not set the paddle position in here!  Pass the movement command (amount) through the synchronizer.
        if (accumulatedDeltaX !== 0) {
            synchronizer.registerMouseMove(accumulatedDeltaX);
            accumulatedDeltaX = 0;
        }
    };
    var throttledRegisterPointerMove = Physics.util.throttle(registerPointerMove, accumulationInterval);

    var accumulatePageX = function (pageX) {
        if (previousPointerX != null) {
            accumulatedDeltaX += pageX - previousPointerX;

            throttledRegisterPointerMove();
        }

        previousPointerX = pageX;
    };

    var accumulateMouseEvent = function (evt) {
        accumulatePageX(evt.pageX);
    };

    var accumulateTouchEvent = function (evt) {
        accumulatePageX(evt.originalEvent.touches[0].pageX);
    };

    /**
     * Listen to mouse movements for a UI element
     * @param selector - A jquery selector.
     * @returns {PointerListener} Returns self for fluent API pattern.
     */
    this.listenElement = function (selector) {
        $(selector).on('mousemove', accumulateMouseEvent);
        $(selector).on('touchmove', accumulateTouchEvent);

        return this;
    };
};

module.exports = PointerListener;