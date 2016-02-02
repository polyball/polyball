var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static('bower_components'));
app.use(express.static('client'));
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + 'client/index.html');
});

server.listen(8080);
