var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');
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
  filelink1: '~dir3/dir4/file1',
  'dir3/filelink2': '~dir2/file1',
};

describe('legacy', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, DIR));

  describe('async', function () {
    it('Should filter everything under the root directory', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats);
          setTimeout(function () {
            callback(null, false);
          }, 10);
        },
        { async: true },
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
          }, 10);
        },
        { async: true },
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
            callback(null, !entry.stats.isDirectory() || startsWith(entry.path, 'dir3/dir4'));
          }, 10);
        },
        { async: true },
        function () {
          assert.ok(spys.callCount, 13 - 1);
          done();
        }
      );
    });
  });
});
