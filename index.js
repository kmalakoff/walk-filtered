var sysPath = require('path');
var assign = require('lodash.assign');
var isUndefined = require('lodash.isundefined');
var isObject = require('lodash.isobject');

var DEFAULT_FS = require('graceful-fs');
var DEFAULT_STAT = 'lstat';
var DEFAULT_CONCURRENCY = 50; // select default concurrency TODO: https://github.com/kmalakoff/readdirp-walk/issues/3

// TODO: implement global concurrency https://github.com/kmalakoff/readdirp-walk/issues/1
var asyncEachLimit = require('each-limit');
function limitEachFn(limit) { return function(array, fn, callback) { asyncEachLimit(array, limit, fn, callback); }; }

function keepResult(result) { return isUndefined(result) ? true : result; }

function processDirectory(fullPath, options, callback) {
  options.fs.realpath(fullPath, function(err, realPath) {
    if (err) return callback(err);

    options.fs.readdir(realPath, function(err, names) {
      if (err) return callback(err);

      var fullPaths = names.map(function(name) { return sysPath.join(realPath, name); });
      options.each(fullPaths, function(fullPath, callback) { process(fullPath, options, callback); }, callback);
    });
  });
}

function processFilter(fullPath, options, callback) {
  var path = sysPath.relative(options.cwd, fullPath); // the path to the link, file, or directory

  // early exit optimization: filter without stats
  if (!options.stats) {
    var _callback = callback;
    callback = function(err, result) { // wrap callback with stats
      if (err) return _callback(err);
      if (!keepResult(result)) return _callback(null, false);
      options.stat(fullPath, function(err, stats) { err ? _callback(err) : _callback(null, true, stats); });
    }

    if (options.async)
      options.filter(path, callback);
    else
      callback(null, options.filter(path));
  }

  // full processing: filter with stats
  else {
    options.stat(fullPath, function(err, stats) {
      if (err) return callback(err);

      if (options.async)
        options.filter(path, stats, function(err, result) {
          err ? callback(err) : callback(null, keepResult(result), stats);
        });
      else
        callback(null, keepResult(options.filter(path, stats)), stats);
    });
  }
}

function process(fullPath, options, callback) {
  processFilter(fullPath, options, function(err, keep, stats) {
    if (err || !keep) return callback();

    // a directory, file or symlink
    stats.isDirectory() ? processDirectory(fullPath, options, callback) : callback();
  })
}

module.exports = function(cwd, filter, options, callback) {
  if (arguments.length === 3) { callback = options; options = {}; }

  options = isObject(options) ? assign({}, options) : {stats: options};
  options.filter = filter;
  options.fs = options.fs || DEFAULT_FS;
  options.stat = options.fs[options.stat || DEFAULT_STAT].bind(options.fs);
  options.each = options.each || limitEachFn(options.concurrency || DEFAULT_CONCURRENCY);

  options.fs.realpath(cwd, function(err, realCWD) {
    if (err) return callback(err);

    options.cwd = realCWD;
    process(cwd, options, callback);
  })
}
