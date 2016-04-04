var Physics = require('physicsjs');

/**
 * @param {Object} config
 * @property {Object} config.paddleEventsPublisher
 * @property {String} config.paddleMoveEvent
 * @property {Model} config.model
 * @constructor
 */
// SRS Requirement - 3.2.1.11 Player Client Input
// This class handles inserting client inputs into the game state
var PaddleBehavior = function (config) {


    Physics.behavior(PaddleBehavior.Name, function (parent) {

        var defaults = {
            // the element to monitor
            el: null,
            // time between move events
            moveThrottle: 10
        };

        return {
            // extended
            init: function (options) {

                var self = this;

                // call parent init method
                parent.init.call(this);
                this.options.defaults(defaults);
                this.options(options);

                // vars
                this.bodyData = {};
                this.bodyDataByUID = {};

                // when there are multiple touchdowns, move is called once
                self.move = Physics.util.throttle(function move(command) {
                    var body, data;

                    if (self._world) {

                        command.newCommands.forEach(function (cmd) {
                            data = self.bodyData[command.playerID];
                            if (data) {

                                body = data.body;

                                // wake the body up
                                body.sleep(false);
                                data.time = Physics.util.ticker.now();

                                data.oldPos.clone(data.pos);
                                data.pos.clone(config.model.getPlayer(command.playerID).paddle.getNewPosition(cmd.moveDelta));
                                config.model.getPlayer().lastSequenceNumberAccepted = cmd.sequenceNumber;

                            }
                        });
                    }

                }, self.options.moveThrottle);
            },

            /**
             *
             * @param {Player[]} arr
             */
            applyTo: function (arr) {
                var self = this;

                var body, data, paddle;
                arr.forEach(function (player) {
                    paddle = player.paddle;
                    body = paddle.body;

                    // fix the body in place
                    body.state.vel.zero();
                    body.state.angular.vel = 0;
                    body.isGrabbed = true;

                    // remember the currently grabbed bodies
                    data = self.bodyData[player.id] || {};
                    data.body = body;

                    // wake the body up
                    body.sleep(false);
                    data.time = Physics.util.ticker.now();

                    data.pos = body.state.pos.clone();

                    // init touchPointsOld here, too, so we don't have to do it in "move"
                    data.oldPos = body.state.pos.clone();

                    self.bodyData[player.id] = data;
                    self.bodyDataByUID[body.uid] = data;
                });
            },

            /**
             *
             * @param {Player[]} arr
             */
            unApplyTo: function (arr) {
                var self = this;

                var body, paddle;
                arr.forEach(function (player) {
                    paddle = player.paddle;
                    body = paddle.body;

                    body.isGrabbed = false;

                    delete self.bodyData[player.id];
                    delete self.bodyDataByUID[body.uid];
                });
            },

            // extended
            connect: function (world) {

                // subscribe the .behave() method to the position integration step
                world.on('integrate:positions', this.behave, this);

                // Subscribe to the comms commands events to get mouse moves
                config.paddleEventsPublisher.on(config.paddleMoveEvent, this.move);
            },

            // extended
            disconnect: function (world) {

                // unsubscribe when disconnected
                world.off('integrate:positions', this.behave, this);

            },

            // extended
            behave: function (data) {

                var self = this, state, dt = Math.max(data.dt, self.options.moveThrottle),body, d;

                // if we have one or more bodies grabbed, we need to move them to the new mouse/finger positions.
                // we'll do this by adjusting the velocity so they get there at the next step
                for (var touchId in self.bodyData) {
                    if (self.bodyData.hasOwnProperty(touchId)) {
                        d = self.bodyData[touchId];
                        body = d.body;
                        state = body.state;
                        state.vel.clone(d.pos).vsub(state.pos).mult(1 / dt);
                    }
                }
            }
        };
    });
};

PaddleBehavior.Name = 'PaddleBehavior';

module.exports = PaddleBehavior;
