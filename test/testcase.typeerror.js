var sinon = require('sinon');
var expect = require('chai').expect;
var Storage = require('../lib/storage');
var Driver = require('../lib/driver');

var keys = require('./keys');

module.exports = function (method, value) {
    method = method || "write";

    keys.invalids.forEach(function (key) {
        it('should throw TypeError by key ' + key, function (done) {
            var driver = new Driver();
            var storage = new Storage(driver);
            var mock = sinon.mock(driver);

            mock.expects(method).never();

            var check = function (err) {
                mock.verify();
                expect(err).to.be.an.instanceof(TypeError);
                done();
            };

            if (value) {
                storage[method](key, value, check);
            } else {
                storage[method](key, check);
            }
        });
    });
};
