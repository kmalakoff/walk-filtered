var fs = require('fs');
var sysPath = require('path');
var Promise = require('pinkie-promise');
var assign = require('lodash.assign');

var Queue = require('./lib/queue');
var getResult = require('./lib/getResult');
var getKeep = require('./lib/getKeep');

var DEFAULT_FS = fs;
var DEFAULT_CONCURRENCY = 50; // select default concurrency TODO: https://github.com/kmalakoff/readdirp-walk/issues/3

function processPath(paths, options, callback) {
  try {
    var fullPath = paths.join(sysPath.sep);
    processFilter(fullPath, options, function(err, keep) {
      if (err) return callback(err);

      if (!keep) return callback(); // do not keep processing
      fs.lstat(fullPath, function(err2, stat2) {
        if (err2) return callback(err2);

        if (stat2.isSymbolicLink()) {
          fs.stat(fullPath, function(err3, stat3) {
            if (err3) return callback(err3);

            if (stat3.isDirectory())
              options.queue.defer(function(callback) {
                processDirectory(paths, options, callback);
              }); // eslint-disable-line no-use-before-define
            callback();
          });
        } else {
          if (stat2.isDirectory())
            options.queue.defer(function(callback) {
              processDirectory(paths, options, callback);
            }); // eslint-disable-line no-use-before-define
          callback();
        }
      });
    });
  } catch (err) {
    callback(err);
  }
}
function processDirectoryNames(paths, names, options, callback) {
  if (names.length <= 0) return callback();
  options.queue.defer(function(callback) {
    processPath(paths.concat([names.pop()]), options, callback);
  });
  options.queue.defer(function(callback) {
    processDirectoryNames(paths, names, options, callback);
  });
  callback();
}

function processDirectory(paths, options, callback) {
  var fullPath = paths.join(sysPath.sep);
  options.fs.realpath(fullPath, function(err, realPath) {
    if (err) return callback(err);

    options.fs.readdir(realPath, function(err2, names) {
      if (err2) return callback(err2);

      var nextPaths = fullPath === realPath ? paths : realPath.split(sysPath.sep);
      options.queue.defer(function(callback) {
        processDirectoryNames(nextPaths, names, options, callback);
      });
      callback();
    });
  });
}

function processFilter(fullPath, options, callback) {
  var path = sysPath.relative(options.cwd, fullPath); // the path to the link, file, or directory

  var callbackWrapper = function(err, result) {
    if (err) return callback(err);

    if (!getResult(result)) return callback(null, false); // do not keep processing
    callback(null, true);
  };

  // filter
  options.async ? options.filter(path, callbackWrapper) : getKeep(options.filter(path), callbackWrapper);
}

function startProcessing(cwd, options, callback) {
  var paths = [cwd];
  options.fs.realpath(paths.join(sysPath.sep), function(err, realCWD) {
    if (err) return callback(err);

    options.cwd = realCWD; // eslint-disable-line no-param-reassign
    options.queue.defer(function(callback) {
      processPath(paths, options, callback);
    });
    callback();
  });
}

module.exports = function(cwd, filter, options, callback) {
  /* eslint-disable */
  if (arguments.length === 3 && typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = assign({}, options);
  options.filter = filter;
  options.fs = options.fs || DEFAULT_FS;
  /* eslint-enable */

  options.queue = new Queue(options.concurrency || DEFAULT_CONCURRENCY);
  options.queue.defer(function(callback) {
    startProcessing(cwd, options, callback);
  });

  // choose between promise and callback API
  if (typeof callback === 'function') return options.queue.await(callback);
  return new Promise(function(resolve, reject) {
    options.queue.await(function(err, result) {
      err ? reject(err) : resolve(result);
    });
  });
};
