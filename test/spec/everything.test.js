var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');
var generate = require('fs-generate');
var statsSpys = require('fs-stats-spys');

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

describe('walk everything', function () {
  beforeEach(function (done) {
    rimraf(TEST_DIR, function () {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, TEST_DIR));

  it('Should find everything with no return', function (done) {
    var spys = statsSpys();

    walk(
      TEST_DIR,
      function (entry) {
        spys(entry.stats);
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
      TEST_DIR,
      function (entry) {
        spys(entry.stats);
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
      TEST_DIR,
      function (entry) {
        try {
          spys(entry.stats);
        } catch (err) {
          return err;
        }

        if (entry.path === path.join('dir2', 'file1')) rimraf.sync(path.join(TEST_DIR, 'dir2'));
        return true;
      },
      { concurrency: 1, lstat: true, alwaysStat: true },
      function (err) {
        assert.ok(!err);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 1);
        done();
      }
    );
  });

  it('Should handle a delete (custom error callback)', function (done) {
    var spys = statsSpys();
    var errors = [];

    walk(
      TEST_DIR,
      function (entry) {
        try {
          spys(entry.stats);
        } catch (err) {
          return err;
        }

        if (entry.path === path.join('dir2', 'file1')) rimraf.sync(path.join(TEST_DIR, 'dir2'));
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
        assert.equal(errors.length, 2);
        assert.equal(spys.dir.callCount, 5);
        assert.equal(spys.file.callCount, 4);
        assert.equal(spys.link.callCount, 1);
        done();
      }
    );
  });

  it('Should handle a delete (custom error callback, false)', function (done) {
    var spys = statsSpys();
    var errors = [];

    walk(
      TEST_DIR,
      function (entry) {
        try {
          spys(entry.stats);
        } catch (err) {
          return err;
        }

        if (entry.path === path.join('dir2', 'file1')) rimraf.sync(path.join(TEST_DIR, 'dir2'));
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
