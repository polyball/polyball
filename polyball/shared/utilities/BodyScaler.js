/**
 * Created by ryan on 24/05/16.
 */

/**
 * A utility to scale physical bodies with the number of players
 * @constructor
 */
var BodyScaler = function () {

};

/**
 * This function scales game object radii
 * @param original
 * @returns {number}
 */
BodyScaler.getScaledRadius = function (originalRadius, numberOfPlayers){
    var scaleFactor = numberOfPlayers < 6 ? numberOfPlayers : 6;
    return Math.floor(originalRadius / scaleFactor);
};


module.exports = BodyScaler;