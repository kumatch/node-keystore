var sinon = require('sinon');
var expect = require('chai').expect;
var Storage = require('../lib/storage');
var Driver = require('../lib/driver');

var keys = require('./keys');

module.exports = function (method) {
    method = method || "write";

    var value = "hello, world";

    keys.successes.forEach(function (key) {
        it('should ' + method + ' a value success by key ' + key, function (done) {
            var driver = new Driver();
            var storage = new Storage(driver);
            var mock = sinon.mock(driver);

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

            mock.expects(method).once()
                .withArgs(driverKey, value)
                .callsArgWith(2);

            storage[method](key, value, function (err) {
                mock.verify();
                done(err);
            });
        });
    });

    it('should throw error if parent key exists.', function (done) {
        var driver = new Driver();
        var storage = new Storage(driver);
        var mock = sinon.mock(driver);

        var key = "foo/bar/baz/quux";

        mock.expects('exists').once()
            .withArgs("foo").callsArgWith(1, false);
        mock.expects('exists').once()
            .withArgs("foo/bar").callsArgWith(1, true);
        mock.expects(method).never();

        storage[method](key, value, function (err) {
            mock.verify();
            expect(err).to.be.an.instanceof(Error);
            done();
        });
    });

    it('should throw error if namespace key exists.', function (done) {
        var driver = new Driver();
        var storage = new Storage(driver);
        var mock = sinon.mock(driver);

        var key = "foo/bar/baz/quux";

        mock.expects('exists').once()
            .withArgs("foo").callsArgWith(1, false);
        mock.expects('exists').once()
            .withArgs("foo/bar").callsArgWith(1, false);
        mock.expects('exists').once()
            .withArgs("foo/bar/baz").callsArgWith(1, false);
        mock.expects('isNamespace').once()
            .withArgs("foo/bar/baz/quux").callsArgWith(1, true);

        mock.expects(method).never();

        storage[method](key, value, function (err) {
            mock.verify();
            expect(err).to.be.an.instanceof(Error);
            done();
        });
    });
};
