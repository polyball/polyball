/**
 * Created by kdban on 3/6/2016.
 */

var expressLogger = require('log4js').connectLogger;
var express = require('express');
var http = require('http');

var loggers = require('polyball/shared/loggers');

var app = express();
app.use(expressLogger(loggers.mainLogger));
app.use(express.static('public'));
app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

exports.getHttpServer = function () {
    return http.createServer(app)
};