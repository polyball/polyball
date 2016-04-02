/**
 * Created by kdban on 3/20/2016.
 */

var $ = require('jquery');
var PointerListener = require('polyball/client/hudbehaviors/PointerListener');

/**
 * @param config
 * @property {Number} config.accumulationInterval - The minimum time spane between successive mouse move registrations.
 * @property {Comms} config.comms - the game client comms module.
 * @property {Model} config.model - the game model.  FOR RENDERERING PURPOSES, not mutation.
 * @property {Synchronizer} config.synchronizer - the game synchronizer for passing mouse movement commands.
 * @constructor
 */
var HUD = function (config) {
    
    var comms = config.comms;
    var model = config.model;  // jshint ignore: line

    new PointerListener({
        accumulationInterval: config.accumulationInterval,
        synchronizer: config.synchronizer
    }).listenElement(document);

    // Inject and listen to queue-to-play button
    $.get('hudcomponenets/addToQueueButton.html', function(data) {
        $('#viewport').append(data);
        $('#addToQueueButton').click(function (){
            comms.queueToPlay();
        });
    });
};


module.exports = HUD;