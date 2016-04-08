/**
 * Created by kdban on 4/8/2016.
 */

var $ = require('jquery');
var Logger = require('polyball/shared/Logger');


var appendNameToList = function (listElement, localID) {

    return function (spectatorOrPlayer) {
        if (spectatorOrPlayer == null) {
            return;
        }

        var listItem = $('<li>').text(spectatorOrPlayer.client.name);

        if (spectatorOrPlayer.id === localID) {
            var localElement = $('<span>').addClass('localClient').text('  (you)');
            listItem.append(localElement);
        }
        listElement.append(listItem);
    };
};

/**
 *
 * @param {Object} config
 * @property {string} config.appendTo - css selector for the element to append the renderer to
 * @constructor
 */
module.exports.SpectatorListRenderer = function (config) {

    $.get('hudcomponents/spectatorList.html', function (data) {
        Logger.debug('Injecting spectator list.');

        $(config.appendTo).append(data);
    });

    this.render = function (spectators, localID) {
        var spectatorList = $('.spectatorList');
        spectatorList.empty();
        spectators.forEach(appendNameToList(spectatorList, localID));
    };
};

module.exports.PlayerQueueListRenderer = function (config) {

    $.get('hudcomponents/playerQueue.html', function (data) {
        Logger.debug('Injecting player queue.');

        $(config.appendTo).append(data);
    });

    this.render = function (playerQueue, localID) {
        var playerQueueList = $('.playerQueue');
        playerQueueList.empty();
        if (playerQueue.length === 0) {
            playerQueueList.append(
                $('<li>').addClass('grayed').text('No players queued.')
            );
        }
        playerQueue.forEach(appendNameToList(playerQueueList, localID));
    };
};