var sinon = require('sinon');
var expect = require('chai').expect;
var Storage = require('../lib/storage');
var Driver = require('../lib/driver');

var keys = require('./keys');

describe('Keystore#write', function () {
    var value = "hello, world.";
    var storage, driver, mock;

    beforeEach(function () {
        driver = new Driver();
        storage = new Storage(driver);

        mock = sinon.mock(driver);
    });


    keys.successes.forEach(function (key) {
        it('should write a value success by key ' + key, function (done) {
            var driverKey = (key + "").replace(/^[\/]+/, '').replace(/[\/]+$/, '');
            var parentCount = driverKey.split('/').length - 1;

            if (parentCount) {
                mock.expects("exists").exactly(parentCount)
                    .callsArgWith(1, false);
            } else {
                mock.expects("exists").never();
            }

            mock.expects("isNamespace").once()
                .callsArgWith(1, false);

            mock.expects('write').once()
                .withArgs(driverKey, value)
                .callsArgWith(2);

            storage.write(key, value, function (err) {
                mock.verify();
                done(err);
            });
        });
    });


    keys.invalids.forEach(function (key) {
        it('should throw TypeError by key ' + key, function (done) {
            mock.expects('write').never();

            storage.write(key, value, function (err) {
                mock.verify();
                expect(err).to.be.an.instanceof(TypeError);
                done();
            });
        });
    });

    it('should throw error if parent key exists.', function (done) {
        var key = "foo/bar/baz/quux";

        mock.expects('exists').once()
            .withArgs("foo").callsArgWith(1, false);
        mock.expects('exists').once()
            .withArgs("foo/bar").callsArgWith(1, true);
        mock.expects('write').never();

        storage.write(key, value, function (err) {
            mock.verify();
            expect(err).to.be.an.instanceof(Error);
            done();
        });
    });


    it('should throw error if namespace key exists.', function (done) {
        var key = "foo/bar/baz/quux";

        mock.expects('exists').once()
            .withArgs("foo").callsArgWith(1, false);
        mock.expects('exists').once()
            .withArgs("foo/bar").callsArgWith(1, false);
        mock.expects('exists').once()
            .withArgs("foo/bar/baz").callsArgWith(1, false);
        mock.expects('isNamespace').once()
            .withArgs("foo/bar/baz/quux").callsArgWith(1, true);

        mock.expects('write').never();

        storage.write(key, value, function (err) {
            mock.verify();
            expect(err).to.be.an.instanceof(Error);
            done();
        });
    });
});
