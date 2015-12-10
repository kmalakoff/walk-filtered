var pathJoin = require('path').join;
var relative = require('path').relative;
var assign = require('object-assign');
var isUndefined = require('lodash.isundefined');
var isObject = require('lodash.isobject');

var DEFAULT_FS = require('graceful-fs');
var DEFAULT_CONCURRENCY = 50; // select default concurrency TODO: https://github.com/kmalakoff/readdirp-walk/issues/3

// TODO: implement global concurrency https://github.com/kmalakoff/readdirp-walk/issues/1
var eachlimit = require('each-limit');
function limitEachFn(limit) { return function(array, fn, callback) { eachlimit(array, limit, fn, callback); }; }

function process(fullPath, options, callback) {
  var path = relative(options.cwd, fullPath); // the path to the link, file, or directory
  if (!options.includeStat && !options.filterIter(path)) return callback(); // filter before stats

  // stat the path to the link, file, or directory
  options.stat(fullPath, function(err, stat) {
    if (err) return callback(err);

    if (options.includeStat && !options.filterIter(path, stat)) return callback(); // filter with after and with stats

    // a file or symlink
    if (!stat.isDirectory()) return callback();

    // a directory
    options.fs.realpath(fullPath, function(err, realPath) {
      if (err) return callback(err);

      options.fs.readdir(realPath, function(err, names) {
        if (err) return callback(err);

        var fullPaths = names.map(function(name) { return pathJoin(realPath, name); });
        options.each(fullPaths, function(fullPath, callback) { process(fullPath, options, callback); }, callback);
      });
    });
  });
}

module.exports = function(cwd, filter, options, callback) {
  if (arguments.length === 3) { callback = options; options = {}; }

  options = isObject(options) ? assign({}, options) : {includeStat: options};
  options.fs = options.fs || DEFAULT_FS;
  options.stat = options.fs[options.stat || 'stat'].bind(options.fs);
  options.each = options.each || limitEachFn(options.concurrency || DEFAULT_CONCURRENCY);
  options.filterIter = function(path, stat) { var result = filter(path, stat); return isUndefined(result) ? true : result; }

  options.fs.realpath(cwd, function(err, realCWD) {
    if (err) return emitter.emit('error', err);

    options.cwd = realCWD;
    process(cwd, options, callback);
  })
}
