var fs = require('fs');
var path = require('path');
var Queue = require('queue-cb');
var Stack = require('stack-lifo');
var joinDeep = require('join-deep');

var getResult = require('./lib/getResult');
var getKeep = require('./lib/getKeep');

var DEFAULT_CONCURRENCY = 4096; // default concurrency
var DEFAULT_STAT = 'lstat';
var ACCEPTABLE_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];

function processFilter(fullPath, stat, options, callback) {
  var relativePath = path.relative(options.realCWD, fullPath); // the path to the link, file, or directory

  var callbackWrapper = function (err, result) {
    err ? callback(err) : callback(null, getResult(result));
  };

  try {
    // filter
    options.async ? options.filter(relativePath, stat, callbackWrapper) : getKeep(options.filter(relativePath, stat), callbackWrapper);
  } catch (err) {
    callback(err);
  }
}

function processPath(paths, options, callback) {
  var fullPath = joinDeep(paths, path.sep);
  fs[options.stat](fullPath, function (err, stat) {
    if (err || !stat) return callback(); // skip missing

    processFilter(fullPath, stat, options, function (err, keep) {
      if (err) return callback(err);

      if (!keep) return callback(); // do not keep processing
      if (stat.isDirectory()) {
        options.stack.push(processDirectory.bind(null, paths, options));
        options.queue.defer(options.processNext);
      }
      callback();
    });
  });
}
function processNextDirectoryName(paths, names, index, options, callback) {
  if (index >= names.length) return callback();
  var name = names[index++];

  options.stack.push(processNextDirectoryName.bind(null, paths, names, index, options));
  options.stack.push(processPath.bind(null, [paths, name], options));
  options.queue.defer(options.processNext);
  options.queue.defer(options.processNext);
  callback();
}

function processDirectory(paths, options, callback) {
  var fullPath = joinDeep(paths, path.sep);
  options.fs.realpath(fullPath, function (err, realPath) {
    if (err) return callback(err);

    options.fs.readdir(realPath, function (err2, names) {
      if (err2) {
        if (!~ACCEPTABLE_ERRORS.indexOf(err2.code)) return callback(err2);
        return callback();
      }

      var nextPaths = fullPath === realPath ? paths : [realPath];
      processNextDirectoryName(nextPaths, names, 0, options, callback);
    });
  });
}

module.exports = function (cwd, filter, inputOptions, callback) {
  /* eslint-disable */
  if (arguments.length === 3 && typeof inputOptions === 'function') {
    callback = inputOptions;
    inputOptions = {};
  }
  inputOptions = inputOptions || {};
  /* eslint-enable */

  var queue = new Queue(inputOptions.concurrency || DEFAULT_CONCURRENCY);
  var stack = new Stack();
  var processNext = function (callback) {
    if (stack.isEmpty()) return callback();
    var next = stack.pop();
    next(callback);
  };
  var options = {
    filter: filter,
    queue: queue,
    stack: stack,
    processNext: processNext,
    async: inputOptions.async,
    fs: inputOptions.fs || fs,
    stat: inputOptions.stat || DEFAULT_STAT,
  };

  // resolve the realCWD and start processing
  queue.defer(function (callback) {
    options.fs.realpath(cwd, function (err, realCWD) {
      if (err) return callback(err);

      options.realCWD = realCWD; // eslint-disable-line no-param-reassign
      options.stack.push(processPath.bind(null, [cwd], options));
      options.queue.defer(options.processNext);
      callback();
    });
  });

  // choose between promise and callback API
  if (typeof callback === 'function') return queue.await(callback);
  return new Promise(function (resolve, reject) {
    queue.await(function (err, result) {
      err ? reject(err) : resolve(result);
    });
  });
};
