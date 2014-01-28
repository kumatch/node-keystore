var Storage = require('./storage');

module.exports = function (driver) {
    return new Storage(driver);
};