/**
 * Created by ryan on 17/05/16.
 */
var RoundTimingContainer = function () {
    /**
     * The number of milliseconds in the current round.
     * @type {Number}
     */
    var roundLength;

    /**
     * The number of milliseconds elapsed in the current round.
     * @type {Number}
     */
    var currentRoundTime;


    /**
     * The round length in milliseconds.
     * @returns {Number}
     */
    this.getRoundLength = function () {
        return roundLength;
    };

    /**
     * Set the round length in milliseconds.
     * @param newRoundLength
     */
    this.setRoundLength = function (newRoundLength) {
        roundLength = newRoundLength;
    };

    /**
     * The current time elapsed in the round.
     * @returns {Number}
     */
    this.getCurrentRoundTime = function () {
        return currentRoundTime;
    };

    /**
     * Set the current round elapsed time.
     * @param newCurrentTime
     */
    this.setCurrentRoundTime = function (newCurrentTime) {
        currentRoundTime = newCurrentTime;
    };
};

module.exports = RoundTimingContainer;