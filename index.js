var fs = require('fs');
var sysPath = require('path');
var Promise = require('pinkie-promise');
var asyncEachLimit = require('each-limit'); // TODO: implement global concurrency https://github.com/kmalakoff/readdirp-walk/issues/1

var assign = require('lodash.assign');

function isPromise(obj) {
  return !!obj && typeof obj === 'object' && typeof obj.then === 'function';
}

var DEFAULT_FS = fs;
var DEFAULT_CONCURRENCY = 50; // select default concurrency TODO: https://github.com/kmalakoff/readdirp-walk/issues/3

function limitEachFn(limit) {
  return function (array, fn, callback) {
    asyncEachLimit(array, limit, fn, callback);
  };
}

function getResult(result) {
  return result === undefined ? true : result;
}

function processKeep(keep, callback) {
  if (isPromise(keep)) {
    keep
      .then(function (resolvedKeep) {
        setTimeout(function () {
          callback(null, getResult(resolvedKeep));
        });
      })
      .catch(function (err2) {
        callback(err2);
      });
  } else {
    callback(null, getResult(keep));
  }
}

function processPath(paths, options, callback) {
  try {
    var fullPath = paths.join(sysPath.sep);
    processFilter(fullPath, options, function (err, keep) {
      if (err) return callback(err);

      if (!keep) return callback(); // do not keep processing
      fs.lstat(fullPath, function (err2, stat2) {
        if (err2) return callback(err2);

        if (stat2.isSymbolicLink()) {
          fs.stat(fullPath, function (err3, stat3) {
            if (err3) return callback(err3);

            if (stat3.isDirectory()) {
              processDirectory(paths, options, callback); // eslint-disable-line no-use-before-define
            } else {
              callback();
            }
          });
        } else if (stat2.isDirectory()) {
          processDirectory(paths, options, callback); // eslint-disable-line no-use-before-define
        } else {
          callback();
        }
      });
    });
  } catch (err) {
    callback(err);
  }
}

function processDirectory(paths, options, callback) {
  var fullPath = paths.join(sysPath.sep);
  options.fs.realpath(fullPath, function (err, realPath) {
    if (err) return callback(err);

    options.fs.readdir(realPath, function (err2, names) {
      if (err2) return callback(err2);

      var nextPaths = fullPath === realPath ? paths : realPath.split(sysPath.sep);
      options.each(
        names,
        function (name, callback2) {
          processPath(nextPaths.concat([name]), options, callback2);
        },
        callback
      );
    });
  });
}

function processFilter(fullPath, options, callback) {
  var path = sysPath.relative(options.cwd, fullPath); // the path to the link, file, or directory

  var callbackWrapper = function (err, result) {
    if (err) return callback(err);

    if (!getResult(result)) return callback(null, false); // do not keep processing
    callback(null, true);
  };

  // filter
  options.async ? options.filter(path, callbackWrapper) : processKeep(options.filter(path), callbackWrapper);
}

function walkFiltered(paths, options) {
  return new Promise(function (resolve, reject) {
    options.fs.realpath(paths.join(sysPath.sep), function (err, realCWD) {
      if (err) return reject(err);

      options.cwd = realCWD; // eslint-disable-line no-param-reassign
      processPath(paths, options, function (err2, result) {
        err2 ? reject(err2) : resolve(result);
      });
    });
  });
}

module.exports = function (cwd, filter, options, callback) {
  /* eslint-disable */
  if (arguments.length === 3 && typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = assign({}, options);
  options.filter = filter;
  options.fs = options.fs || DEFAULT_FS;
  options.each = options.each || limitEachFn(options.concurrency || DEFAULT_CONCURRENCY);
  /* eslint-enable */

  // provide either promise or callback support
  var paths = cwd.split(sysPath.sep);
  var promise = walkFiltered(paths, options);
  if (typeof callback !== 'function') return promise;
  promise.then(function (result) {
    callback(null, result);
  }, callback);
};
