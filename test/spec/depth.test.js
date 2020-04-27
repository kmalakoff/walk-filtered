var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf2');
var generate = require('fs-generate');
var statsSpys = require('fs-stats-spys');

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

describe('depth', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, DIR));

  describe('synchronous', function () {
    it('depth 0', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats);
        },
        { depth: 0, lstat: true },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 3);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('depth 1', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats);
        },
        { depth: 1, lstat: true },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 4);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth 2', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats);
        },
        { depth: 2, lstat: true },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          spys(entry.stats);
        },
        { depth: Infinity, lstat: true },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });

  describe('callbacks', function () {
    it('depth 0', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats);
          setTimeout(callback, 10);
        },
        {
          depth: 0,
          lstat: true,
          callbacks: true,
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 3);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('depth 1', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats);
          setTimeout(callback, 10);
        },
        {
          depth: 1,
          lstat: true,
          callbacks: true,
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 4);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth 2', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats);
          setTimeout(callback, 10);
        },
        {
          depth: 2,
          lstat: true,
          callbacks: true,
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats);
          setTimeout(callback, 10);
        },
        {
          depth: Infinity,
          lstat: true,
          callbacks: true,
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });

  describe('promise', function () {
    if (typeof Promise === 'undefined') return; // no promise support

    it('depth 0', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats);
          return Promise.resolve();
        },
        {
          depth: 0,
          lstat: true,
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 3);
          assert.equal(spys.file.callCount, 2);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('depth 1', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats);
          return Promise.resolve();
        },
        {
          depth: 1,
          lstat: true,
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 4);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth 2', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats);
          return Promise.resolve();
        },
        {
          depth: 2,
          lstat: true,
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('depth Infinity', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          spys(entry.stats);
          return Promise.resolve();
        },
        {
          depth: Infinity,
          lstat: true,
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });
});
