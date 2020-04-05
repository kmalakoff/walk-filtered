var fs = require('fs');
var path = require('path');
var joinDeep = require('join-deep');
var Stack = require('stack-lifo');
var lock = require('fifolock');

var getResult = require('./getResult');
var getKeep = require('./getKeep');

var DEFAULT_STAT = 'lstat';
var ACCEPTABLE_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];

class Iterator {
  constructor(cwd, options) {
    options = options || {};
    this.options = {
      filter: options.filter,
      async: options.async,
      fs: options.fs || fs,
      stat: options.stat || DEFAULT_STAT,
    };

    this.cwd = cwd;
    this.lock = lock();
    this.stack = new Stack();
    this.stack.push(this.processPath.bind(this, cwd));
  }

  next(callback) {
    if (this.stack.isEmpty()) return callback(null, { done: true });
    var self = this;

    // keep processing until get a result
    this.stack.pop()(function (err, result) {
      if (err) debugger;
      if (err) return callback(err);
      result ? callback(null, result) : self.next(callback);
    });
  }

  processFilter(fullPath, stat, callback) {
    if (!this.options.filter) return callback(null, true);
    var self = this;

    this.getRealCWD(function (err, realCWD) {
      if (err) debugger;
      if (err) return callback(err); // TODO: record error

      // TODO: remove the relative path? eg. full always
      var relativePath = path.relative(realCWD, fullPath); // the path to the link, file, or directory

      var callbackWrapper = function (err, result) {
        if (err) debugger;
        err ? callback(err) : callback(null, getResult(result));
      };

      try {
        self.options.async ? self.options.filter(relativePath, stat, callbackWrapper) : getKeep(self.options.filter(relativePath, stat), callbackWrapper);
      } catch (err) {
        if (err) debugger;
        callback(err);
      }
    });
  }

  processPath(fullPath, callback) {
    var self = this;

    fs[this.options.stat](fullPath, function (err1, stat) {
      if (err1) {
        if (!~ACCEPTABLE_ERRORS.indexOf(err1.code)) return callback(err1);
        return callback();
      }

      self.processFilter(fullPath, stat, function (err2, keep) {
        if (err2) debugger;
        if (err2) return callback(err2);
        if (!keep) return callback();
        if (!stat.isDirectory()) return callback(null, { done: false, value: { path: fullPath, stat: stat } });

        self.options.fs.realpath(fullPath, function (err3, realPath) {
          if (err3) return callback(err3);

          fs.readdir(realPath, function (err4, names) {
            if (err4) {
              if (!~ACCEPTABLE_ERRORS.indexOf(err4.code)) return callback(err4);
            }

            // var nextPaths = fullPath === realPath ? paths : [realPath];
            var nextPath = fullPath === realPath ? fullPath : realPath;
            if (names.length) self.stack.push(self.processNextDirectoryName.bind(self, nextPath, names.reverse()));
            return callback(null, { done: false, value: { path: fullPath, stat: stat } });
          });
        });
      });
    });
  }

  processNextDirectoryName(fullPath, names, callback) {
    if (!names.length) return callback();
    var name = names.pop(); // compare memory with reduction and inplace
    if (names.length) this.stack.push(this.processNextDirectoryName.bind(this, fullPath, names));
    this.processPath(path.join(fullPath, name), callback);
  }

  getRealCWD(callback) {
    if (this.realCWD) return callback(null, this.realCWD);
    var self = this;

    this.options.fs.realpath(this.cwd, function (err, realCWD) {
      if (err) return callback(err);

      self.realCWD = realCWD;
      callback(null, realCWD);
    });
  }
}

module.exports = Iterator;
