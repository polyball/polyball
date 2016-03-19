var $ = require('jquery');
var Logger = require('polyball/shared/Logger');
var Physics = require('physicsjs');
var Model = require('polyball/shared/Model');
var GameRenderer = require('polyball/client/GameRenderer');
var Comms = require('polyball/client/Comms');
var Synchronizer = require('polyball/client/Synchronizer');

$(document).ready(function() {

    var model = new Model();

    var gameRenderer = new GameRenderer({
        model: model
    });

    var width = window.innerWidth,
        height = window.innerHeight;

    Logger.info('Width: ' + width + ' Height: ' + height);

    gameRenderer.resize(width - 25, height - 25);

    var comms = new Comms({
        serverAddress: "http://localhost:8080"
    });

    var synchronizer = new Synchronizer({
        comms: comms,
        model: model
    });

    Physics.util.ticker.on(function( time ) {
        gameRenderer.render();
        synchronizer.tick(time);
    });


}); // end on DOM ready