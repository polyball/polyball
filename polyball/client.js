var Physics = require('physicsjs');
var TWEEN = require('tween');
var logger = require('polyball/shared/loggers').mainLogger;

var PIXI = require('pixi');

/// /
// PhysicsJS
// A modular, extendable, and easy-to-use physics engine for javascript
//
// Use the select box in the top right to see more examples!
//
Physics(function (world) {

    // bounds of the window
    var viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight)
    ,width = window.innerWidth
    ,height = window.innerHeight
    ,renderer
    ;

    logger.info("width: " + width);
    logger.info("height: " + height);

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

    // scale relative to window width
    function S( n ){
        return n * window.innerWidth / 600;
    }

    // create the zero
    var zero = Physics.body('compound', {
        x: width/2 - S(80)
        ,y: height/2
        ,treatment: 'static'
        ,styles: {
            fillStyle: colors.red
            ,lineWidth: 1
            ,strokeStyle: colors.darkRed
            ,alpha: 0.0001 //pixi bug
        }
        ,children: [
        // coords of children are relative to the compound center of mass
        Physics.body('rectangle', {
            x: S(-50)
            ,y: 0
            ,width: S(20)
            ,height: S(97)
            ,mass: 20
        })
        ,Physics.body('rectangle', {
            x: S(50)
            ,y: 0
            ,width: S(20)
            ,height: S(97)
            ,mass: 20
        })
        ,Physics.body('rectangle', {
            x: 0
            ,y: S(75)
            ,width: S(48)
            ,height: S(20)
            ,mass: 20
        })
        ,Physics.body('rectangle', {
            x: -S(35)
            ,y: S(60)
            ,angle: Math.PI / 4
            ,width: S(50)
            ,height: S(20)
            ,mass: 20
        })
        ,Physics.body('rectangle', {
            x: S(35)
            ,y: S(60)
            ,angle: -Math.PI / 4
            ,width: S(50)
            ,height: S(20)
            ,mass: 20
        })
        ,Physics.body('rectangle', {
            x: 0
            ,y: S(-75)
            ,width: S(48)
            ,height: S(20)
            ,mass: 20
        })
        ,Physics.body('rectangle', {
            x: -S(35)
            ,y: -S(60)
            ,angle: -Math.PI / 4
            ,width: S(50)
            ,height: S(20)
            ,mass: 20
        })
        ,Physics.body('rectangle', {
            x: S(35)
            ,y: -S(60)
            ,angle: Math.PI / 4
            ,width: S(50)
            ,height: S(20)
            ,mass: 20
        })
        ]
    });

    // the point...
    var point = Physics.body('circle', {
        x: width/2 + S(6)
        ,y: height/2 + S(76)
        ,radius: S(13)
        ,treatment: 'static'
        ,styles: {
            fillStyle: colors.red
            ,lineWidth: 1
            ,strokeStyle: colors.darkRed
            ,alpha: 0.0001 //pixi bug
            ,mass: 80
        }
    });

    // the seven...
    var seven = Physics.body('compound', {
        x: width/2 + S(86)
        ,y: height/2 - S(34)
        ,treatment: 'static'
        ,styles: {
            fillStyle: colors.red
            ,lineWidth: 1
            ,strokeStyle: colors.darkRed
            ,alpha: 0.0001 //pixi bug
        }
        ,children: [
        Physics.body('rectangle', {
            x: S(35)
            ,y: -S(80)
            ,width: S(114)
            ,height: S(24)
            ,mass: 40
        })
        ,Physics.body('rectangle', {
            x: S(51.5)
            ,y: S(2.5)
            ,angle: -70 * Math.PI/180
            ,width: S(160)
            ,height: S(28)
            ,mass: 40
        })
        ]
    });

    // create 200 circles placed randomly
    var l = 100;
    var circles = [];
    while( l-- ){
        circles.push(Physics.body('circle', {
            x: Math.random() * width
            ,y: Math.random() * height
            ,radius: S(10)
            ,mass: 1
            ,restitution: 0.5
            ,styles: {
                strokeStyle: colors.darkBlue
                ,fillStyle: colors.blue
                ,lineWidth: 1
            }
        }));
    }

    world.add(circles);

    // add things to the world
    world.add([
    zero
    ,point
    ,seven
    ]);

    // when circles fall past the bottom. reset them
    function wrapY(){
        var b
        ,i
        ,l
        ,h = height + 100
        ,w =  width /2
        ,x = w
        ;

        for( i = 0, l = circles.length; i < l; i++){
            b = circles[i];
            if ( b.state.pos.y > height ){
                b.state.pos.y -= h;
                b.state.pos.x = x + w * (2 * Math.random() - 1);
                b.state.vel.zero();
            }
        }
    }

    world.on('step', wrapY);

    // slowly fade in the numbers
    function fadeIn(){
        zero.view.alpha = 0;
        seven.view.alpha = 0;

        new TWEEN.Tween( { alpha: 0 } )
        .to( { alpha: 1 }, 1000 )
        .onUpdate( function () {
            zero.view.alpha = this.alpha;
            point.view.alpha = this.alpha;
            seven.view.alpha = this.alpha;
        } )
        .start()
        ;
    }

    world.one('render', function(){
        // set the alpha on children to 1
        function setAlpha(c){
            c.alpha = 1;
        }
        zero.view.children.forEach(setAlpha);
        seven.view.children.forEach(setAlpha);
        zero.view.alpha = 0;
        seven.view.alpha = 0;

        // fade in after 2 seconds
        setTimeout(fadeIn, 3000);
    });

    // after 10 seconds to some more fun
    setTimeout(function(){
        // constrain objects to these bounds
        var edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds
            ,restitution: 0
            ,cof: 0.8
        });

        world.add( edgeBounce );

        // "detach" the 0.7
        zero.treatment = point.treatment = seven.treatment = 'dynamic';
        // wake up sleeping bodies
        world.wakeUpAll();
        world.off('step', wrapY);
    }, 10000)

    // add behaviors
    world.add([
    Physics.behavior('constant-acceleration')
    ,Physics.behavior('body-impulse-response')
    ,Physics.behavior('body-collision-detection')
    ,Physics.behavior('sweep-prune')
    ]);

        // only start the sim when tweening engine is ready

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        TWEEN.update();
        world.step( time );
    });
});
