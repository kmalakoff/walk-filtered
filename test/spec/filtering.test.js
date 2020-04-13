var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var sinon = require('sinon');
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');

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

function startsWith(string, start) {
  return string.substring(0, start.length) === start;
}
function sleep(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}

describe('filtering', function () {
  after(function (done) {
    rimraf(DIR, done);
  });

  describe('sync', function () {
    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('Should filter everything under the root directory', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function () {
          filterSpy();
          return false;
        },
        function () {
          assert.ok(filterSpy.callCount, 1);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function (entry) {
          filterSpy();
          return entry.path !== 'dir2';
        },
        true,
        function () {
          assert.ok(filterSpy.callCount, 13 - 2);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function (entry) {
          filterSpy();
          return !entry.stats.isDirectory() || startsWith(entry.path, 'dir3/dir4');
        },
        { alwaysStat: true },
        function () {
          assert.ok(filterSpy.callCount, 13 - 1);
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

    it('Should filter everything under the root directory', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function (entry, callback) {
          filterSpy();
          setTimeout(function () {
            callback(null, false);
          }, 10);
        },
        { async: true },
        function () {
          assert.ok(filterSpy.callCount, 1);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function (entry, callback) {
          filterSpy();
          setTimeout(function () {
            callback(null, entry.path !== 'dir2');
          }, 10);
        },
        { async: true },
        function () {
          assert.ok(filterSpy.callCount, 13 - 2);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function (entry) {
          filterSpy();
          setTimeout(function () {
            done(null, !entry.stats.isDirectory() || startsWith(entry.path, 'dir3/dir4'));
          }, 10);
        },
        { async: true, alwaysStat: true },
        function () {
          assert.ok(filterSpy.callCount, 13 - 1);
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

    it('Should filter everything under the root directory', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function () {
          filterSpy();
          return sleep(10).then(function () {
            return false;
          });
        },
        function () {
          assert.ok(filterSpy.callCount, 1);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function (entry) {
          filterSpy();
          return sleep(10).then(function () {
            return path !== 'dir2';
          });
        },
        function () {
          assert.ok(filterSpy.callCount, 13 - 2);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function (entry) {
          filterSpy();
          return sleep(10).then(function () {
            return !entry.stats.isDirectory() || startsWith(entry.path, 'dir3/dir4');
          });
        },
        { alwaysStat: true },
        function () {
          assert.ok(filterSpy.callCount, 13 - 1);
          done();
        }
      );
    });
  });
});
