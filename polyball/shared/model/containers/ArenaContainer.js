/**
 * Created by ryan on 17/05/16.
 */
var _ = require('lodash');
var IdGenerator = require('polyball/shared/utilities/IdGenerator');
var Arena = require('polyball/shared/model/Arena');

/**
 * Initializes the ArenaContainer
 * @property {Physics.world} config.world
 * @constructor
 */
var ArenaContainer = function(config) {
    var IdGen = new IdGenerator();
    var world = config.world;
    var arena;

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

        if (arena != null) {
            // clear out old arena
            world.remove(arena.getBumpers());
            world.remove(arena.getGoals());
        }

        arena = new Arena(newConfig);

        world.add(arena.getGoals());
        world.add(arena.getBumpers());

        return arena;
    };

    /**
     * @return {Arena} The current arena.
     */
    this.getArena = function () {
        return arena;
    };

    /**
     * True if there is an Arena in the model.
     * @param {Number} [id] - Optional. If present, hasArena() is true if the arena has the passed ID.
     * @returns {boolean}
     */
    this.hasArena = function (id) {
        if (arena == null) {
            return false;
        }

        if (id == null) {
            // arena known to exist, hasArena() is true
            return true;
        } else {
            // arena and id exists, hasArena(id) true if IDs are equal.
            return arena.getID() === id;
        }
    };

    /**
     * Gets the config for the enclosed Arena object
     * @returns {Object}
     */
    this.arenaConfig = function () {
        if (arena != null){
            return arena.toConfig();
        } else {
            return null;
        }
    };
};

module.exports = ArenaContainer;