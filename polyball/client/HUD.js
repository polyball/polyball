/**
 * Created by kdban on 3/20/2016.
 */

var $ = require('jquery');
var PointerListener = require('polyball/client/hudbehaviors/PointerListener');
var Logger = require('polyball/shared/Logger');

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
    $.get('hudcomponents/addToQueueButton.html', function(data) {
        Logger.debug('Injecting add to queue button.');

        $('#hudColumn').append(data);
        $('#addToQueueButton').click(function (){
            comms.queueToPlay();
        });
    });

    $.get('hudcomponents/spectatorList.html', function (data) {
        Logger.debug('Injecting spectator list.');

        $('#hudColumn').append(data);
    });

    $.get('hudcomponents/playerQueue.html', function (data) {
        Logger.debug('Injecting player queue.');

        $('#hudColumn').append(data);
    });
    
    var appendNameToList = function (listElement) {
        
        return function (spectatorOrPlayer) {
            if (spectatorOrPlayer == null) {
                return;
            }

            var listItem = $('<li>').text(spectatorOrPlayer.client.name);
    
            if (spectatorOrPlayer.id === model.getLocalClientID()) {
                var localElement = $('<span>').addClass('localClient').text('  (you)');
                listItem.append(localElement);
            }
            listElement.append(listItem);
        };
    };

    this.render = function () {
        var spectatorList = $('.spectatorList');
        spectatorList.empty();
        model.getSpectators().forEach(appendNameToList(spectatorList));

        if (model.getAllQueuedPlayers().length === 0) {
            $('.playerQueueHeading').css("visibility", "hidden");
        } else {

            $('.playerQueueHeading').css("visibility", "visible");
        }
        var playerQueueList = $('.playerQueue');
        playerQueueList.empty();
        model.getAllQueuedPlayers().forEach(appendNameToList(playerQueueList));
    };
};


module.exports = HUD;