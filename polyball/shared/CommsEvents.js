/**
 * Created by kdbanman on 2016-03-15.
 */

var ServerToServer = {
    clientDisconnected: 'clientDisconnected',
    newVote: 'newVote',
    newPlayerQueued: 'newPlayerQueued',
    playerCommandsReceived: 'playerCommandsReceived'
};

var ClientToClient = {
    snapshotReceived: 'snapshotReceived',
    newRound: 'newRoundData',
    roundEnded: 'roundEnded'
};

var ServerToClient = {
    setLogLevel: "setLogLevel",
    idAssigned: "idAssigned",
    startNewRound: "startNewRound",
    newSnapshot: 'newSnapshot',
    endRound: "endRound"
};

var ClientToServer = {
    configRequest: 'configRequest',
    connection: 'connection',  // socket.io builtin - do not change!
    // SRS Requirement - 3.2.2.13 Player Disconnect
    disconnect: 'disconnect',  // socket.io builtin - do not change!
    queueToPlay: 'queueToPlay',
    newCommandAggregate: 'newCommandAggregate',
    vote: 'vote'
};

exports.ServerToServer = ServerToServer;
exports.ClientToClient = ClientToClient;
exports.ServerToClient = ServerToClient;
exports.ClientToServer = ClientToServer;