var sinon = require('sinon');
var expect = require('chai').expect;
var Storage = require('../lib/storage');
var Driver = require('../lib/driver');

var keys = require('./keys');

module.exports = function (method, value) {
    method = method || "read";
    value  = value  || "hello, world";

    keys.successes.forEach(function (key) {
        it('should ' + method + ' a value success by key ' + key, function (done) {
            var driver = new Driver();
            var storage = new Storage(driver);
            var mock = sinon.mock(driver);

            var driverKey = (key + "").replace(/^[\/]+/, '').replace(/[\/]+$/, '');

            mock.expects(method).once()
                .withArgs(driverKey)
                .callsArgWith(1, null, value);

            storage[method](key, function (err, result) {
                mock.verify();
                expect(result).to.equals(value);

                done(err);
            });
        });
    });
};
