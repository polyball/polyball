/**
 * Created by ryan on 23/03/16.
 */
var CommsEvents = require('polyball/shared/CommsEvents');
var PubSub = require('polyball/shared/PubSub');

var Comms = function(){

    var me = this;

    /**
     * For server side event subscribers, like the Engine.
     * @type {PubSub}
     */
    this.pubsub = new PubSub({
        events: CommsEvents.ServerToServer
    });

    /**
     * Register a callback with an event.
     * @param {String} eventName
     * @param {Function} callback
     */
    this.on = function (eventName, callback) {
        me.pubsub.on(eventName, callback);
    };

    this.fireJoinQueue = function(id){
        me.pubsub.fireEvent(CommsEvents.ServerToServer.newPlayerQueued, {spectatorID: id});
    };

    this.broadcastSnapshot = function () {};
    this.broadcastSynchronizedStart = function () {};
};

module.exports = Comms;