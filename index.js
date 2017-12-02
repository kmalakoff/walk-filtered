var fs = require('fs');
var sysPath = require('path');
var assign = require('lodash.assign');
var isUndefined = require('lodash.isundefined');
var isObject = require('lodash.isobject');

var DEFAULT_FS = fs;
var DEFAULT_STAT = 'lstat';
var DEFAULT_CONCURRENCY = 50; // select default concurrency TODO: https://github.com/kmalakoff/readdirp-walk/issues/3
var DEFAULT_STATS = false;

function isPromise(obj) { return !!obj && (typeof obj === 'object') && (typeof obj.then === 'function'); }

// TODO: implement global concurrency https://github.com/kmalakoff/readdirp-walk/issues/1
var asyncEachLimit = require('each-limit');

function limitEachFn(limit) { return function (array, fn, callback) { asyncEachLimit(array, limit, fn, callback); }; }

function getResult(result) { return isUndefined(result) ? true : result; }
function processKeep(keep, callback, stats) {
  if (isPromise(keep)) {
    keep
      .then(function (resolvedKeep) { setTimeout(function () { callback(null, getResult(resolvedKeep), stats); }); })
      .catch(function (err2) { callback(err2); });
  } else {
    callback(null, getResult(keep), stats);
  }
}

function processPath(fullPath, options, callback) {
  options.processFilter(fullPath, options, function (err, keep, stats) {
    if (err || !keep || !stats.isDirectory()) return callback();

    // a directory, file or symlink
    processDirectory(fullPath, options, callback); // eslint-disable-line no-use-before-define
  });
}

function processDirectory(fullPath, options, callback) {
  options.fs.realpath(fullPath, function (err, realPath) {
    if (err) return callback(err);

    options.fs.readdir(realPath, function (err2, names) {
      if (err2) return callback(err2);

      var fullPaths = names.map(function (name) { return sysPath.join(realPath, name); });
      options.each(fullPaths, function (fullPath2, callback2) {
        processPath(fullPath2, options, callback2);
      }, callback);
    });
  });
}

// early exit optimization: filter without stats
function processFilterLazyStats(fullPath, options, callback) {
  var path = sysPath.relative(options.cwd, fullPath); // the path to the link, file, or directory

  var callbackWrapper = function (err, result) {
    if (err) return callback(err);
    if (!getResult(result)) return callback(null, false);
    options.stat(fullPath, function (err2, stats) { err2 ? callback(err2) : callback(null, true, stats); });
  };

  // filter
  options.async ? options.filter(path, callbackWrapper) : processKeep(options.filter(path), callbackWrapper);
}

// full processing: filter with stats
function processFilterStats(fullPath, options, callback) {
  var path = sysPath.relative(options.cwd, fullPath); // the path to the link, file, or directory

  options.stat(fullPath, function (err, stats) {
    if (err) return callback(err);

    // filter
    if (!options.async) return processKeep(options.filter(path, stats), callback, stats);
    options.filter(path, stats, function (err2, result) { err2 ? callback(err2) : callback(null, getResult(result), stats); });
  });
}

module.exports = function (cwd, filter, options, callback) {
  if (arguments.length === 3) { callback = options; options = {}; } // eslint-disable-line no-param-reassign

  /* eslint-disable */
  options = isObject(options) ? assign({}, options) : { stats: options };
  options.stats = isUndefined(options.stats) ? DEFAULT_STATS : options.stats;
  options.filter = filter;
  options.fs = options.fs || DEFAULT_FS;
  options.stat = options.fs[options.stat || DEFAULT_STAT].bind(options.fs);
  options.each = options.each || limitEachFn(options.concurrency || DEFAULT_CONCURRENCY);
  options.processFilter = options.stats ? processFilterStats : processFilterLazyStats;
  /* eslint-enable */

  options.fs.realpath(cwd, function (err, realCWD) {
    if (err) return callback(err);

    options.cwd = realCWD; // eslint-disable-line no-param-reassign
    processPath(cwd, options, callback);
  });
};
