var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf2');
var generate = require('fs-generate');
var statsSpys = require('fs-stats-spys');
var startsWith = require('starts-with');

var walk = require('../..');

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
var DIR_PATH = 'dir3' + path.sep + 'dir4';

describe('filtering', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, DIR));

  describe('synchronous', function () {
    it('Should filter everything under the root directory', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats);
          return false;
        },
        function () {
          assert.ok(spys.callCount, 1);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats);
          return entry.path !== 'dir2';
        },
        true,
        function () {
          assert.ok(spys.callCount, 13 - 2);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats);
          return !entry.stats.isDirectory() || startsWith(entry.path, DIR_PATH);
        },
        { alwaysStat: true },
        function () {
          assert.ok(spys.callCount, 13 - 1);
          done();
        }
      );
    });
  });

  describe('callbacks', function () {
    it('Should filter everything under the root directory', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats);
          setTimeout(function () {
            callback(null, false);
          });
        },
        { callbacks: true },
        function () {
          assert.ok(spys.callCount, 1);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats);
          setTimeout(function () {
            callback(null, entry.path !== 'dir2');
          });
        },
        { callbacks: true },
        function () {
          assert.ok(spys.callCount, 13 - 2);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats);
          setTimeout(function () {
            callback(null, !entry.stats.isDirectory() || startsWith(entry.path, DIR_PATH));
          });
        },
        { callbacks: true },
        function () {
          assert.ok(spys.callCount, 13 - 1);
          done();
        }
      );
    });
  });

  describe('promise', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    it('Should filter everything under the root directory', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats);
          return Promise.resolve(false);
        },
        function () {
          assert.ok(spys.callCount, 1);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats);
          return Promise.resolve(path !== 'dir2');
        },
        function () {
          assert.ok(spys.callCount, 13 - 2);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats);
          return Promise.resolve(!entry.stats.isDirectory() || startsWith(entry.path, DIR_PATH));
        },
        { alwaysStat: true },
        function () {
          assert.ok(spys.callCount, 13 - 1);
          done();
        }
      );
    });
  });
});
