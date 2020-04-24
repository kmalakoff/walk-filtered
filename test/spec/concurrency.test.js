var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var sinon = require('sinon');
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
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function () {
          filterSpy();
        },
        { concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.ok(filterSpy.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function () {
          filterSpy();
        },
        { concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.ok(filterSpy.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function () {
          filterSpy();
        },
        { concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.ok(filterSpy.callCount, 13);
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
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function (entry, callback) {
          filterSpy();
          setTimeout(callback, 10);
        },
        { callbacks: true, concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.ok(filterSpy.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function (entry, callback) {
          filterSpy();
          setTimeout(callback, 10);
        },
        { callbacks: true, concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.ok(filterSpy.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function (entry, callback) {
          filterSpy();
          setTimeout(callback, 10);
        },
        { callbacks: true, concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.ok(filterSpy.callCount, 13);
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
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function () {
          filterSpy();
          return sleep(10);
        },
        { concurrency: 1 },
        function (err) {
          assert.ok(!err);
          assert.ok(filterSpy.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function () {
          filterSpy();
          return sleep(10);
        },
        { concurrency: 5 },
        function (err) {
          assert.ok(!err);
          assert.ok(filterSpy.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', function (done) {
      var filterSpy = sinon.spy();

      walk(
        DIR,
        function () {
          filterSpy();
          return sleep(10);
        },
        { concurrency: Infinity },
        function (err) {
          assert.ok(!err);
          assert.ok(filterSpy.callCount, 13);
          done();
        }
      );
    });
  });
});
