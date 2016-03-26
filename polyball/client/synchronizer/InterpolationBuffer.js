/**
 * Created by kdban on 3/26/2016.
 */


/**
 * Stores three interpolation frames in a buffer of length 3.
 *
 * @constructor
 */
var InterpolationBuffer = function () {

    /**
     * Initialized to null.  The most recent element is at index 2, the oldest at index 0.
     * @type {Object[]}
     */
    var buffer = [null, null, null];

    /**
     *
     * @param {Object} newFrame
     * @property {Number} receivedTime - The time in millis that the frame was received.
     * @property {Object[]} playerStates - An array of Player configs.
     */
    this.addNewFrame = function (newFrame) {
        buffer.push(newFrame);
        buffer.shift();
    };

    /**
     * Get the most recently added frame.  Will be null if no frames are added yet.
     * @returns {Object} - see addNewFrame parameter.
     */
    this.getMostRecentFrame = function () {
        return buffer[2];
    };
};


module.exports = InterpolationBuffer;