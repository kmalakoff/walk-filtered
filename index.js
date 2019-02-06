var fs = require('fs');
var path = require('path');
var Queue = require('queue-cb');

var getResult = require('./lib/getResult');
var getKeep = require('./lib/getKeep');

var DEFAULT_CONCURRENCY = 50; // select default concurrency TODO: https://github.com/kmalakoff/readdirp-walk/issues/3

function getRealStat(fullPath, callback) {
  fs.lstat(fullPath, function(err, stat) {
    if (err) return callback(err);

    !stat.isSymbolicLink() ? callback(null, stat) : fs.stat(fullPath, callback);
  });
}

function processFilter(fullPath, options, callback) {
  var relativePath = path.relative(options.realCWD, fullPath); // the path to the link, file, or directory

  var callbackWrapper = function(err, result) {
    if (err) return callback(err);

    if (!getResult(result)) return callback(null, false); // do not keep processing
    callback(null, true);
  };

  // filter
  options.async ? options.filter(relativePath, callbackWrapper) : getKeep(options.filter(relativePath), callbackWrapper);
}

function processPath(paths, options, callback) {
  try {
    var fullPath = paths.join(path.sep);
    processFilter(fullPath, options, function(err, keep) {
      if (err) return callback(err);
      if (!keep) return callback(); // do not keep processing

      getRealStat(fullPath, function(err, stat) {
        if (!err && stat.isDirectory()) options.queue.defer(processDirectory.bind(null, paths, options));
        callback();
      });
    });
  } catch (err) {
    callback(err);
  }
}
function processNextDirectoryName(paths, names, options, callback) {
  if (names.length <= 0) return callback();
  var name = names.pop();
  options.queue.defer(processNextDirectoryName.bind(null, paths, names, options));
  processPath(paths.concat([name]), options, callback);
}

function processDirectory(paths, options, callback) {
  var fullPath = paths.join(path.sep);
  options.fs.realpath(fullPath, function(err, realPath) {
    if (err) return callback(err);

    options.fs.readdir(realPath, function(err2, names) {
      if (err2) return callback(err2);

      var nextPaths = fullPath === realPath ? paths : [realPath];
      options.queue.defer(processNextDirectoryName.bind(null, nextPaths, names.reverse(), options));
      callback();
    });
  });
}

module.exports = function(cwd, filter, inputOptions, callback) {
  /* eslint-disable */
  if (arguments.length === 3 && typeof inputOptions === 'function') {
    callback = inputOptions;
    inputOptions = {};
  }
  inputOptions = inputOptions || {};
  /* eslint-enable */

  var queue = new Queue(inputOptions.concurrency || DEFAULT_CONCURRENCY);
  var options = { filter: filter, queue: queue, async: inputOptions.async, fs: inputOptions.fs || fs };

  // resolve the realCWD and start processing
  queue.defer(function(callback) {
    options.fs.realpath(cwd, function(err, realCWD) {
      if (err) return callback(err);

      options.realCWD = realCWD; // eslint-disable-line no-param-reassign
      queue.defer(processPath.bind(null, [cwd], options));
      callback();
    });
  });

  // choose between promise and callback API
  if (typeof callback === 'function') return queue.await(callback);
  return new Promise(function(resolve, reject) {
    queue.await(function(err, result) {
      err ? reject(err) : resolve(result);
    });
  });
};
