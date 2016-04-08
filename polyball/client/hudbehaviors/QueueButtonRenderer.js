/**
 * Created by kdban on 4/8/2016.
 */

var $ = require('jquery');
var Logger = require('polyball/shared/Logger');

/**
 *
 * @param {Object} config
 * @property {string} config.appendTo - css selector for the element to append the renderer to
 * @property {function} config.onClick - callback for when the queue button is clicked
 * @constructor
 */
var QueueButtonRenderer = function (config) {


    // Inject and listen to queue-to-play button
    // SRS Requirement - 3.2.2.3 Join Player Queue
    $.get('hudcomponents/addToQueueButton.html', function(data) {
        Logger.debug('Injecting add to queue button.');

        $(config.appendTo).append(data);
        $('#addToQueueButton').click(config.onClick);
    });
    
    this.render = function (localQueued, localPlaying) {

        if (!localQueued && !localPlaying) {
            $('#addToQueueButton').css('visibility', 'visible');
        }
        else if (localQueued || localPlaying) {
            $('#addToQueueButton').css('visibility', 'hidden');
        }
    };
};

module.exports = QueueButtonRenderer;