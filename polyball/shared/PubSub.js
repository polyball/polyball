/**
 * Created by kdban on 3/18/2016.
 */

var lodash = require('lodash');
var Logger = require('polyball/shared/Logger');

/**
 * A publish subscribe module that is constructed with the events it will publish.
 * @param {Object} config
 * @property {Object.<string, string|number>} events - An object mapping the events to their identifiers.
 * @constructor
 */
var PubSub = function (config) {

    var events = config.events;

    /**
     * Create an new event subscriber object from CommsEvents.ServerToServer.
     * @returns {Object<string, function>}  Map from event strings to arrays of callbacks.
     */
    var buildEventSubscribers = function () {
        var eventStrings = lodash.map(Object.keys(events), function (key) {
            return events[key];
        });

        var eventSubscribers = {};
        eventStrings.forEach(function (eventString) {
            eventSubscribers[eventString] = [];
        });

        return eventSubscribers;
    };

    /**
     * Object mapping event identifiers to
     * @type {Object.<string|number, Function[]>}
     */
    var eventSubscribers = buildEventSubscribers();

    /**
     * Fire an event by name with a parameters object.
     * @param {String} eventName
     * @param {Object} params
     */
    this.fireEvent = function (eventName, params) {
        if (eventSubscribers[eventName] == null || eventSubscribers[eventName].forEach == null) {
            Logger.warn('Comms#fire called with unrecognized event: ' + eventName);
            Logger.warn('Recognized Events: ' + Object.keys(eventSubscribers));

            return;
        }

        eventSubscribers[eventName].forEach(function (callback) {
            callback(params);
        });
    };

    /**
     * Register a callback with an event.
     * @param {String} eventName
     * @param {Function} callback
     */
    this.on = function (eventName, callback) {
        if (eventSubscribers[eventName] == null) {
            Logger.warn('PubSub#on called with unrecognized event: ' + eventName);
            Logger.warn('Recognized Events: ' + Object.keys(eventSubscribers));

            return;
        }

        eventSubscribers[eventName].push(callback);
    };

};


module.exports = PubSub;