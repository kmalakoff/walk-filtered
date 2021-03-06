var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');
var generate = require('fs-generate');

var walk = require('../..');

var TEST_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp', 'test'));
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

describe('errors', function () {
  beforeEach(function (done) {
    rimraf(TEST_DIR, function () {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, TEST_DIR));

  describe('synchronous', function () {
    it('should propagate errors', function (done) {
      walk(
        TEST_DIR,
        function () {
          return new Error('Failed');
        },
        { concurrency: 1 },
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });
  });

  describe('callbacks', function () {
    it('should propagate errors', function (done) {
      walk(
        TEST_DIR,
        function (entry, callback) {
          setTimeout(function () {
            callback(new Error('Failed'));
          }, 10);
        },
        { callbacks: true },
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });
  });

  describe('promise', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    it('should propagate errors', function (done) {
      walk(
        TEST_DIR,
        function () {
          return Promise.reject(new Error('Failed'));
        },
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });
  });
});
