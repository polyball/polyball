var $ = require('jquery');
var io = require('socket.io-client');
var Logger = require('polyball/shared/Logger');
var Physics = require('physicsjs');
//var Model = require('polyball/shared/Model');
var Pixi = require('pixi.js');

$(document).ready(function() {


    // scale relative to window width
    function S( n ){
        return n * window.innerWidth / 600;
    }

    Physics(function(world) {
        var width = window.innerWidth,
            height = window.innerHeight,
            renderer;
        var viewportBounds = Physics.aabb(0, 0, width, height);

        // let's use the pixi renderer
        window.PIXI = Pixi;
        // create a renderer
        renderer = Physics.renderer('pixi', {
            el: 'viewport'
        });

        // add the renderer
        world.add(renderer);
        // render on each step
        world.on('step', function () {
            world.render();
        });
        // add the interaction
        world.add(Physics.behavior('interactive', { el: renderer.container }));

        // some fun colors
        var colors = {
            blue: '0x1d6b98',
            blueDark: '0x14546f',
            red: '0xdc322f',
            darkRed: '0xa42222'
        };

        // create 200 circles placed randomly
        var l = 100;
        var circles = [];
        while( l-- ){
            circles.push(Physics.body('circle', {
                x: Math.random() * width,
                y: Math.random() * height,
                radius: S(10),
                mass: 1,
                restitution: 0.5,
                styles: {
                    strokeStyle: colors.darkBlue,
                    fillStyle: colors.blue,
                    lineWidth: 1
                }
            }));
        }

        world.add(circles);

        world.add([
            Physics.behavior('constant-acceleration'),
            Physics.behavior('body-impulse-response'),
            Physics.behavior('body-collision-detection'),
            Physics.behavior('sweep-prune'),
            Physics.behavior('edge-collision-detection', {
                aabb: viewportBounds,
                restitution: 0,
                cof: 0.8
            })
        ]);

        Physics.util.ticker.on(function( time ) {
            world.step( time );
        });
    });

    var socket = io.connect('http://localhost:8080');

    socket.on('logLevel', function (logLevel) {
        var newLevel = Logger.setLevel(logLevel);
        Logger.info('Log level set: ' + newLevel);
    });

    socket.on('snapshot', function (snapshot) {
        Logger.debug(snapshot);
    });

}); // end on DOM ready