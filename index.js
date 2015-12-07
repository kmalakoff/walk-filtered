var fs = require('fs');
var pathJoin = require('path').join;
var pathRelative = require('path').relative;
var EventEmitter = require('events').EventEmitter;
var assign = require('lodash.assign');
var eachSeries = require('async-each-series');

function processPreStat(path, options, callback) {
  var fullPath = path ? pathJoin(options.cwd, path) : options.cwd;

  fs.realpath(fullPath, function(err, realFullPath) {
    if (err) return callback(err);

    options.stat(realFullPath, function(err, stat) {
      if (err) return callback(err);

      var relativePath = pathRelative(options.cwd, realFullPath);
      if (relativePath && options.filter && !options.filter(relativePath, stat)) return callback();

      if (stat.isDirectory()) {
        options.emitter.emit('directory', relativePath, stat);

        fs.readdir(realFullPath, function(err, names) {
          if (err) return callback(err);

          var paths = names.map(function(name) { return relativePath ? pathJoin(relativePath, name) : name; });
          eachSeries(paths, function(path, callback) { processPreStat(path, options, callback); }, callback);
        });
      }
      else {
        options.emitter.emit('file', relativePath, stat);
        callback();
      }
    });
  });
}

function processPostStat(path, options, callback) {
  var fullPath = path ? pathJoin(options.cwd, path) : options.cwd;

  options.stat(fullPath, function(err, stat) {
    if (err) return callback(err);

    if (stat.isDirectory()) {
      options.emitter.emit('directory', path, stat);

      fs.readdir(fullPath, function(err, names) {
        if (err) return callback(err);

        var paths = names.map(function(name) { return path ? pathJoin(path, name) : name; });
        if (options.filter) paths = paths.filter(options.filter);
        if (!paths.length) return callback();
        eachSeries(paths, function(path, callback) { processPostStat(path, options, callback); }, callback);
      });
    }
    else {
      options.emitter.emit('file', path, stat);
      callback();
    }
  });
}

module.exports = function(cwd, options, callback) {
  if (!callback) { callback = options; options = {}; }

  var emitter = new EventEmitter()

  fs.realpath(cwd, function(err, realCWD) {
    if (err) return callback(err);

    options = (typeof options == 'function') ? {filter: options} : assign({}, options);
    assign(options, {cwd: realCWD, emitter, stat: fs.stat.bind(fs)});

    options.preStat ? processPreStat('', options, callback) : processPostStat('', options, callback);
  })

  return emitter;
}
