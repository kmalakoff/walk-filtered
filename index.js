var fs = require('fs');
var pathJoin = require('path').join;
var EventEmitter = require('component-emitter');
var assign = require('lodash.assign');

// TODO: find a smaller, optimized version of eachSeries
var async = require('async');
var each = async.eachSeries; // import each from 'each-series';

function processPreStat(path, options, callback) {
  var fullPath = path ? pathJoin(options.cwd, path) : options.cwd;

  fs.stat(fullPath, function(err, stat) {
    if (err) return callback(err);

    if (path && options.filter && options.filter(path, stat)) return callback();

    if (stat.isDirectory()) {
      !path || options.emitter.emit('directory', path, stat);

      fs.readdir(fullPath, function(err, names) {
        if (err) return callback(err);

        var paths = names.map(function(name) { return path ? pathJoin(path, name) : name; });
        each(paths, function(path, callback) { processPreStat(path, options, callback); }, callback);
      });
    }
    else {
      !path || options.emitter.emit('file', path, stat);
      callback();
    }
  });
}

function processPostStat(path, options, callback) {
  var fullPath = path ? pathJoin(options.cwd, path) : options.cwd;

  fs.stat(fullPath, function(err, stat) {
    if (err) return callback(err);

    if (stat.isDirectory()) {
      options.emitter.emit('directory', path, stat);

      fs.readdir(fullPath, function(err, names) {
        if (err) return callback(err);

        var paths = names.map(function(name) { return path ? pathJoin(path, name) : name; });
        if (options.filter) paths = paths.filter(options.filter);
        if (!paths.length) return callback();
        each(paths, function(path, callback) { processPostStat(path, options, callback); }, callback);
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
  options = (typeof options == 'function') ? {filter: options} : assign({}, options);
  assign(options, {cwd, emitter});

  options.preStat ? processPreStat(null, options, callback) : processPostStat(null, options, callback);
  return emitter;
}
