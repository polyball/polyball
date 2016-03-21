/**
 * Created by kdban on 3/10/2016.
 */
var fs = require('fs');
var Logger = require('polyball/shared/Logger');

var Util = function(){

};
/**
 * Adjectives 10 characters or less.
 * @type {string[]}
 */
var adjectives = [
    "electrical",
    "relevant",
    "nice",
    "scared",
    "existing",
    "alive",
    "visible",
    "nervous",
    "decent",
    "realistic",
    "unhappy",
    "asleep",
    "dangerous",
    "conscious",
    "latter",
    "unlikely",
    "huge",
    "immediate",
    "severe",
    "unable",
    "typical",
    "hungry",
    "large",
    "lucky",
    "old",
    "recent",
    "pleasant",
    "lonely",
    "guilty",
    "sorry",
    "capable",
    "united",
    "hot",
    "useful",
    "tall",
    "automatic",
    "desperate",
    "known",
    "obviously",
    "healthy",
    "available",
    "popular",
    "able",
    "numerous",
    "expensive",
    "helpful",
    "careful",
    "unusual",
    "critical",
    "anxious",
    "every",
    "southern",
    "dramatic",
    "poor",
    "several",
    "terrible",
    "former",
    "emotional",
    "odd",
    "various",
    "distinct",
    "happy",
    "powerful",
    "similar",
    "logical",
    "basic",
    "tiny",
    "mental",
    "efficient",
    "massive",
    "cultural",
    "global",
    "cute",
    "pure",
    "strong",
    "medical",
    "inner",
    "technical",
    "boring",
    "aware",
    "obvious",
    "sexual",
    "civil",
    "suitable"
];

/**
 * Nouns 10 characters or less.
 * @type {string[]}
 */
var nouns = [
    "minister",
    "dock",
    "skate",
    "skirt",
    "produce",
    "zephyr",
    "science",
    "space",
    "needle",
    "base",
    "glove",
    "bubble",
    "hate",
    "horse",
    "soup",
    "desire",
    "cattle",
    "control",
    "corn",
    "popcorn",
    "muscle",
    "eggs",
    "nest",
    "plate",
    "squirrel",
    "string",
    "book",
    "parcel",
    "wheel",
    "join",
    "eye",
    "back",
    "substance",
    "step",
    "zipper",
    "drawer",
    "ring",
    "hospital",
    "badge",
    "picture",
    "sky",
    "cream",
    "baseball",
    "edge",
    "self",
    "sugar",
    "silver",
    "wine",
    "ants",
    "thrill",
    "rhythm",
    "man",
    "motion",
    "rock",
    "spring",
    "burst",
    "earth",
    "crow",
    "floor",
    "hill",
    "swing",
    "flesh",
    "bucket",
    "duck",
    "mind",
    "wrist",
    "kittens",
    "fireman",
    "window",
    "curtain",
    "current",
    "basketball",
    "fire",
    "place",
    "creature",
    "crib",
    "taste",
    "wall",
    "front",
    "invention",
    "honey",
    "team",
    "road",
    "work",
    "ear",
    "airport",
    "bottle",
    "land",
    "turn",
    "agreement",
    "teeth",
    "mice",
    "digestion",
    "art",
    "street"
];

var capitalizeFirstLetter = function (str) {
    if (str.length === 0) {
        return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * @returns {string} A random username less than 20 characters long.
 */
Util.randomUsername = function () {
    var adjIdx = Math.floor(Math.random() * adjectives.length);
    var nounIdx = Math.floor(Math.random() * nouns.length);

    var adjective = adjectives[adjIdx];
    var noun = nouns[nounIdx];

    return capitalizeFirstLetter(adjective) + capitalizeFirstLetter(noun);
};

/**
 * @param {Object} config
 * @returns {string} The file path of the config file.
 */
Util.createJSONConfigFile = function (config){
    var path = './config-' + Util.randomUsername();
    fs.writeFileSync(path, JSON.stringify(config), 'utf-8');
    return path;
};

/**
 * @param {String} string
 * @returns {string} The file path of the config file.
 */
Util.createConfigFile = function (string){
    var path = './config-' + Util.randomUsername();
    fs.writeFileSync(path, string, 'utf-8');
    return path;
};

/**
 * @param {String} path
 */
Util.deleteJSONConfigFile = function (path){
    fs.unlink(path);
};

/**
 * A helper function to expand an array of configs into their fully instantiated form
 * @param {Object[]} array
 * @param {Object[]} config
 * @param {function} constructor
 */
Util.expandArray = function (array, config, constructor){
    if (config != null){
        config.forEach(function(x) {
            array.push(new constructor(x));
        });
    }
};

/**
 * A helper function to turn an array of model objects into their config counterparts
 * @param {Object[]} array
 */
Util.arrayToConfig = function (array){
    var configs = [];
    array.forEach(function(elm){
        configs.push(elm.toConfig());
    });
    return configs;
};

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 * From http://stackoverflow.com/a/1527820/3367144, Ionuț G. Stan
 */
Util.getRandomArbitrary = function (min, max) {
    return Math.random() * (max - min) + min;
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 * From http://stackoverflow.com/a/1527820/3367144, Ionuț G. Stan
 */
Util.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Get a copy of a physics body's state in serializable form.
 * @param {Physics.body} physicsBody
 Number @returns {{pos: {x: Number, y: Number}, vel: {x: Number, y: Number}, acc: {x: Number, y: Number}, angular: {pos: Number, vel: Number, acc: Number}, old: {pos: {x: Number, y: Number}, vel: {x: Number, y: Number}, acc: {x: Number, y: Number}, angular: {pos: Number, vel: Number, acc: Number}}}}
 */
Util.bodyToStateConfig = function (physicsBody) {
    
    if (physicsBody.state != null) {
        return {
            pos: {
                x: physicsBody.state.pos.x,
                y: physicsBody.state.pos.y
            },
            vel: {
                x: physicsBody.state.vel.x,
                y: physicsBody.state.vel.y
            },
            acc: {
                x: physicsBody.state.acc.x,
                y: physicsBody.state.acc.y
            },
            angular: {
                pos: physicsBody.state.angular.pos,
                vel: physicsBody.state.angular.vel,
                acc: physicsBody.state.angular.acc
            }, 
            old: {
                pos: {
                    x: physicsBody.state.old.pos.x,
                    y: physicsBody.state.old.pos.y
                },
                vel: {
                    x: physicsBody.state.old.vel.x,
                    y: physicsBody.state.old.vel.y
                },
                acc: {
                    x: physicsBody.state.old.acc.x,
                    y: physicsBody.state.old.acc.y
                },
                angular: {
                    pos: physicsBody.state.old.angular.pos,
                    vel: physicsBody.state.old.angular.vel,
                    acc: physicsBody.state.old.angular.acc
                }
            }
        };
    } else {
        Logger.warn('Unrecognized object passed to Util#bodyToPhysicsState');
    }
};

module.exports = Util;