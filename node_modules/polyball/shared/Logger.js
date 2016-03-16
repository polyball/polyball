/**
 * Created by kdban on 2/27/2016.
 *
 * Wraps the log4js logging library.  Here we can configure it to our liking for use everywhere within polyball.
 *
 * Log levels are:
 *
 * - DEBUG
 * - INFO   <-- Default.
 * - WARN
 * - ERROR
 *
 * Log level is read from environment PBALL_LOGLEVEL.
 */

var log4js = require('log4js');
log4js.setGlobalLogLevel();


var mainLogger, logLevel;


/**
 * @param {String} level Either 'DEBUG', 'INFO', 'WARN', or 'ERROR'
 * @return {String} The new log level.
 */
var setLevel = function (level) {
    if (level !== 'DEBUG' && level !== 'INFO' && level !== 'WARN' && level !== 'ERROR') {
        warn('Cannot set log level to ' + level + ', setting to INFO');
        setLevel('INFO');
    }
    log4js.setGlobalLogLevel(level);
    return level;
};

/**
 * @return {String} Either 'DEBUG', 'INFO', 'WARN', or 'ERROR'
 */
var getLevel = function () {
    return logLevel;
};

/**
 * @memberof Logger
 * @param {String} message
 */
var debug = function (message) { mainLogger.debug(message); };
/**
 * @memberof Logger
 * @param {String} message
 */
var info  = function (message) { mainLogger.info(message); };
/**
 * @memberof Logger
 * @param {String} message
 */
var warn  = function (message) { mainLogger.warn(message); };
/**
 * @memberof Logger
 * @param {String} message
 */
var error = function (message) { mainLogger.error(message); };


mainLogger = log4js.getLogger();
logLevel = setLevel(process.env.PBALL_LOGLEVEL ? process.env.PBALL_LOGLEVEL : 'INFO');

module.exports.setLevel = setLevel;
module.exports.getLevel = getLevel;
module.exports.debug = debug;
module.exports.info  = info;
module.exports.warn  = warn;
module.exports.error = error;