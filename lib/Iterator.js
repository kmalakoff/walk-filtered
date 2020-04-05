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
      async: options.async,
      fs: options.fs || fs,
      stat: options.stat || DEFAULT_STAT,
    };

    this.cwd = cwd;
    this.lock = lock();
    this.stack = new Stack();
    this.stack.push(cwd);
  }

  next(filter) {
    var self = this;
    var callback = function() {}; // TODO: process error

    self.lock.acquire(function (release) {
      if (self.stack.isEmpty()) {
        release();
        return filter(null, null);
      }

      var fullPath = self.stack.pop();
      fs[self.options.stat](fullPath, function (err1, stat) {
        if (err1) {
          release();
          return callback(err1);
        }

        self.processFilter(fullPath, stat, filter, function (err2, keep) {
          if (err2 || !keep || !stat.isDirectory()) {
            release();
            return callback(err2)
          }

          self.processDirectory(fullPath, function (err3) {
            release();
            callback(err3)
          });
        });
      });
    });
  }

  processFilter(fullPath, stat, filter, callback) {
    var self = this;

    this.getRealCWD(function (err, realCWD) {
      if (err) return callback(err); // TODO: record error

      // TODO: remove the relative path? eg. full always
      var relativePath = path.relative(realCWD, fullPath); // the path to the link, file, or directory

      var callbackWrapper = function (err, result) {
        err ? callback(err) : callback(null, getResult(result));
      };

      try {
        self.options.async ? filter(relativePath, stat, callbackWrapper) : getKeep(filter(relativePath, stat), callbackWrapper);
      } catch (err) {
        callback(err);
      }
    });
  }

  processDirectory(fullPath, callback) {
    var self = this;

    this.options.fs.realpath(fullPath, function (err, realPath) {
      if (err) return callback(err);

      fs.readdir(realPath, function (err, entries) {
        if (err) {
          if (!~ACCEPTABLE_ERRORS.indexOf(err.code)) return callback(err);
        }

        for (let i = entries.length - 1; i >= 0; i--) self.stack.push(path.join(realPath, entries[i]));
        return callback();

        // var nextPaths = fullPath === realPath ? paths : [realPath];
        // processNextDirectoryName(nextPaths, names, 0, options, callback);
      });
    });
  }

  getRealCWD(callback) {
    var self = this;

    if (this.realCWD) return callback(null, this.realCWD);
    this.options.fs.realpath(this.cwd, function (err, realCWD) {
      if (err) return callback(err);

      self.realCWD = realCWD;
      callback(null, realCWD);
    });
  }
}

module.exports = Iterator;

// var joinDeep = require('join-deep');

// function processNextDirectoryName(paths, names, index, options, callback) {
//   if (index >= names.length) return callback();
//   var name = names[index++];

//   options.stack.push(processNextDirectoryName.bind(null, paths, names, index, options));
//   options.stack.push(processPath.bind(null, [paths, name], options));
//   options.queue.defer(options.processNext);
//   options.queue.defer(options.processNext);
//   callback();
// }
