var sysPath = require('path');
var Benchmark = require('benchmark');

var walk = require('..');
var fs = require('fs');
var gfs = require('graceful-fs');
var readdirp = require('readdirp');
var glob = require('glob');
var micromatch = require('micromatch');
var objectAssign = require('object-assign');

var eachSerial = require('async-each-series');
var eachParallel = require('async-each');
var eachlimit = require('each-limit');

module.exports = function(dir, pattern, callback) {
  pattern = pattern || '';

  var relativeDir = dir.replace(sysPath.resolve(sysPath.join(__dirname, '..', '..')) + '/', '');
  var filter = function() {};

  if (pattern) {
    var matcher = micromatch.matcher(pattern);
    var hasGlobstar = pattern.indexOf('**') > -1;
    filter = function(path, stat) {
      if (hasGlobstar && stat && stat.isDirectory()) return true;
      return matcher(path);
    }
  }

  var defaultOpts = {includeStat: !!pattern};

  var serialOptionsFn = function(fs) {
    return objectAssign(defaultOpts, {fs: fs, each: eachSerial});
  }

  var paralleOptionsFn = function(fs) {
    return objectAssign(defaultOpts, {fs: fs, each: eachParallel});
  }

  var parallelLimitOptionsFn = function(fs, limit) {
    return objectAssign(defaultOpts, {
      fs: fs,
      each: function(array, fn, callback) { eachlimit(array, limit, fn, callback); }
    });
  }

  new Benchmark.Suite('Walk ' + sysPath.join(relativeDir, pattern))
    .add('Default options', function(deferred) {
      walk(dir, filter, defaultOpts, function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})

    .add('Serial (fs)', function(deferred) {
      walk(dir, filter, serialOptionsFn(fs), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})

    .add('Parallel (fs)', function(deferred) {
      walk(dir, filter, paralleOptionsFn(fs), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})
    .add('Parallel (gfs)', function(deferred) {
      walk(dir, filter, paralleOptionsFn(gfs), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})

    .add('Parallel limit (fs, 10)', function(deferred) {
      walk(dir, filter, parallelLimitOptionsFn(fs, 10), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})
    .add('Parallel limit (fs, 50)', function(deferred) {
      walk(dir, filter, parallelLimitOptionsFn(fs, 50), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})
    .add('Parallel limit (fs, 100)', function(deferred) {
      walk(dir, filter, parallelLimitOptionsFn(fs, 100), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})

    .add('Parallel limit (gfs, 10)', function(deferred) {
      walk(dir, filter, parallelLimitOptionsFn(gfs, 10), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})
    .add('Parallel limit (gfs, 50)', function(deferred) {
      walk(dir, filter, parallelLimitOptionsFn(gfs, 50), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})
    .add('Parallel limit (gfs, 100)', function(deferred) {
      walk(dir, filter, parallelLimitOptionsFn(gfs, 100), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})

    .add('readdirp', function(deferred) {
      readdirp({root: dir, filter: pattern})
        .on('error', function() {deferred.reject()})
        .on('data', Function.prototype)
        .on('end', function() {deferred.resolve()});
    }, {defer: true})

    .add('glob', function(deferred) {
      glob(sysPath.join(dir, pattern || '/**/*'), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})

    .on('start', function() { console.log('Comparing ' + this.name); })
    .on('cycle', function(event) { console.log(String(event.target)); })
    .on('complete', function() {
      console.log('Fastest is ' + this.filter('fastest').pluck('name'));
      !callback || callback();
    })
    .run({async: true, maxTime: 1000});
}
