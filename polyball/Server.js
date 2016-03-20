var Logger = require('polyball/shared/Logger');
var FileServer = require('polyball/server/FileServer');
var Model = require('polyball/shared/Model');
var Comms = require('polyball/server/Comms');
var Util = require('polyball/shared/Util');


var server = new FileServer({
    staticDir: __dirname + '/../public',
    indexPath: 'index.html'
}).getHttpServer();

var model = new Model();

var comms = new Comms({httpServer: server, model: model});

// TODO deleteme start

model.addOrResetArena({
    numberPlayers: Util.getRandomInt(3, 10),
    arenaRadius: 300,
    bumperRadius: 35,
    marginX: 60,
    marginY: 60
});

setInterval(function () {
    comms.broadcastSnapshot(model.getSnapshot());
}, 40);

setInterval(function () {
    model.addBall({
        radius: 10
    });
}, 100);

setInterval(function () {
    model.addOrResetArena({
        numberPlayers: Util.getRandomInt(3, 10),
        arenaRadius: 300,
        bumperRadius: 35,
        marginX: 60,
        marginY: 60
    });

    model.clearBalls();
}, 6000);

// TODO deleteme end

Logger.info('Polyball server starting.');
server.listen(8080);
