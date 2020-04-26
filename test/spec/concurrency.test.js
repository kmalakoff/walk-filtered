var assert = require('assert');
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');

var walk = require('../..');
var statsSpys = require('../lib/statsSpys');

var DIR = path.resolve(path.join(__dirname, '..', 'data'));
var STRUCTURE = {
  file1: 'a',
  file2: 'b',
  dir1: null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  link1: '~dir3/dir4/file1',
  'dir3/link2': '~dir2/file1',
};

describe('concurrency', function () {
  after(function (done) {
    rimraf(DIR, done);
  });

  describe('synchronous', function () {
    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('should run with concurrency 1', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats, entry.path);
        },
        { concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats, entry.path);
        },
        { concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats, entry.path);
        },
        { concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });
  });

  describe('callbacks', function () {
    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('should run with concurrency 1', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats, entry.path);
          setTimeout(callback, 10);
        },
        { callbacks: true, concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats, entry.path);
          setTimeout(callback, 10);
        },
        { callbacks: true, concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats, entry.path);
          setTimeout(callback, 10);
        },
        { callbacks: true, concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });
  });

  describe('promise', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('should run with concurrency 1', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats, entry.path);
          return Promise.resolve();
        },
        { concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats, entry.path);
          return Promise.resolve();
        },
        { concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats, entry.path);
          return Promise.resolve();
        },
        { concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });
  });
});
