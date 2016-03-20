/**
 * Created by kdban on 3/20/2016.
 */

var $ = require('jquery');

/**
 * @param config
 * @property {Comms} config.comms - the game client comms module.
 * @constructor
 */
var HUD = function (config) {

    var comms = config.comms;

    $.get('hudcomponenets/addToQueueButton.html', function(data) {
        $('#viewport').append(data);
        $('#addToQueueButton').click(function (){
            comms.queueToPlay();
        });
    });
    
};


module.exports = HUD;