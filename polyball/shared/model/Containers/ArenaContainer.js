/**
 * Created by ryan on 17/05/16.
 */
var _ = require('lodash');
var IdGenerator = require('polyball/shared/utilities/IdGenerator');
var Arena = require('polyball/shared/model/Arena');

/**
 * Initializes the ArenaContainer
 * @property {Model} config.model
 * @property {Physics.world} config.world
 * @constructor
 */
var ArenaContainer = function(config) {
    var IdGen = new IdGenerator();
    var model = config.model;
    var world = config.world;

    /**
     * If there is not yet an arena in the model, add one according to the config.
     * If there is an arena in the model, replace it with a new one from the config.
     * @param {Object} config (See Arena constructor.)
     * @property {Number} [config.id] - Optional.  Should not be passed on the server, should always be passed on the client.
     * @return {Arena} The new arena
     */
    this.addOrResetArena = function (config) {

        var newConfig = {
            id: config.id ? config.id : IdGen.nextID()
        };

        _.assign(newConfig, config);

        if (model.arena != null) {
            // clear out old arena
            world.remove(model.arena.getBumpers());
            world.remove(model.arena.getGoals());
        }

        model.arena = new Arena(newConfig);

        world.add(model.arena.getGoals());
        world.add(model.arena.getBumpers());

        return model.arena;
    };

    /**
     * @return {Arena} The current arena.
     */
    this.getArena = function () {
        return model.arena;
    };

    /**
     * True if there is an Arena in the model.
     * @param {Number} [id] - Optional. If present, hasArena() is true if the arena has the passed ID.
     * @returns {boolean}
     */
    this.hasArena = function (id) {
        if (model.arena == null) {
            return false;
        }

        if (id == null) {
            // arena known to exist, hasArena() is true
            return true;
        } else {
            // arena and id exists, hasArena(id) true if IDs are equal.
            return model.arena.getID() === id;
        }
    };
};

module.exports = ArenaContainer;