var Logger = require('polyball/shared/Logger');
var FileServer = require('polyball/server/FileServer');
var Model = require('polyball/shared/Model');
var Comms = require('polyball/server/Comms');
var Util = require('polyball/shared/Util'); //jshint ignore:line
var Engine = require('polyball/server/Engine');
var Configuration = require('polyball/server/configuration/Configuration');

var server = new FileServer({
    staticDir: __dirname + '/../public',
    indexPath: 'index.html'
}).getHttpServer();

var config = new Configuration();

var model = new Model();

var comms = new Comms({
    httpServer: server,
    model: model,
    globalConfig: config.values
});

new Engine({
    comms: comms,
    configuration: config.values,
    model: model
});



// TODO deleteme start

//model.addOrResetArena({
//    numberPlayers: Util.getRandomInt(3, 10),
//    arenaRadius: 300,
//    bumperRadius: 35,
//    marginX: 60,
//    marginY: 60
//});
//
//setInterval(function () {
//    comms.broadcastSnapshot(model.getSnapshot());
//}, 40);
//
//setInterval(function () {
//    model.addBall({
//        body: {
//            radius: 10,
//            state: model.generateNewBallState()
//        }
//    });
//}, 500);
//
//setInterval(function () {
//    model.clearBalls();
//    model.addOrResetArena({
//        numberPlayers: Util.getRandomInt(3, 10),
//        arenaRadius: 300,
//        bumperRadius: 35,
//        marginX: 60,
//        marginY: 60
//    });
//
//    comms.broadcastSynchronizedStart({
//        snapshot: model.getSnapshot(),
//        minimumDelay: 0
//    });
//}, 8000);
//
//setInterval(function () {
//    model.getWorld().step(Date.now());
//}, 20);

// TODO deleteme end

Logger.info('Polyball server starting.');
server.listen(8080);
