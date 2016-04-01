var $ = require('jquery');
var Logger = require('polyball/shared/Logger');
var Physics = require('physicsjs');
var Model = require('polyball/shared/Model');
var GameRenderer = require('polyball/client/GameRenderer');
var HUD = require('polyball/client/HUD');
var Comms = require('polyball/client/Comms');
var Synchronizer = require('polyball/client/Synchronizer');

$(document).ready(function() {

    var model = new Model();

    var comms = new Comms({
        serverAddress: window.location.href,
        newIDCallback: function (id) { model.setLocalClientID(id); }
    });

    Logger.info('Requesting configuration from ' + window.location.href);

    comms.requestInitialConfig(function (config) {
        Logger.info('Config received:');
        Logger.debug(config);

        var gameRenderer = GameRenderer.createNew({
            model: model,
            el: 'viewport'
        });

        var dim = Math.min(window.innerHeight, window.innerWidth);
        var width = dim;
        var height = dim;

        Logger.info('Width: ' + width + ' Height: ' + height);

        gameRenderer.resize(width - 25, height - 25);
        gameRenderer.forceFontLoad();
        gameRenderer.renderParticles();

        window.onresize = function () {
            dim = Math.min(window.innerHeight, window.innerWidth);
            width = dim;
            height = dim;

            Logger.info('Width: ' + width + ' Height: ' + height);
            gameRenderer.resize(width - 25, height - 25);
        };

        var synchronizer = new Synchronizer({
            comms: comms,
            model: model,
            commandAggregationInterval: config.commandAggregationInterval,
            simulationSyncLargeDelta: config.simulationSyncLargeDelta,
            simulationSyncRapidDecayRate: config.simulationSyncRapidDecayRate,
            simulationSyncSlowDecayRate: config.simulationSyncSlowDecayRate
        });

        var hud = new HUD({ //jshint ignore: line
            comms: comms,
            synchronizer: synchronizer,
            accumulationInterval: config.inputAccumulationInterval
        });

        Physics.util.ticker.on(function (time) {
            gameRenderer.renderGame();
            synchronizer.tick(time);
        });

    });

}); // end on DOM ready
