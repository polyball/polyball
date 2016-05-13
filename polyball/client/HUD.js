/**
 * Created by kdban on 3/20/2016.
 */

var PointerListener = require('polyball/client/hudbehaviors/PointerListener');
var LandingPageRenderer = require('polyball/client/hudbehaviors/LandingPageRenderer');
var RoundTimerRenderer = require('polyball/client/hudbehaviors/RoundTimerRenderer');
var QueueButtonRenderer = require('polyball/client/hudbehaviors/QueueButtonRenderer');
var PowerupElectionRenderer = require('polyball/client/hudbehaviors/PowerupElectionRenderer');
var WaitingForPlayersRenderer = require('polyball/client/hudbehaviors/WaitingForPlayersRenderer');
var WinnersCircleRenderer = require('polyball/client/hudbehaviors/WinnersCircleRenderer');
var UserListRenderers = require('polyball/client/hudbehaviors/UserListRenderers');
var Logger = require('polyball/shared/Logger');
var EngineStatus = require('polyball/shared/EngineStatus');
var CommsEvents = require('polyball/shared/CommsEvents');
var $ = require('jquery');

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
    var model = config.model;
    
    Logger.info('HUD initializing compononts.');
    new PointerListener({
        accumulationInterval: config.accumulationInterval,
        synchronizer: config.synchronizer
    }).listenElement(document);

    var landingPageRenderer = new LandingPageRenderer({
        prependTo: '#body',
        onNameChange: comms.requestClientName,
        onQueueClick: comms.queueToPlay
    });

    var queueButtonRenderer = new QueueButtonRenderer({
        appendTo: '#hudColumn',
        onClick: comms.queueToPlay
    });
    
    var roundTimerRenderer = new RoundTimerRenderer({
        appendTo: '#hudColumn'
    });
    
    var spectatorListRenderer = new UserListRenderers.SpectatorListRenderer({
        appendTo: '#hudColumn'
    });
    
    var playerQueueRenderer = new UserListRenderers.PlayerQueueListRenderer({
        appendTo: '#hudColumn'
    });

    var waitingForPlayersRenderer = new WaitingForPlayersRenderer({
        appendTo: '#hudColumn'
    });
    
    var powerupElectionRenderer = new PowerupElectionRenderer({
        appendTo: '#hudColumn',
        voteCallback: comms.voteForPowerup
    });
    
    var winnersCircleRenderer = new WinnersCircleRenderer({
        appendTo: 'body'
    });

    this.render = function () {
        roundTimerRenderer.render(model.getRoundLength() - model.getCurrentRoundTime());

        spectatorListRenderer.render(model.getSpectators(), model.getLocalClientID());
        playerQueueRenderer.render(model.getAllQueuedPlayers(), model.getLocalClientID());

        var localQueued = model.hasQueuedPlayer(model.getLocalClientID());
        var localPlaying = model.hasPlayer(model.getLocalClientID());
        queueButtonRenderer.render(localQueued, localPlaying);

        powerupElectionRenderer.render(model);
        waitingForPlayersRenderer.render(model.gameStatus === EngineStatus.gameInitializing);

        var localUser = model.getPlayer(model.getLocalClientID());
        localUser = localUser || model.getSpectator(model.getLocalClientID());
        var localName = localUser ? localUser.client.name : null;
        landingPageRenderer.render(localName);
    };

    var setupHUD = function (){
        $(document).ready(function () {
            $('[data-toggle="drawer"]').click(function () {
                $('.drawer').toggleClass('active');
            });
        });
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
    setupHUD();
};


module.exports = HUD;