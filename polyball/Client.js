var $ = require('jquery');
var io = require('socket.io-client');
var Logger = require('polyball/shared/Logger');
var Physics = require('physicsjs');
var Model = require('polyball/shared/Model');
var GameRenderer = require('polyball/client/GameRenderer');

$(document).ready(function() {

    var model = new Model();

    var world = model.getWorld();

    var gameRenderer = new GameRenderer({
        model: model
    });

    var width = window.innerWidth,
        height = window.innerHeight;

    Logger.info('Width: ' + width + ' Height: ' + height);

    gameRenderer.resize(width - 25, height - 25);

    var bumperRadius = 35;
    var arenaRadius = height / 2 - 4 * bumperRadius;
    var marginX = width / 2 - arenaRadius;
    var marginY = 2 * bumperRadius;

    model.addOrResetArena({
        numberPlayers: 10,
        arenaRadius: arenaRadius,
        bumperRadius: bumperRadius,
        marginX: marginX,
        marginY: marginY
    });

    model.addBall();

    world.add([
        Physics.behavior('body-impulse-response'),
        Physics.behavior('body-collision-detection'),
        Physics.behavior('sweep-prune')
    ]);

    Physics.util.ticker.on(function( time ) {
        world.step( time );
        gameRenderer.render();
    });

    var socket = io.connect('http://localhost:8080');

    socket.on('logLevel', function (logLevel) {
        var newLevel = Logger.setLevel(logLevel);
        Logger.info('Log level set: ' + newLevel);
    });

    socket.on('snapshot', function (snapshot) {
        Logger.debug(snapshot);
    });

}); // end on DOM ready