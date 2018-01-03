var sysPath = require('path');
var Benchmark = require('benchmark');
var fs = require('fs');
var gfs = require('graceful-fs');
var asyncEach = require('async-each-series');
var asyncEachParallel = require('async-each');
var asyncEachLimit = require('each-limit');

var walk = require('../..');

function serialOptionsFn(fs1) {
  return { fs: fs1, each: asyncEach };
}
function paralleOptionsFn(fs1) {
  return { fs: fs1, each: asyncEachParallel };
}
function parallelLimitOptionsFn(fs1, limit) {
  return {
    fs: fs1,
    each: function(array, fn, callback) {
      asyncEachLimit(array, limit, fn, callback);
    }
  }; // eslint-disable-line object-shorthand
}

module.exports = function run(dir, callback) {
  var relativeDir = dir.replace(sysPath.resolve(sysPath.join(__dirname, '..', '..')), '');

  new Benchmark.Suite('Walk ' + relativeDir)
    .add(
      'Default options',
      function(deferred) {
        walk(
          dir,
          function() {},
          function(err) {
            err ? deferred.reject() : deferred.resolve();
          }
        );
      },
      { defer: true }
    )

    .add(
      'Serial (fs)',
      function(deferred) {
        walk(dir, function() {}, serialOptionsFn(fs), function(err) {
          err ? deferred.reject() : deferred.resolve();
        });
      },
      { defer: true }
    )

    .add(
      'Parallel (fs)',
      function(deferred) {
        walk(dir, function() {}, paralleOptionsFn(fs), function(err) {
          err ? deferred.reject() : deferred.resolve();
        });
      },
      { defer: true }
    )
    .add(
      'Parallel (gfs)',
      function(deferred) {
        walk(dir, function() {}, paralleOptionsFn(gfs), function(err) {
          err ? deferred.reject() : deferred.resolve();
        });
      },
      { defer: true }
    )

    .add(
      'Parallel limit (fs, 10)',
      function(deferred) {
        walk(dir, function() {}, parallelLimitOptionsFn(fs, 10), function(err) {
          err ? deferred.reject() : deferred.resolve();
        });
      },
      { defer: true }
    )
    .add(
      'Parallel limit (fs, 50)',
      function(deferred) {
        walk(dir, function() {}, parallelLimitOptionsFn(fs, 50), function(err) {
          err ? deferred.reject() : deferred.resolve();
        });
      },
      { defer: true }
    )
    .add(
      'Parallel limit (fs, 100)',
      function(deferred) {
        walk(dir, function() {}, parallelLimitOptionsFn(fs, 100), function(err) {
          err ? deferred.reject() : deferred.resolve();
        });
      },
      { defer: true }
    )

    .add(
      'Parallel limit (gfs, 10)',
      function(deferred) {
        walk(dir, function() {}, parallelLimitOptionsFn(gfs, 10), function(err) {
          err ? deferred.reject() : deferred.resolve();
        });
      },
      { defer: true }
    )
    .add(
      'Parallel limit (gfs, 50)',
      function(deferred) {
        walk(dir, function() {}, parallelLimitOptionsFn(gfs, 50), function(err) {
          err ? deferred.reject() : deferred.resolve();
        });
      },
      { defer: true }
    )
    .add(
      'Parallel limit (gfs, 100)',
      function(deferred) {
        walk(dir, function() {}, parallelLimitOptionsFn(gfs, 100), function(err) {
          err ? deferred.reject() : deferred.resolve();
        });
      },
      { defer: true }
    )

    .on('start', function() {
      console.log('Comparing ' + this.name);
    })
    .on('cycle', function(event) {
      console.log(String(event.target));
    })
    .on('complete', function() {
      console.log('Fastest is ' + this.filter('fastest')[0].name);
      if (callback) callback();
    })
    .run({ async: true, maxTime: 1000 });
};
