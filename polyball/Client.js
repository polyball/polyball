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
    var viewportBounds = Physics.aabb(0, 0, width, height);

    Logger.info('Width: ' + width + ' Height: ' + height);

    model.addOrResetArena({
        numberPlayers: 5,
        arenaRadius: height / 2

    });

    world.add([
        Physics.behavior('constant-acceleration'),
        Physics.behavior('body-impulse-response'),
        Physics.behavior('body-collision-detection'),
        Physics.behavior('sweep-prune'),
        Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds,
            restitution: 0,
            cof: 0.8
        })
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