var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');

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

function sleep(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}

describe('errors', function () {
  after(function (done) {
    rimraf(DIR, done);
  });

  describe('sync', function () {
    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('should propagate errors', function (done) {
      walk(
        DIR,
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

  describe('async', function () {
    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('should propagate errors', function (done) {
      walk(
        DIR,
        function (entry, callback) {
          setTimeout(function () {
            callback(new Error('Failed'));
          }, 10);
        },
        { async: true },
        function (err) {
          assert.ok(!!err);
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

    it('should propagate errors', function (done) {
      walk(
        DIR,
        function () {
          return sleep(10).then(function () {
            throw new Error('Failed');
          });
        },
        function (err) {
          assert.ok(!!err);
          done();
        }
      );
    });
  });
});
