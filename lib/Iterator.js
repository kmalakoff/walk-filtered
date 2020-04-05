var fs = require('fs');
var path = require('path');
var Stack = require('stack-lifo');
var fifo = require('fifo');
var joinDeep = require('join-deep');

var getResult = require('./getResult');
var getKeep = require('./getKeep');

var DEFAULT_STAT = 'lstat';
var ACCEPTABLE_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];

function processError(err, callback) {
  if (!~ACCEPTABLE_ERRORS.indexOf(err.code)) return callback(err);
  callback();
}

function Iterator(cwd, options) {
  options = options || {};
  this.options = {
    filter: options.filter,
    async: options.async,
    fs: options.fs || fs,
    stat: options.stat || DEFAULT_STAT,
  };

  this.cwd = cwd;
  this.stack = new Stack();
  this.stack.push(this._processPath.bind(this, []));
  this.processingCount = 0;
  this.queued = fifo();
}

Iterator.prototype.next = function (callback) {
  this.queued.push(callback);
  this._processNext();
};

Iterator.prototype._processNext = function (callback) {
  var self = this;

  if (!this.queued.length) return;

  if (this.stack.isEmpty()) {
    if (this.processingCount <= 0) {
      while (this.queued.length) this.queued.shift()(null, { done: true });
    }
    return;
  }

  var callback = this.queued.shift();
  this.processingCount++;
  this.stack.pop()(function (err, result) {
    self.processingCount--;
    if (err) return callback(err);

    // didn't get a result, try again
    if (!result) self.queued.unshift(callback);
    else callback(null, result); // return result

    self._processNext(); // keep emptying queue
  });

  self._processNext(); // keep emptying queue
};

Iterator.prototype._processFilter = function (relativePath, stat, callback) {
  if (!this.options.filter) return callback(null, true);
  var self = this;

  var callbackWrapper = function (err, result) {
    err ? callback(err) : callback(null, getResult(result));
  };

  try {
    self.options.async ? self.options.filter(relativePath, stat, callbackWrapper) : getKeep(self.options.filter(relativePath, stat), callbackWrapper);
  } catch (err) {
    callback(err);
  }
};

Iterator.prototype._processPath = function (paths, callback) {
  var self = this;
  var relativePath = joinDeep(paths, path.sep);
  var fullPath = path.join(this.cwd, relativePath);

  fs[this.options.stat](fullPath, function (err1, stat) {
    if (err1) return processError(err1, callback);

    self._processFilter(relativePath, stat, function (err2, keep) {
      if (err2) return callback(err2);
      if (!keep) return callback();
      if (!stat.isDirectory()) return callback(null, { done: false, value: { path: fullPath, stat: stat } });

      self.options.fs.realpath(fullPath, function (err3, realPath) {
        if (err3) return processError(err3, callback);

        fs.readdir(realPath, function (err4, names) {
          if (err4) return processError(err4, callback);

          var nextPaths = fullPath === realPath ? paths : [realPath];
          if (names.length) self.stack.push(self._processNextDirectoryEntry.bind(self, nextPaths, names.reverse()));
          return callback(null, { done: false, value: { path: fullPath, stat: stat } });
        });
      });
    });
  });
};

Iterator.prototype._processNextDirectoryEntry = function (paths, names, callback) {
  if (!names.length) return callback();
  var name = names.pop(); // TODO: compare memory with reduction and inplace
  if (names.length) this.stack.push(this._processNextDirectoryEntry.bind(this, paths, names));
  this._processPath([paths, name], callback);
};

Iterator.prototype._getRealCWD = function (callback) {
  if (this.realCWD) return callback(null, this.realCWD);
  var self = this;

  this.options.fs.realpath(this.cwd, function (err, realCWD) {
    if (err) return callback(err);

    self.realCWD = realCWD;
    callback(null, realCWD);
  });
};

module.exports = Iterator;
