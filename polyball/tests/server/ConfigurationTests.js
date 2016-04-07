/**
 * Created by thornhil on 3/15/16.
 */
var Configuration = require('polyball/server/configuration/Configuration');
var should = require('should');
var Util = require('polyball/shared/Util');
var Logger = require('polyball/shared/Logger');
var DefaultConfiguration = require('polyball/server/configuration/DefaultConfiguration');

describe('Configuration', function () {
    describe('#Construct', function () {
        before(function (){
            Logger.setLevel('ERROR');
        });
        it('should read in a json file', function(){
            var path = Util.createJSONConfigFile({hello: 1, goodbye:2});
            var config = new Configuration({configPath: path});
            config.values.hello.should.equal(1);
            config.values.goodbye.should.equal(2);
            Util.deleteJSONConfigFile(path);
        });
        it('should overwrite default values', function(){
            var path = Util.createJSONConfigFile({minimumPlayers: 6, serverTick: 1});
            var config = new Configuration({configPath: path});
            config.values.minimumPlayers.should.equal(6);
            config.values.serverTick.should.equal(1);
            Util.deleteJSONConfigFile(path);
        });
        it('should error on malformed JSON', function(){
            var path = Util.createConfigFile('{minimumPlayers: 10:gsfg:. .. serverTick: 1}');
            should.throws(function (){new Configuration({configPath: path});});
            Util.deleteJSONConfigFile(path);
        });
        it('should not allow min players < 3', function(){
            var path = Util.createJSONConfigFile({minimumPlayers: 2});
            var config = new Configuration({configPath: path});
            config.values.minimumPlayers.should.equal((new DefaultConfiguration()).minimumPlayers);
            Util.deleteJSONConfigFile(path);
        });
        it('should not allow round intermission < 1', function(){
            var path = Util.createJSONConfigFile({roundIntermission: 0});
            var config = new Configuration({configPath: path});
            config.values.roundIntermission.should.equal((new DefaultConfiguration()).roundIntermission);
            Util.deleteJSONConfigFile(path);
        });
        it('should not allow max players < min players', function(){
            var path = Util.createJSONConfigFile({maximumPlayers: 1, minimumPlayers: 4});
            var config = new Configuration({configPath: path});

            config.values.minimumPlayers.should.equal((new DefaultConfiguration()).minimumPlayers);
            config.values.maximumPlayers.should.equal((new DefaultConfiguration()).maximumPlayers);
            Util.deleteJSONConfigFile(path);
        });
        it('should not allow powerups dir to be inaccessible', function(){
            var path = Util.createJSONConfigFile({powerupsDir: '/gsdg/sdgsdg/olo'});
            var config = new Configuration({configPath: path});

            config.values.powerupsDir.should.equal((new DefaultConfiguration()).powerupsDir);
            Util.deleteJSONConfigFile(path);
        });
        after(function(){
            Logger.setLevel('INFO');
        });
    });
});
