var loggers = require('polyball/shared/loggers');
var FileServer = require('polyball/server/FileServer');
var socketWrapServer = require('socket.io');


var server = FileServer.getHttpServer();
var socketIO = socketWrapServer(server); // TODO wrap socket IO and replace this line with our Comms

loggers.mainLogger.info('Polyball server starting.');
server.listen(8080);
