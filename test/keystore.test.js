var expect = require('chai').expect;
var keystore = require('..');

describe('Keystore', function () {
    var storage;

    before(function () {
        storage = keystore();
    });

    it('should create a storage', function () {
        expect(storage).to.be.a('object');
    });

    var methods = [
        "read", "write", "append", "exists",
        "remove", "import", "export", "copy", "rename"
    ];

    methods.forEach(function (method) {
        it('storage should has a method ' + method, function () {
            expect(storage[method]).to.be.a('function');
        });
    });
});
