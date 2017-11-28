const sysPath = require('path');
const Benchmark = require('benchmark');

const walk = require('../..');
const fs = require('fs');
const gfs = require('graceful-fs');

const asyncEach = require('async-each-series');
const asyncEachParallel = require('async-each');
const asyncEachLimit = require('each-limit');

function serialOptionsFn(fs1) { return { fs: fs1, each: asyncEach }; }
function paralleOptionsFn(fs1) { return { fs: fs1, each: asyncEachParallel }; }
function parallelLimitOptionsFn(fs1, limit) {
  return { fs: fs1, each(array, fn, callback) { asyncEachLimit(array, limit, fn, callback); } };
}

module.exports = function run(dir, callback) {
  const relativeDir = dir.replace(`${sysPath.resolve(sysPath.join(__dirname, '..', '..'))}/`, '');

  new Benchmark.Suite(`Walk ${relativeDir}`)
    .add('Default options', (deferred) => {
      walk(dir, () => {}, (err) => { err ? deferred.reject() : deferred.resolve(); });
    }, { defer: true })

    .add('Serial (fs)', (deferred) => {
      walk(dir, () => {}, serialOptionsFn(fs), (err) => { err ? deferred.reject() : deferred.resolve(); });
    }, { defer: true })

    .add('Parallel (fs)', (deferred) => {
      walk(dir, () => {}, paralleOptionsFn(fs), (err) => { err ? deferred.reject() : deferred.resolve(); });
    }, { defer: true })
    .add('Parallel (gfs)', (deferred) => {
      walk(dir, () => {}, paralleOptionsFn(gfs), (err) => { err ? deferred.reject() : deferred.resolve(); });
    }, { defer: true })

    .add('Parallel limit (fs, 10)', (deferred) => {
      walk(dir, () => {}, parallelLimitOptionsFn(fs, 10), (err) => { err ? deferred.reject() : deferred.resolve(); });
    }, { defer: true })
    .add('Parallel limit (fs, 50)', (deferred) => {
      walk(dir, () => {}, parallelLimitOptionsFn(fs, 50), (err) => { err ? deferred.reject() : deferred.resolve(); });
    }, { defer: true })
    .add('Parallel limit (fs, 100)', (deferred) => {
      walk(dir, () => {}, parallelLimitOptionsFn(fs, 100), (err) => { err ? deferred.reject() : deferred.resolve(); });
    }, { defer: true })

    .add('Parallel limit (gfs, 10)', (deferred) => {
      walk(dir, () => {}, parallelLimitOptionsFn(gfs, 10), (err) => { err ? deferred.reject() : deferred.resolve(); });
    }, { defer: true })
    .add('Parallel limit (gfs, 50)', (deferred) => {
      walk(dir, () => {}, parallelLimitOptionsFn(gfs, 50), (err) => { err ? deferred.reject() : deferred.resolve(); });
    }, { defer: true })
    .add('Parallel limit (gfs, 100)', (deferred) => {
      walk(dir, () => {}, parallelLimitOptionsFn(gfs, 100), (err) => { err ? deferred.reject() : deferred.resolve(); });
    }, { defer: true })

    .on('start', function start() { console.log(`Comparing ${this.name}`); })
    .on('cycle', (event) => { console.log(String(event.target)); })
    .on('complete', function complete() {
      console.log(`Fastest is ${this.filter('fastest')[0].name}`);
      if (callback) callback();
    })
    .run({ async: true, maxTime: 1000 });
};
