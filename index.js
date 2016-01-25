var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Animation frame polyfill - caps callbacks at ~62.5 fps (16ms interval).
(function() {
    var lastTime = 0;
    GLOBAL.window = {}
    GLOBAL.window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = setTimeout(function() {
            callback(currTime + timeToCall);
            }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
 
    GLOBAL.window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}());
var Physics = require('bower_components/PhysicsJS/dist/physicsjs-full.js');

app.use(express.static('bower_components'));
app.use(express.static('client'));
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + 'client/index.html');
});

Physics(function(world){

  // subscribe to ticker to advance the simulation
  Physics.util.ticker.on(function(time){
      world.step(time);
  });

  // start the ticker
  Physics.util.ticker.start();

});

server.listen(8080);
