/**
 * Created by ryan on 16/05/16.
 */
var _ = require('lodash');
var Logger = require('polyball/shared/Logger');

var ArrayHelper = function () {

};

/**
 * Search an array for an element by its id.
 * @template T
 * @param {T[]} array The array to search
 * @param {Number} id The id of the desired element (in field `element.id`)
 * @returns {T} The identified array element (or undefined).
 */
this.prototype.findByID = function (array, id) {
    return _.find(array, function (element) { return element.id === id; });
};

/**
 * Search an array for an element by its id or by an arbitrary callback.
 * @template T
 * @param {T[]} array The array to search
 * @param {Number|Predicate} id The id or a callback identifying the desired element.
 * @returns {T} The identified array element (or undefined).
 */
this.prototype.findSingle = function (array, id) {
    if (typeof id === 'number') {
        return this.prototype.findByID(array, id);
    } else {
        return _.find(array, id);
    }
};

/**
 * Search an array and get all elements by a given predicate.
 * @template T
 * @param {T[]} array The array to search
 * @param {Predicate} [predicate] The boolean-returning predicate callback to filter by.
 * @returns {T[]} All elements of the array matching the predicate
 */
this.prototype.findAll = function (array, predicate) {
    if (predicate == null) {
        return Array.apply(undefined, array);
    }
    return _.filter(array, predicate);
};

/**
 * Remove element from array by its id.
 * @template T
 * @param {Array} array The array to search
 * @param {Number} id The id of the desired element (in field `element.id`)
 * @return {T} The removed object, null if not found.
 */
this.prototype.removeByID = function (array, id) {
    var removed = _.remove(array, function (element) { return element.id === id; });
    if (removed.length > 1) {
        Logger.error("More than one object of id " + id + " found in array " + array);
    }

    return removed[0];
};

module.exports = ArrayHelper;