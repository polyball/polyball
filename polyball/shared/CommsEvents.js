/**
 * Created by kdbanman on 2016-03-15.
 */

var ServerToServer = {
    clientDisconnected: 'clientDisconnected',
    newVote: 'newVote',
    newPlayerQueued: 'newPlayerQueued'
};

var ClientToClient = {
    snapshotReceived: 'snapshotReceived',
    newRound: 'newRoundData'
};

var ServerToClient = {
    setLogLevel: "setLogLevel",
    startNewRound: "startNewRound",
    newSnapshot: 'newSnapshot'  // Arena is ignored if present
};

var ClientToServer = {
    connection: 'connection',  // socket.io builtin - do not change!
    disconnect: 'disconnect',  // socket.io builtin - do not change!
    queueToPlay: 'queueToPlay',
    vote: 'vote'
};

exports.ServerToServer = ServerToServer;
exports.ClientToClient = ClientToClient;
exports.ServerToClient = ServerToClient;
exports.ClientToServer = ClientToServer;