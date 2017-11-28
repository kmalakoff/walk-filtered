const sysPath = require('path');
const assign = require('lodash.assign');
const isUndefined = require('lodash.isundefined');
const isObject = require('lodash.isobject');

const DEFAULT_FS = require('graceful-fs');

const DEFAULT_STAT = 'lstat';
const DEFAULT_CONCURRENCY = 50; // select default concurrency TODO: https://github.com/kmalakoff/readdirp-walk/issues/3

function isPromise(obj) { return !!obj && (typeof obj === 'object') && (typeof obj.then === 'function'); }

// TODO: implement global concurrency https://github.com/kmalakoff/readdirp-walk/issues/1
const asyncEachLimit = require('each-limit');

function limitEachFn(limit) { return (array, fn, callback) => { asyncEachLimit(array, limit, fn, callback); }; }

function getResult(result) { return isUndefined(result) ? true : result; }
function processKeep(keep, callback, stats) {
  if (isPromise(keep)) {
    keep
      .then((resolvedKeep) => {
        try { callback(null, getResult(resolvedKeep), stats); } catch (err2) { /* */ }
      })
      .catch((err2) => { callback(err2); });
  } else {
    callback(null, getResult(keep), stats);
  }
}

function processDirectory(fullPath, options, callback) {
  options.fs.realpath(fullPath, (err, realPath) => {
    if (err) return callback(err);

    options.fs.readdir(realPath, (err2, names) => {
      if (err2) return callback(err2);

      const fullPaths = names.map(name => sysPath.join(realPath, name));
      options.each(fullPaths, (fullPath2, callback2) => { processPath(fullPath2, options, callback2); }, callback); // eslint-disable-line no-use-before-define
    });
  });
}

function processFilter(fullPath, options, callback) {
  const path = sysPath.relative(options.cwd, fullPath); // the path to the link, file, or directory

  // early exit optimization: filter without stats
  if (!options.stats) {
    const callbackWrapper = callback;
    callback = (err, result) => { // eslint-disable-line no-param-reassign
      if (err) return callbackWrapper(err);
      if (!getResult(result)) return callbackWrapper(null, false);
      options.stat(fullPath, (err2, stats) => { err2 ? callbackWrapper(err2) : callbackWrapper(null, true, stats); });
    };

    // filter
    options.async ? options.filter(path, callback) : processKeep(options.filter(path), callback);

  // full processing: filter with stats
  } else {
    options.stat(fullPath, (err, stats) => {
      if (err) return callback(err);

      // filter
      if (!options.async) return processKeep(options.filter(path, stats), callback, stats);
      options.filter(path, stats, (err2, result) => { err2 ? callback(err2) : callback(null, getResult(result), stats); });
    });
  }
}

function processPath(fullPath, options, callback) {
  processFilter(fullPath, options, (err, keep, stats) => {
    if (err || !keep) return callback();

    // a directory, file or symlink
    stats.isDirectory() ? processDirectory(fullPath, options, callback) : callback();
  });
}

module.exports = function walkFiltered(cwd, filter, options, callback) {
  if (arguments.length === 3) { callback = options; options = {}; } // eslint-disable-line no-param-reassign

  /* eslint-disable */
  options = isObject(options) ? assign({}, options) : { stats: options };
  options.filter = filter;
  options.fs = options.fs || DEFAULT_FS;
  options.stat = options.fs[options.stat || DEFAULT_STAT].bind(options.fs);
  options.each = options.each || limitEachFn(options.concurrency || DEFAULT_CONCURRENCY);
  /* eslint-enable */

  options.fs.realpath(cwd, (err, realCWD) => {
    if (err) return callback(err);

    options.cwd = realCWD; // eslint-disable-line no-param-reassign
    processPath(cwd, options, callback);
  });
};
