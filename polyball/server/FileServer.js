'use strict';

/**
 * Created by kdban on 3/6/2016.
 */

var log4js = require('log4js');
var express = require('express');
var http = require('http');

var loggers = require('polyball/shared/loggers');

/**
 * Serves files from a directory.
 *
 * @param {{staticDir: string}} spec
 * @constructor
 */
function FileServer(spec) {
    var app = express();
    app.use(log4js.connectLogger(loggers));

    app.use(express.static(spec.staticDir));

    this.app = app;
}

/**
 * @return {node.http.Server} A new http server that will serve FileServer's static files.
 */
FileServer.prototype.getHttpServer = function () {
    return http.createServer(this.app);
};

module.exports = FileServer;