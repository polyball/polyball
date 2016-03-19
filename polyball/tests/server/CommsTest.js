/**
 * Created by kdbanman on 2016-03-15.
 */
var should = require('should'); //jshint ignore:line
var mLog = require('mocha-logger');
var Promise = require('promise');

var ioClient = require('socket.io-client');
var http = require('http');

var Comms = require('polyball/server/Comms');
var CommsEvents = require('polyball/shared/CommsEvents');
var Model = require('polyball/shared/Model');
var Vote = require('polyball/shared/model/Vote');


describe('Server Comms', function() {
    "use strict";

    var IO_URL = 'http://localhost:39522';
    var IO_OPTS ={
        transports: ['websocket'],
        'forceNew': true
    };

    // NOTE: REMEMBER TO CLOSE CLIENTS, SOCKETS, SERVERS, ETC IF YOU WANT THE
    //       TEST PROCESS TO TERMINATE.
    var server, serverSockets, model, comms, client1;

    before(function (done) {
        mLog.log('Comms test server started on port 39522');
        server = http.createServer();
        server.listen(39522);

        model = new Model();
        model.spectatorCount().should.equal(0);

        comms = new Comms({httpServer: server, model: model});

        // Maintain a hash of all connected sockets
        serverSockets = {};
        var nextSocketId = 0;
        server.on('connection', function (socket) {
            // Add a newly connected socket
            var socketId = nextSocketId++;
            serverSockets[socketId] = socket;
            mLog.log('Comms test socket', socketId, 'opened');

            // Remove the socket when it closes
            socket.on('close', function () {
                mLog.log('Comms test socket', socketId, 'closed');
                delete serverSockets[socketId];
            });
        });

        server.on('listening', function () {
            done();
        });
    });

    describe('new client connection)', function () {
        it('should add a spectator to the model', function () {

            client1 = ioClient.connect(IO_URL, IO_OPTS);

            var connectionComplete = new Promise( function (fulfill, reject) {

                var connected = false;
                client1.on('connect', function () {
                    connected = true;
                    fulfill('connection succeeded');
                });

                setTimeout(function () {
                    if (!connected) {
                        reject('connection timeout');
                    }
                }, 3000);
            });

            return connectionComplete.should.be.fulfilled()
                .then(function () {
                model.spectatorCount().should.equal(1);
            });
        });
    });

    describe('client disconnect', function () {
        it('should remove a spectator from the model', function () {
            this.timeout(5000);

            model.spectatorCount().should.equal(1);
            var disconnectionComplete = new Promise( function (fulfill, reject) {

                var disconnected = false;
                comms.on(CommsEvents.ServerToServer.clientDisconnected, function () {
                    disconnected = true;
                    fulfill('disconnect succeeded');
                });

                setTimeout(function () {
                    if (!disconnected) {
                        reject('disconnect timeout');
                    }
                }, 3000);
            });

            client1.disconnect();

            return disconnectionComplete.should.be.fulfilled()
                .then(function () {
                    model.spectatorCount().should.equal(0);
                });
        });
    });

    describe('#on(ClientToServer.vote)', function () {
        it('should fire the ServerToServer.newVote comms event', function () {
            this.timeout(5000);

            model.spectatorCount().should.equal(0);

            client1 = ioClient.connect(IO_URL, IO_OPTS);

            var eventDetected = new Promise( function (fulfill, reject) {

                var detected = false;
                comms.on(CommsEvents.ServerToServer.newVote, function (vote) {
                    detected = true;
                    fulfill(vote);
                });

                setTimeout(function () {
                    if (!detected) {
                        reject('newVote not thrown');
                    }
                }, 3000);
            });

            var clientVote = new Vote({
                spectatorID: 12,
                powerup: 'dummy'
            });
            client1.emit(CommsEvents.ClientToServer.vote, clientVote.toConfig());

            return eventDetected.should.be.fulfilled()
                .then(function (voteConfig) {
                    voteConfig.should.have.property('spectatorID', 12);
                    voteConfig.should.have.property('powerup', 'dummy');
                });
        });
    });

    after(function (done) {
        this.timeout(15000);
        server.close(function () {
            mLog.log('Comms test server closed');
            done();
        });
        client1.disconnect();
        console.log(Object.keys(serverSockets));
        Object.keys(serverSockets).forEach(function (socketId) {
            mLog.log('Comms test socket', socketId, 'closed');
            serverSockets[socketId].end();
        });
    });
});