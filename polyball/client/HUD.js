/**
 * Created by kdban on 3/20/2016.
 */

var $ = require('jquery');

/**
 * @param config
 * @property {Comms} config.comms - the game client comms module.
 * @property {Model} config.model - the game model.  FOR RENDERERING PURPOSES, not mutation.
 * @property {Synchronizer} config.synchronizer - the game synchronizer for passing mouse movement commands.
 * @constructor
 */
var HUD = function (config) {

    var comms = config.comms;
    var model = config.model;  // jshint ignore: line
    var synchronizer = config.synchronizer;
    
    var previousMousePos = { x: null, y: null};

    // Inject and listen to queue-to-play button
    $.get('hudcomponenets/addToQueueButton.html', function(data) {
        $('#viewport').append(data);
        $('#addToQueueButton').click(function (){
            comms.queueToPlay();
        });
    });

    // Listen to mouse movements
    $(document).mousemove(function (evt) {
        if (previousMousePos.x != null || previousMousePos.y != null) {
            var deltaX = evt.pageX - previousMousePos.x;
            
            // Do not set the paddle position in here!  Pass the movement command (amount) through the synchronizer.
            if (deltaX !== 0){
                synchronizer.registerMouseMove(deltaX);
            }
        }

        previousMousePos.x = evt.pageX;
        previousMousePos.y = evt.pageY;
    });

};


module.exports = HUD;