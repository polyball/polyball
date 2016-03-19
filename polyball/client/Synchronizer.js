/**
 * Created by kdban on 3/18/2016.
 */

var Logger = require('polyball/shared/Logger');
var CommsEvents = require('polyball/shared/CommsEvents');

/**
 *
 * @param {Object} config
 * @property {Comms} comms - The client communications module to send and receive from.
 * @property {Model} model - The model to synchronize from incoming comms events.
 * @constructor
 */
var Synchronizer = function (config) {

    var comms = config.comms;
    var model = config.model;

    /**
     * @param {Object} snapshot - The server authoritative game state snapshot.
     * @property {Object} snapshot.arena - An Arena config.  See Arena constructor.
     */
    var synchronizeSnapshot = function (snapshot) {
        if (snapshot == null) {
            Logger.warn('Synchronizer#synchronizeSnapshot called with null snapshot.');
            return;
        }

        if (snapshot.arena != null) {
            model.addOrResetArena(snapshot.arena);
        }
    };

    comms.on(CommsEvents.ClientToClient.snapshotReceived, synchronizeSnapshot);


    this.tick = function (currentTime) {
        model.getWorld().step(currentTime);
    };
};


module.exports = Synchronizer;