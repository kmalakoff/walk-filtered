var chai = require('chai');
chai.use(require('sinon-chai'));

var assert = chai.assert;
var generate = require('fs-generate');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');

var walk = require('../..');
var statsSpys = require('../utils').statsSpys;

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

describe('depth', function () {
  after(function (done) {
    rimraf(DIR, done);
  });

  describe('sync', function () {
    beforeEach(function (done) {
      rimraf(DIR, function () {
        generate(DIR, STRUCTURE, done);
      });
    });

    it('depth 0', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry) {
          var stats = fs.lstatSync(path.join(DIR, entry.path));
          spys(stats, entry.path);
        },
        { depth: 0 },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
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
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
        { depth: 1 },
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
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
        { depth: 2 },
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
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
        },
        { depth: Infinity },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
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

    it('depth 0', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
          setTimeout(callback, 10);
        },
        {
          depth: 0,
          async: true,
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
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
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
          setTimeout(callback, 10);
        },
        {
          depth: 1,
          async: true,
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
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
          setTimeout(callback, 10);
        },
        {
          depth: 2,
          async: true,
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
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
          setTimeout(callback, 10);
        },
        {
          depth: Infinity,
          async: true,
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
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

    it('depth 0', function (done) {
      var spys = statsSpys();

      walk(
        DIR,
        function (entry, callback) {
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
          return sleep(10);
        },
        {
          depth: 0,
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 1);
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
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
          return sleep(10);
        },
        {
          depth: 1,
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
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
          return sleep(10);
        },
        {
          depth: 2,
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
          var stats = fs.lstatSync(entry.fullPath);
          spys(stats, entry.path);
          return sleep(10);
        },
        {
          depth: Infinity,
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });
});
