/**
 * Created by ryan on 19/03/16.
 */

var DefaultConfiguration=function () {
    return {
        // Player Config
        minimumPlayers: 3,          // Minimum number of players for the game to start
        maximumPlayers: 15,         // Maximum number of players for each round

        // Paddle Config
        paddleSize: 50,             // The radius of the paddle
        paddlePadding: 10,          // The distance between back of paddle and goal

        // Server Config
        serverTick: 30,             // What interval the server should progress the simulation (milliseconds)
        roundIntermission: 5000,    // How long the intermission between rounds lasts (milliseconds)
        roundLength: 120000         // How long each round will last (milliseconds)
    };
};



module.exports = DefaultConfiguration;