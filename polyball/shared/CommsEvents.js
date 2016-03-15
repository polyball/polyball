/**
 * Created by kdbanman on 2016-03-15.
 */

var ServerToServer = {
    newVote: 'newVote',
    newPlayerQueued: 'newPlayerQueued'
};

var ClientToClient = {
    snapshotReceived: 'snapshotReceived'
};

var ServerToClient = {
    newSnapshot: 'newSnapshot'
};

var ClientToServer = {
    queueToPlay: 'queueToPlay',
    vote: 'vote'
};

exports.ServerToServer = ServerToServer;
exports.ClientToClient = ClientToClient;
exports.ServerToClient = ServerToClient;
exports.ClientToServer = ClientToServer;