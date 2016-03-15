var Logger = require('polyball/shared/Logger');
var FileServer = require('polyball/server/FileServer');
var Model = require('polyball/shared/Model');
var Comms = require('polyball/server/Comms');
//var Comms = require('polyball/server/Comms');


var server = new FileServer({
    staticDir: __dirname + '/../public',
    indexPath: 'index.html'
}).getHttpServer();

var model = new Model();

var comms = new Comms({httpServer: server, model: model});

setInterval(function () {
    comms.broadcastSnapshot({test: 'thing'});
}, 40);

Logger.info('Polyball server starting.');
server.listen(8080);
