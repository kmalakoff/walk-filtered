var fs = require('fs');
var sysPath = require('path');
var Promise = require('pinkie-promise');
var asyncEachLimit = require('each-limit'); // TODO: implement global concurrency https://github.com/kmalakoff/readdirp-walk/issues/1

var assign = require('lodash.assign');

function isPromise(obj) {
  return !!obj && typeof obj === 'object' && typeof obj.then === 'function';
}

var DEFAULT_FS = fs;
var DEFAULT_STAT = 'lstat';
var DEFAULT_CONCURRENCY = 50; // select default concurrency TODO: https://github.com/kmalakoff/readdirp-walk/issues/3

function limitEachFn(limit) {
  return function(array, fn, callback) {
    asyncEachLimit(array, limit, fn, callback);
  };
}

function getResult(result) {
  return result === undefined ? true : result;
}

function processKeep(keep, callback, stats) {
  if (isPromise(keep)) {
    keep
      .then(function(resolvedKeep) {
        setTimeout(function() {
          callback(null, getResult(resolvedKeep), stats);
        });
      })
      .catch(function(err2) {
        callback(err2);
      });
  } else {
    callback(null, getResult(keep), stats);
  }
}

function processPath(fullPath, options, callback) {
  try {
    processFilter(fullPath, options, function(err, keep, stats) {
      if (err) return callback(err);

      if (!keep || !stats.isDirectory()) return callback(); // do not keep processing
      processDirectory(fullPath, options, callback); // eslint-disable-line no-use-before-define
    });
  } catch (err) {
    callback(err);
  }
}

function processDirectory(fullPath, options, callback) {
  options.fs.realpath(fullPath, function(err, realPath) {
    if (err) return callback(err);

    options.fs.readdir(realPath, function(err2, names) {
      if (err2) return callback(err2);

      var fullPaths = names.map(function(name) {
        return sysPath.join(realPath, name);
      });
      options.each(
        fullPaths,
        function(fullPath2, callback2) {
          processPath(fullPath2, options, callback2);
        },
        callback
      );
    });
  });
}

function processFilter(fullPath, options, callback) {
  var path = sysPath.relative(options.cwd, fullPath); // the path to the link, file, or directory

  var callbackWrapper = function(err, result) {
    if (err) return callback(err);

    if (!getResult(result)) return callback(null, false); // do not keep processing
    options.stat(fullPath, function(err2, stats) {
      err2 ? callback(err2) : callback(null, true, stats);
    });
  };

  // filter
  options.async ? options.filter(path, callbackWrapper) : processKeep(options.filter(path), callbackWrapper);
}

function walkFiltered(cwd, options) {
  return new Promise(function(resolve, reject) {
    options.fs.realpath(cwd, function(err, realCWD) {
      if (err) return reject(err);

      options.cwd = realCWD; // eslint-disable-line no-param-reassign
      processPath(cwd, options, function(err2, result) {
        err2 ? reject(err2) : resolve(result);
      });
    });
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
  options.stat = options.fs[options.stat || DEFAULT_STAT].bind(options.fs);
  options.each = options.each || limitEachFn(options.concurrency || DEFAULT_CONCURRENCY);
  /* eslint-enable */

  // provide either promsie or callback support
  var promise = walkFiltered(cwd, options);
  if (typeof callback !== 'function') return promise;
  promise.then(function(result) {
    callback(null, result);
  }, callback);
};
