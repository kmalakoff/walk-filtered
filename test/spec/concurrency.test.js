var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var sinon = require('sinon');
var generate = require('fs-generate');
var rimraf = require('rimraf');
var sysPath = require('path');

var walk = require('../..');

var DIR = sysPath.resolve(sysPath.join(__dirname, '..', 'data'));
var STRUCTURE = {
  file1: 'a',
  file2: 'b',
  dir1: null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  link1: '~dir3/dir4/file1',
  'dir3/link2': '~dir2/file1'
};

function sleep(timeout) {
  return new Promise(function(resolve) {
    setTimeout(resolve, timeout);
  });
}

describe('concurrency', function() {
  after(function(callback) {
    rimraf(DIR, callback);
  });

  describe('sync', function() {
    beforeEach(function(callback) {
      rimraf(DIR, function() {
        generate(DIR, STRUCTURE, callback);
      });
    });

    it('should run with concurrency 1', function(callback) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function() {
          filterSpy();
        },
        { concurrency: 1 },
        function(err) {
          assert.ok(filterSpy.callCount, 13);
          callback(err);
        }
      );
    });

    it('should run with concurrency 5', function(callback) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function() {
          filterSpy();
        },
        { concurrency: 5 },
        function(err) {
          assert.ok(filterSpy.callCount, 13);
          callback(err);
        }
      );
    });

    it('should run with concurrency Infinity', function(callback) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function() {
          filterSpy();
        },
        { concurrency: Infinity },
        function(err) {
          assert.ok(filterSpy.callCount, 13);
          callback(err);
        }
      );
    });
  });

  describe('async', function() {
    beforeEach(function(callback) {
      rimraf(DIR, function() {
        generate(DIR, STRUCTURE, callback);
      });
    });

    it('should run with concurrency 1', function(callback) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function(path, callback2) {
          filterSpy();
          setTimeout(callback2, 100);
        },
        { async: true, concurrency: 1, stats: false },
        function(err) {
          assert.ok(filterSpy.callCount, 13);
          callback(err);
        }
      );
    });

    it('should run with concurrency 5', function(callback) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function(path, callback2) {
          filterSpy();
          setTimeout(callback2, 100);
        },
        { async: true, concurrency: 5, stats: false },
        function(err) {
          assert.ok(filterSpy.callCount, 13);
          callback(err);
        }
      );
    });

    it('should run with concurrency Infinity', function(callback) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function(path, callback2) {
          filterSpy();
          setTimeout(callback2, 100);
        },
        { async: true, concurrency: Infinity, stats: false },
        function(err) {
          assert.ok(filterSpy.callCount, 13);
          callback(err);
        }
      );
    });
  });

  describe('promise', function() {
    if (typeof Promise === 'undefined') return; // no promise support

    beforeEach(function(callback) {
      rimraf(DIR, function() {
        generate(DIR, STRUCTURE, callback);
      });
    });

    it('should run with concurrency 1', function(callback) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function() {
          filterSpy();
          return sleep(100);
        },
        { concurrency: 1 },
        function(err) {
          assert.ok(filterSpy.callCount, 13);
          callback(err);
        }
      );
    });

    it('should run with concurrency 5', function(callback) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function() {
          filterSpy();
          return sleep(100);
        },
        { concurrency: 5 },
        function(err) {
          assert.ok(filterSpy.callCount, 13);
          callback(err);
        }
      );
    });

    it('should run with concurrency Infinity', function(callback) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function() {
          filterSpy();
          return sleep(100);
        },
        { concurrency: Infinity },
        function() {
          assert.ok(filterSpy.callCount, 13);
          callback();
        }
      );
    });
  });
});
