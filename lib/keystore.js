var Storage = require('./storage');

module.exports = exports = function (driver) {
    return new Storage(driver);
};

exports.Driver = require('./driver');