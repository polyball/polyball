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

Logger.info('Polyball server starting.');
server.listen(8080);
