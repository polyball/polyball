/**
 * Created by kdban on 3/20/2016.
 */

var $ = require('jquery');
var PointerListener = require('polyball/client/hudbehaviors/PointerListener');
var PowerupElectionRenderer = require('polyball/client/hudbehaviors/PowerupElectionRenderer');
var WinnersCircleRenderer = require('polyball/client/hudbehaviors/WinnersCircleRenderer');
var UserListRenderers = require('polyball/client/hudbehaviors/UserListRenderers');
var Logger = require('polyball/shared/Logger');
var EngineStatus = require('polyball/shared/EngineStatus');
var Util = require('polyball/shared/Util');
var CommsEvents = require('polyball/shared/CommsEvents');

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

    $.get('hudcomponents/roundTimer.html', function (data) {
        Logger.debug('Injecting round timer.');

        $('#hudColumn').append(data);
    });

    // Inject and listen to queue-to-play button
    // SRS Requirement - 3.2.2.3 Join Player Queue
    $.get('hudcomponents/addToQueueButton.html', function(data) {
        Logger.debug('Injecting add to queue button.');

        $('#hudColumn').append(data);
        $('#addToQueueButton').click(function (){
            comms.queueToPlay();
        });
    });
    

    new PointerListener({
        accumulationInterval: config.accumulationInterval,
        synchronizer: config.synchronizer
    }).listenElement(document);
    
    var spectatorListRenderer = new UserListRenderers.SpectatorListRenderer({
        appendTo: '#hudColumn'
    });
    
    var playerQueueRenderer = new UserListRenderers.PlayerQueueListRenderer({
        appendTo: '#hudColumn'
    });

    $.get('hudcomponents/waitingForPlayers.html', function (data) {
        Logger.debug('Injecting waiting for players.');

        $('#hudColumn').append(data);
    });
    
    var powerupElectionRenderer = new PowerupElectionRenderer({
        appendTo: '#hudColumn',
        voteCallback: comms.voteForPowerup
    });
    
    var winnersCircleRenderer = new WinnersCircleRenderer({
        appendTo: 'body'
    });
    

    this.render = function () {
        $('.roundTimer').text(Util.millisToCountDown(model.getRoundLength() - model.getCurrentRoundTime()));

        spectatorListRenderer.render(model.getSpectators(), model.getLocalClientID());
        playerQueueRenderer.render(model.getAllQueuedPlayers(), model.getLocalClientID());


        var localQueued = model.hasQueuedPlayer(model.getLocalClientID());
        var localPlaying = model.hasPlayer(model.getLocalClientID());
        if (!localQueued && !localPlaying) {
            $('#addToQueueButton').css('visibility', 'visible');
        }
        else if (localQueued || localPlaying) {
            $('#addToQueueButton').css('visibility', 'hidden');
        }
        
        
        powerupElectionRenderer.render(model);
        $('.waitingForPlayers').hide();
        if (model.gameStatus === EngineStatus.gameInitializing) {
            $('.waitingForPlayers').show();
        }
    };

    /**
     * Use this function to do anything that should be done on round end.
     * @param roundEndData
     */
    var handleRoundEnded = function(roundEndData){
        winnersCircleRenderer.renderWinnersCircle(roundEndData);
    };

    var handleRoundStarted = function(roundStartData){ //jshint ignore:line
        winnersCircleRenderer.hideWinnersCircle();
    };

    comms.on(CommsEvents.ClientToClient.roundEnded, handleRoundEnded);
    comms.on(CommsEvents.ClientToClient.newRound, handleRoundStarted);
};


module.exports = HUD;