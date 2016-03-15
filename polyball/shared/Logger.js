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
log4js.setGlobalLogLevel(process.env.PBALL_LOGLEVEL ? process.env.PBALL_LOGLEVEL : log4js.levels.INFO);


var mainLogger = log4js.getLogger();

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

module.exports.debug = debug;
module.exports.info  = info;
module.exports.warn  = warn;
module.exports.error = error;