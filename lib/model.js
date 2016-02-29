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
Physics(function(world){

  // subscribe to ticker to advance the simulation
  Physics.util.ticker.on(function(time){
      world.step(time);
  });

  // start the ticker
  Physics.util.ticker.start();

});


