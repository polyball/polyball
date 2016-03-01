/**
 * Created by kdban on 2/27/2016.
 *
 * Wraps the log4js logging library.  Here we can configure it to our liking for use everywhere within polyball.
 *
 * Default log level is INFO.  Otherwise log level is read from environment PBALL_LOGLEVEL.
 */

var log4js = require('log4js');
log4js.setGlobalLogLevel(process.env.PBALL_LOGLEVEL ? process.env.PBALL_LOGLEVEL : log4js.levels.INFO);

var mainLogger = log4js.getLogger();

exports.mainLogger = mainLogger;