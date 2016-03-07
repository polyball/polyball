var loggers = require('polyball/shared/loggers');
var FileServer = require('polyball/server/FileServer');
var socketWrapServer = require('socket.io');


var server = new FileServer({staticDir: 'public', indexPath: 'public/index.html'}).getHttpServer();

//TODO wrap socket IO and replace this line with our Comms
var socketIO = socketWrapServer(server);

loggers.mainLogger.info('Polyball server starting.');
server.listen(8080);
