var fs = require('fs');
var pathJoin = require('path').join;
var relative = require('path').relative;
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var each = require('async-each-series');

function process(fullPath, options, callback) {
  var path = relative(options.cwd, fullPath); // the path to the link, file, or directory
  if (options.lazyStats && !options.filter(path)) return callback(); // filter before stats

  // stat the path to the link, file, or directory
  options.stat(fullPath, function(err, stat) {
    if (err) return callback(err);

    if (!options.lazyStats && !options.filter(path, stat)) return callback(); // filter with after and with stats

    // a file or symlink
    if (!stat.isDirectory()) { options.emitter.emit('file', path, stat); return callback(); }

    // a directory
    options.emitter.emit('directory', path, stat);
    fs.realpath(fullPath, function(err, realPath) {
      if (err) return callback(err);

      fs.readdir(realPath, function(err, names) {
        if (err) return callback(err);

        var fullPaths = names.map(function(name) { return pathJoin(realPath, name); });
        each(fullPaths, function(fullPath, callback) { process(fullPath, options, callback); }, callback);
      });
    });
  });
}

module.exports = function(cwd, options, callback) {
  options = (typeof options == 'function') ? {filter: options} : options;
  if (!options.filter) throw new Error('walk-filtered: missing filter option');

  var emitter = new EventEmitter()
  fs.realpath(cwd, function(err, realCWD) {
    if (err) return emitter.emit('error', err);
    options = assign({}, options, {cwd: realCWD, emitter, stat: options.lstat ? fs.lstat.bind(fs) : fs.stat.bind(fs)});
    process(cwd, options, callback);
  })
  return emitter;
}
