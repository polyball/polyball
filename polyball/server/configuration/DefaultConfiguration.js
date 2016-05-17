/**
 * Created by ryan on 19/03/16.
 */

// SRS Requirement - 3.1.1.1 Configurable Parameters
// This file outlines the default configuration parameters as well as acts like a template
// for an administrator to create their own configuration file
var DefaultConfiguration=function () {
    return {
        // Player Config
        minimumPlayers: 3,          // Minimum number of players for the game to start
        maximumPlayers: 7,         // Maximum number of players for each round

        // Paddle Config
        paddleRadius: 200,           // The radius of the paddle
        paddlePadding: 10,          // The distance between back of paddle and goal
        paddleMaximumVelocity: 100,       // The maximum speed the paddle can have when contacting balls (does not effect movement speed)

        // Ball Config
        ballMaxVelocity: 3,         // The maximum velocity for balls

        //Powerup Config
        powerupRadius: 30,          // The radius for "Powerup Balls"
        powerupDuration: 20000,     // Time the powerups should last (milliseconds)
        powerupVoteDuration: 10000, // The ammount of time a powerup election should last
        powerupVoteFrequency: 10000, // How often a powerup vote should be triggered

        // Server Config
        serverTick: 30,             // What interval the server should progress the simulation (milliseconds)
        roundIntermission: 7000,    // How long the intermission between rounds lasts (milliseconds)
        roundLength: 120000,         // How long each round will last (milliseconds)
        powerupsDir: 'polyball/shared/powerups', //Where the server can find powerup source files

        // Client Input Config
        commandAggregationInterval: 40,     // The minimum time between input command aggregates sent to the server
        inputAccumulationInterval: 20,      // The minimum time between movement input and registration as an input command

        // Client Simulation Sync Config
        simulationSyncLargeDelta: 100,      // The minimum distance between two objects to be rapidly decayed
        simulationSyncRapidDecayRate: 0.7,  // The fraction that large deltas are decayed.
        simulationSyncSlowDecayRate: 0.15   // The fraction that small deltas are decayed.
    };
};



module.exports = DefaultConfiguration;
