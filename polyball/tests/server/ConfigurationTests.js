/**
 * Created by thornhil on 3/15/16.
 */
var Configuration = require('polyball/server/Configuration');
var should = require('should');
var Util = require('polyball/shared/Util');

describe('Configuration', function () {
    describe('#Construct', function () {
        it('should read in a json file', function(){
            var path = Util.createJSONConfigFile({hello: 1, goodbye:2});
            var config = new Configuration({configPath: path});
            config.values.hello.should.equal(1);
            config.values.goodbye.should.equal(2);
            Util.deleteJSONConfigFile(path);
        });
        it('should overwrite default values', function(){
            var path = Util.createJSONConfigFile({minimumPlayers: 10, serverTick: 1});
            var config = new Configuration({configPath: path});
            config.values.minimumPlayers.should.equal(10);
            config.values.serverTick.should.equal(1);
            Util.deleteJSONConfigFile(path);
        });
        it('should error on malformed JSON', function(){
            var path = Util.createConfigFile('{minimumPlayers: 10:gsfg:. .. serverTick: 1}');
            should.throws(function (){new Configuration({configPath: path});});
            Util.deleteJSONConfigFile(path);
        });
    });
});