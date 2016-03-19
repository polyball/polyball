/**
 * Created by kdban on 3/10/2016.
 */
var fs = require('fs');

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
 * @Param {function} constructor
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

module.exports = Util;