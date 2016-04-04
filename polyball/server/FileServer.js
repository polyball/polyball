'use strict';

/**
 * Created by kdban on 3/6/2016.
 */

var log4js = require('log4js');
var express = require('express');
var http = require('http');

/**
 * Serves files from a directory.
 *
 * @param {{staticDir: string, indexFile: string}} spec
 * @constructor
 */
// SRS Requirement - 3.2.1.5 Client Application Service
// This class handles serving all static files to clients who connect.
function FileServer(spec) {
    var app = express();
    app.use(log4js.connectLogger(log4js.getDefaultLogger()));

    app.use(express.static(spec.staticDir, {index: spec.indexFile}));

    this.app = app;
}

/**
 * @return {node.http.Server} A new http server that will serve FileServer's static files.
 */
FileServer.prototype.getHttpServer = function () {
    return http.createServer(this.app);
};

module.exports = FileServer;