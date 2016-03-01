var express = require('express');
var app = express();
var log4js = require('log4js');
var loggers = require('./shared/loggers');

var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(log4js.connectLogger(loggers.mainLogger));
app.use(express.static('bower_components'));
app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

loggers.mainLogger.info('Polyball server starting.');

server.listen(8080);
