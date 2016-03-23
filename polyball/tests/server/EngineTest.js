/**
 * Created by thornhil on 3/23/16.
 */
var should = require('should'); //jshint ignore:line
var Comms = require('polyball/server/Comms');
var CommsEvents = require('polyball/shared/CommsEvents');
var Configuration = require('polyball/server/configuration/Configuration');
var Model = require('polyball/shared/Model');
var Engine = require('polyball/server/Engine');

describe('Engine', function() {
    describe('#handleAddPlayerToQueue', function() {
        var model, engine, comms, config;

        beforeEach(function(){
            config = new Configuration();
            model = new Model();
            comms = {};
            comms.on = function(evt, func){
                // blah
            };
            engine = new Engine({
                comms: comms,
                configuration: config.values,
                model: model
            });
        });

        it('should add directly to players when players < minPlayers', function () {

        });
    });
});
