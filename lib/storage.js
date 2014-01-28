var _ = require('lodash');
var path = require('path');
var async = require('async');
var fs = require('fs');
var mkdirp = require('mkdirp');

module.exports = KeystoreStorage;


function KeystoreStorage (driver) {
    this._driver = driver;
}


KeystoreStorage.prototype.driver = function () {
    return this._driver;
};


KeystoreStorage.prototype.write = function (key, value, callback) {
    var self = this;

    try {
        key = normalizeKey(key);

        if (!key) {
            callback(Error());
            return;
        }
    } catch (err) {
        callback(err);
        return;
    }

    prepareWriteKey(self.driver(), key, function (err) {
        if (err) {
            callback(err);
        } else {
            self.driver().write(key, value, callback);
        }
    });
};

KeystoreStorage.prototype.append = function (key, value, callback) {
    var self = this;

    try {
        key = normalizeKey(key);

        if (!key) {
            callback(Error());
            return;
        }
    } catch (err) {
        callback(err);
        return;
    }

    prepareWriteKey(self.driver(), key, function (err) {
        if (err) {
            callback(err);
        } else {
            self.driver().append(key, value, callback);
        }
    });
};


KeystoreStorage.prototype.read = function (key, callback) {
    try {
        key = normalizeKey(key);

        if (!key) {
            callback(Error());
            return;
        }
    } catch (err) {
        callback(err);
        return;
    }

    this.driver().read(key, callback);
};


KeystoreStorage.prototype.exists = function (key, callback) {
    try {
        key = normalizeKey(key);

        if (!key) {
            callback(Error());
            return;
        }
    } catch (err) {
        callback(err);
        return;
    }

    this.driver().exists(key, function (err, exists) {
        callback(err, exists ? true : false);
    });
};

KeystoreStorage.prototype.remove = function (key, callback) {
    try {
        key = normalizeKey(key);

        if (!key) {
            callback(Error());
            return;
        }
    } catch (err) {
        callback(err);
        return;
    }

    this.driver().remove(key, callback);
};

KeystoreStorage.prototype.import = function (key, filename, callback) {
    var self = this;

    try {
        key = normalizeKey(key);

        if (!key) {
            callback(Error());
            return;
        }
    } catch (err) {
        callback(err);
        return;
    }

    fs.exists(filename, function (exists) {
        if (!exists) {
            callback(TypeError('file "' + filename + '" is not exists'));
            return;
        }

        self.driver().import(key, filename, callback);
    });
};

KeystoreStorage.prototype.export = function (key, filename, callback) {
    var self = this;

    try {
        key = normalizeKey(key);

        if (!key) {
            callback(Error());
            return;
        }
    } catch (err) {
        callback(err);
        return;
    }

    var dirname = path.dirname(filename);

    fs.exists(dirname, function (exists) {
        if (!exists) {
            mkdirp(dirname, function (err) {
                if (err) {
                    callback(err);
                    return;
                }

                self.driver().export(key, filename, callback);
            });
        }

        self.driver().export(key, filename, callback);
    });
};

KeystoreStorage.prototype.copy = function (srcKey, dstKey, callback) {
    var self = this;
    var src, dst;

    try {
        src = normalizeKey(srcKey);
        dst = normalizeKey(dstKey);

        if (!src || !dst) {
            callback(Error());
            return;
        }
    } catch (err) {
        callback(err);
        return;
    }

    prepareWriteKey(self.driver(), dst, function (err) {
        if (err) {
            callback(err);
        } else {
            self.driver().copy(src, dst, callback);
        }
    });
};

KeystoreStorage.prototype.rename = function (srcKey, dstKey, callback) {
    var self = this;
    var src, dst;

    try {
        src = normalizeKey(srcKey);
        dst = normalizeKey(dstKey);

        if (!src || !dst) {
            callback(Error());
            return;
        }
    } catch (err) {
        callback(err);
        return;
    }

    prepareWriteKey(self.driver(), dst, function (err) {
        if (err) {
            callback(err);
        } else {
            self.driver().rename(src, dst, callback);
        }
    });
};



function normalizeKey(key) {
    if (_.isString(key) && _.isEmpty(key)) {
        throw new TypeError('invalid key: a empty.');
    }

    if (_.isNumber(key) && _.isNaN(key)) {
        throw new TypeError('invalid key: a NaN.');
    }

    if (_.isString(key) || _.isNumber(key)) {
        key = path.normalize( (key + "").replace(/^([\/]*)([^\/].*[^\/])([\/]*)$/, '$2') );

        if (key.match(/^[\./]+/)) {
            throw new TypeError('invalid key: traverse directory.');
        }

        return key;
    }

    throw new TypeError('invalid key');
}

function prepareWriteKey(driver, key, callback) {
    var self = this;
    var parentKeys = listParentKeys(key);

    async.eachSeries(parentKeys, function (parentKey, next) {
        var k = normalizeKey(parentKey);

        driver.exists(k, function (exists) {
            if (exists) {
                next(Error('a key "' + key + '" parent exists.'));
            } else {
                next();
            }
        });
    }, function (err) {
        if (err) {
            callback(err);
            return;
        }

        driver.isNamespace(key, function (isNamespace) {
            if (isNamespace) {
                callback(Error('a key "' + key + '" parent exists.'));
            } else {
                callback();
            }
        });
    });
}

function listParentKeys(key) {
    var keys = key.split('/');
    var parentKeys = [];
    var current;

    for (var i = 0; i < keys.length - 1; i++) {

        if (parentKeys.length) {
            current += "/" + keys[i];
        } else {
            current = keys[i];
        }

        parentKeys.push(current);
    }

    return parentKeys;
}
