/**
 * Created by thornhil on 3/23/16.
 */

var should = require('should'); //jshint ignore:line
var CommsMock = require('polyball/tests/testUtils/CommsMock');
var Configuration = require('polyball/server/configuration/Configuration');
var Model = require('polyball/shared/Model');
var Engine = require('polyball/server/Engine');
var Util = require('polyball/shared/Util');
var EngineStatus = require('polyball/server/EngineStatus');
var _ = require('lodash');
var Logger = require('polyball/shared/Logger');

describe('Engine', function() {
    var model, engine, comms, config;

    //
    //
    //                  Utility Functions
    //
    /////////////////////////////////////////////////////////////////////////////////////

    /**
     * Adds the minimum number of players to start a game
     */
    var startGameWithMinPlayers = function (){
        _.times(config.values.minimumPlayers, function (){
            addAndJoinQueue();
        });
    };

    /**
     * Adds a spectator to the game and immediately joins them to the queue
     * @returns {Spectator}
     */
    var addAndJoinQueue = function (){
        var spectator = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});
        comms.fireJoinQueue(spectator.id);
        return spectator;
    };


    //
    //
    //                  Initialization
    //
    ////////////////////////////////////////////////////////////////////////////////////////

    before(function(){
        Logger.setLevel('OFF');
    });

    beforeEach(function(){
        config = new Configuration();
        model = new Model();

        comms = new CommsMock();

        engine = new Engine({
            comms: comms,
            configuration: config.values,
            model: model
        });
    });

    //
    //
    //                  Initialization
    //
    ////////////////////////////////////////////////////////////////////////////////////////

    describe('#handleAddPlayerToQueue', function() {

        it('should add directly to players when players < minPlayers', function () {
            addAndJoinQueue();

            var spectators = model.getSpectators();
            spectators.should.be.empty();

            var players = model.getPlayers();
            players.length.should.equal(1);
        });
        it('should start a game when enough players queue', function () {
            startGameWithMinPlayers();

            var spectators = model.getSpectators();
            spectators.should.be.empty();

            var players = model.getPlayers();
            players.length.should.equal(config.values.minimumPlayers);

            engine.getGameStatus().should.equal(EngineStatus.gameRunning);
        });
        it('should queue Spectators while a round is in progress', function () {
           startGameWithMinPlayers();

            var spectator = addAndJoinQueue();

            var spectators = model.getSpectators();
            spectators.length.should.equal(1);

            var playerQueue = model.getAllQueuedPlayers();
            playerQueue.should.containEql(spectator);

            var players = model.getPlayers();
            players.length.should.equal(config.values.minimumPlayers);

            engine.getGameStatus().should.equal(EngineStatus.gameRunning);
        });
    });

    describe('#initializeGame', function(){
        it('Should add a paddle to each player', function () {
            startGameWithMinPlayers();
            model.getPlayers().forEach(function(player){
                player.paddle.should.not.null();
            });
        });
        it('Should add an arena index to each player', function () {
            startGameWithMinPlayers();
            model.getPlayers().forEach(function(player){
                player.arenaPosition.should.not.null();
            });
        });
    });

    afterEach(function(){
        engine.kill();
    });

    after(function(){
        Logger.setLevel('INFO');
    });

});



