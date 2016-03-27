/**
 * Created by kdban on 3/20/2016.
 */

var $ = require('jquery');
var Physics = require('physicsjs');

/**
 * @param config
 * @property {Number} config.accumulationInterval - The minimum time spane between successive mouse move registrations.
 * @property {Comms} config.comms - the game client comms module.
 * @property {Model} config.model - the game model.  FOR RENDERERING PURPOSES, not mutation.
 * @property {Synchronizer} config.synchronizer - the game synchronizer for passing mouse movement commands.
 * @constructor
 */
var HUD = function (config) {

    var accumulationInterval = config.accumulationInterval;
    
    var comms = config.comms;
    var model = config.model;  // jshint ignore: line
    var synchronizer = config.synchronizer;
    
    var previousMouseX;
    var accumulatedMouseDeltaX = 0;

    // Inject and listen to queue-to-play button
    $.get('hudcomponenets/addToQueueButton.html', function(data) {
        $('#viewport').append(data);
        $('#addToQueueButton').click(function (){
            comms.queueToPlay();
        });
    });


    var registerMouseMove = function() {
        // Do not set the paddle position in here!  Pass the movement command (amount) through the synchronizer.
        if (accumulatedMouseDeltaX !== 0) {
            console.log(accumulatedMouseDeltaX + ' : ' + Date.now().toString());
            synchronizer.registerMouseMove(accumulatedMouseDeltaX);
            accumulatedMouseDeltaX = 0;
        }
    };
    var throttledRegisterMouseMove = Physics.util.throttle(registerMouseMove, accumulationInterval);

    // Listen to mouse movements
    $(document).mousemove(function (evt) {
        if (previousMouseX != null) {
            accumulatedMouseDeltaX += evt.pageX - previousMouseX;

            //registerMouseMove();                //  <-- RYAN: swap which one of these lines is commented,
            throttledRegisterMouseMove();     //            rebuild and restart everything, and notice difference
        }

        previousMouseX = evt.pageX;
    });

};


module.exports = HUD;