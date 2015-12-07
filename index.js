var pathJoin = require('path').join;
var relative = require('path').relative;
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

function process(fullPath, options, callback) {
  var path = relative(options.cwd, fullPath); // the path to the link, file, or directory
  if (!options.preStat && !options.filter(path)) return callback(); // filter before stats

  // stat the path to the link, file, or directory
  options.stat(fullPath, function(err, stat) {
    if (err) return callback(err);

    if (options.preStat && !options.filter(path, stat)) return callback(); // filter with after and with stats

    // a file or symlink
    if (!stat.isDirectory()) { options.emitter.emit('file', path, stat); return callback(); }

    // a directory
    options.emitter.emit('directory', path, stat);
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

var DEFAULTS = require('./defaults');

module.exports = function(cwd, options, callback) {
  if (arguments.length === 2) { callback = options; options = {}; };

  options = (typeof options == 'function') ? {filter: options} : assign({}, options);
  options.emitter= new EventEmitter();
  options.fs = options.fs || DEFAULTS.fs;
  options.each = options.each || DEFAULTS.each;

  options.filter = options.filter || function() { return true; }
  options.stat = options.fs[options.stat || 'stat'].bind(options.fs);

  options.fs.realpath(cwd, function(err, realCWD) {
    if (err) return emitter.emit('error', err);

    options.cwd = realCWD;
    process(cwd, options, callback);
  })
  return options.emitter;
}
