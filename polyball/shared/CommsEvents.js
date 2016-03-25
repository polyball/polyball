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
    newLocalID: 'newLocalID',
    snapshotReceived: 'snapshotReceived',
    newRound: 'newRoundData'
};

var ServerToClient = {
    setLogLevel: "setLogLevel",
    idAssigned: "idAssigned",
    startNewRound: "startNewRound",
    newSnapshot: 'newSnapshot'
};

var ClientToServer = {
    connection: 'connection',  // socket.io builtin - do not change!
    disconnect: 'disconnect',  // socket.io builtin - do not change!
    queueToPlay: 'queueToPlay',
    newCommandAggregate: 'newCommandAggregate',
    vote: 'vote'
};

exports.ServerToServer = ServerToServer;
exports.ClientToClient = ClientToClient;
exports.ServerToClient = ServerToClient;
exports.ClientToServer = ClientToServer;