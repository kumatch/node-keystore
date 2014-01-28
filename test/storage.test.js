var sinon = require('sinon');
var expect = require('chai').expect;
var tmp = require('tmp');

var Storage = require('../lib/storage');
var Driver = require('../lib/driver');
var keys = require('./keys');

var writeTestCase = require('./testcase.write.js');
var readTestCase = require('./testcase.read.js');
var copyTestCase = require('./testcase.copy.js');
var typeErrorTestCase = require('./testcase.typeerror.js');

describe('Keystore storage#write', function () {
    writeTestCase('write');
    typeErrorTestCase('write', "value");
});

describe('Keystore storage#append', function () {
    writeTestCase('append');
    typeErrorTestCase('append', "value");
});

describe('Keystore storage#read', function () {
    readTestCase('read');
    typeErrorTestCase('read');
});


describe('Keystore storage#exists', function () {
    keys.successes.forEach(function (key) {
        it('should return a exists result for key ' + key, function (done) {
            var driver = new Driver();
            var storage = new Storage(driver);
            var mock = sinon.mock(driver);

            var driverKey = (key + "").replace(/^[\/]+/, '').replace(/[\/]+$/, '');
            var result = Math.floor(Math.random() * 2);

            mock.expects("exists").once()
                .withArgs(driverKey)
                .callsArgWith(1, null, result);

            storage.exists(key, function (err, exists) {
                mock.verify();

                if (result) {
                    expect(exists).to.be.a.true;
                } else {
                    expect(exists).to.be.a.false;
                }

                done(err);
            });
        });
    });

    typeErrorTestCase('exists');
});


describe('Keystore storage#remove', function () {
    keys.successes.forEach(function (key) {
        it('should remove a value by key ' + key, function (done) {
            var driver = new Driver();
            var storage = new Storage(driver);
            var mock = sinon.mock(driver);

            var driverKey = (key + "").replace(/^[\/]+/, '').replace(/[\/]+$/, '');

            mock.expects("remove").once()
                .withArgs(driverKey)
                .callsArg(1);

            storage.remove(key, function (err) {
                mock.verify();
                done(err);
            });
        });
    });

    typeErrorTestCase('remove');
});

describe('Keystore storage#import', function () {
    var filename = __filename;

    keys.successes.forEach(function (key) {
        it('should import a file for key ' + key, function (done) {
            var driver = new Driver();
            var storage = new Storage(driver);
            var mock = sinon.mock(driver);

            var driverKey = (key + "").replace(/^[\/]+/, '').replace(/[\/]+$/, '');

            mock.expects("import").once()
                .withArgs(driverKey, filename)
                .callsArg(2);

            storage.import(key, filename, function (err) {
                mock.verify();
                done(err);
            });
        });
    });

    it('should throw error if import file is not exists.', function (done) {
        var driver = new Driver();
        var storage = new Storage(driver);
        var mock = sinon.mock(driver);

        var key = "foo";
        var filename = "/path/to/invalid.txt";

        mock.expects("import").never();

        storage.import(key, filename, function (err) {
            mock.verify();
            expect(err).to.be.instanceof(TypeError);
            done();
        });
    });


    typeErrorTestCase('import', filename);
});



describe('Keystore storage#export', function () {
    keys.successes.forEach(function (key) {
        it('should export a file for key ' + key, function (done) {
            var driver = new Driver();
            var storage = new Storage(driver);
            var mock = sinon.mock(driver);

            var driverKey = (key + "").replace(/^[\/]+/, '').replace(/[\/]+$/, '');

            tmp.dir(function _tempDirCreated(err, dir) {
                if (err) {
                    done(err);
                    return;
                }

                var filename = dir + "/path/to/exports.txt";

                mock.expects("export").once()
                    .withArgs(driverKey, filename)
                    .callsArg(2);

                storage.export(key, filename, function (err) {
                    mock.verify();
                    done(err);
                });
            });
        });
    });

    typeErrorTestCase('export', "/tmp/foo.txt");
});


describe('Keystore storage#copy', function () {
    copyTestCase('copy');
    typeErrorTestCase('copy', "dst");
});

describe('Keystore storage#rename', function () {
    copyTestCase('rename');
    typeErrorTestCase('rename', "dst");
});
