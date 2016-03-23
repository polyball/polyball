/**
 * Created by thornhil on 3/23/16.
 */

var should = require('should'); //jshint ignore:line
var CommsMock = require('polyball/tests/testUtils/CommsMock');
var Configuration = require('polyball/server/configuration/Configuration');
var Model = require('polyball/shared/Model');
var Engine = require('polyball/server/Engine');
var Util = require('polyball/shared/Util');

describe('Engine', function() {
    describe('#handleAddPlayerToQueue', function() {
        var model, engine, comms, config;

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

        it('should add directly to players when players < minPlayers', function () {
            var spectator = model.addSpectator({clientConfig: {name: Util.randomUsername(), socket: 'dummy'}});
            comms.fireJoinQueue(spectator.id);


            var spectators = model.getSpectators();
            spectators.should.be.empty();

            var players = model.getPlayers();
            players.length.should.equal(1);
        });
    });
});

