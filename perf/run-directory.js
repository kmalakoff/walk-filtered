var Benchmark = require('benchmark');

var walk = require('..');
var fs = require('fs');
var gfs = require('graceful-fs');

var eachSerial = require('async-each-series');
var serialOptionsFn = function(fs) { return {fs: fs, each: eachSerial}; }

var eachParallel = require('async-each');
var paralleOptionsFn = function(fs) { return {fs: fs, each: eachParallel}; }

var eachlimit = require('each-limit');
var parallelLimitOptionsFn = function(fs, limit) {
  return {fs: fs, each: function(array, fn, callback) { eachlimit(array, limit, fn, callback); }};
}

module.exports = function(dir, callback) {

  new Benchmark.Suite('Walk ' + dir)
    .add('Serial (fs)', function(deferred) {
      walk(dir, serialOptionsFn(fs), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})

    .add('Parallel (fs)', function(deferred) {
      walk(dir, paralleOptionsFn(fs), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})
    .add('Parallel (gfs)', function(deferred) {
      walk(dir, paralleOptionsFn(gfs), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})

    .add('Parallel limit (fs, 10)', function(deferred) {
      walk(dir, parallelLimitOptionsFn(fs, 10), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})
    .add('Parallel limit (fs, 50)', function(deferred) {
      walk(dir, parallelLimitOptionsFn(fs, 50), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})
    .add('Parallel limit (fs, 100)', function(deferred) {
      walk(dir, parallelLimitOptionsFn(fs, 100), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})

    .add('Parallel limit (gfs, 10)', function(deferred) {
      walk(dir, parallelLimitOptionsFn(gfs, 10), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})
    .add('Parallel limit (gfs, 50)', function(deferred) {
      walk(dir, parallelLimitOptionsFn(gfs, 50), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})
    .add('Parallel limit (gfs, 100)', function(deferred) {
      walk(dir, parallelLimitOptionsFn(gfs, 100), function(err) { err ? deferred.reject() : deferred.resolve();});
    }, {defer: true})

    .on('start', function() { console.log('Comparing ' + this.name); })
    .on('cycle', function(event) { console.log(String(event.target)); })
    .on('complete', function() {
      console.log('Fastest is ' + this.filter('fastest').pluck('name'));
      !callback || callback();
    })
    .run({async: true, maxTime: 1000});
}
