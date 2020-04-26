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

describe('walk everything', function () {
  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(function (done) {
    rimraf(DIR, done);
  });

  it('Should find everything with no return', function (done) {
    var spys = statsSpys();

    walk(
      DIR,
      function (entry) {
        spys(entry.stats, entry.path);
      },
      { lstat: true },
      function () {
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should find everything with return true', function (done) {
    var spys = statsSpys();

    walk(
      DIR,
      function (entry) {
        spys(entry.stats, entry.path);
        return true;
      },
      { lstat: true },
      function () {
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should handle a delete', function (done) {
    var spys = statsSpys();

    walk(
      DIR,
      function (entry) {
        try {
          spys(entry.stats, entry.path);
        } catch (err) {
          return err;
        }

        if (entry.path === 'dir2/file1') rimraf.sync(path.join(DIR, 'dir2'));
        return true;
      },
      { concurrency: 1, lstat: true, alwaysStat: true },
      function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should handle a delete (custom error callback)', function (done) {
    var spys = statsSpys();
    var errors = [];

    walk(
      DIR,
      function (entry) {
        try {
          spys(entry.stats, entry.path);
        } catch (err) {
          return err;
        }

        if (entry.path === 'dir2/file1') rimraf.sync(path.join(DIR, 'dir2'));
        return true;
      },
      {
        concurrency: 1,
        lstat: true,
        alwaysStat: true,
        error: function (err) {
          errors.push(err);
        },
      },
      function (err) {
        assert.ok(!err);
        assert.equal(errors.length, 1);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 2);
        done();
      }
    );
  });

  it('Should handle a delete (custom error callback, false)', function (done) {
    var spys = statsSpys();
    var errors = [];

    walk(
      DIR,
      function (entry) {
        try {
          spys(entry.stats, entry.path);
        } catch (err) {
          return err;
        }

        if (entry.path === 'dir2/file1') rimraf.sync(path.join(DIR, 'dir2'));
        return true;
      },
      {
        concurrency: 1,
        lstat: true,
        alwaysStat: true,
        error: function (err) {
          errors.push(err);
          return false;
        },
      },
      function (err) {
        assert.ok(err);
        assert.equal(errors.length, 1);
        assert.equal(spys.dir.callCount, 2);
        assert.equal(spys.file.callCount, 1);
        assert.equal(spys.link.callCount, 0);
        done();
      }
    );
  });
});
