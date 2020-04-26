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

describe('promise', function () {
  if (typeof Promise === 'undefined') return; // no promise support

  beforeEach(function (done) {
    rimraf(DIR, function () {
      generate(DIR, STRUCTURE, done);
    });
  });
  after(function (done) {
    rimraf(DIR, done);
  });

  it('should be default false', function (done) {
    var spys = statsSpys();

    walk(DIR, function (entry) {
      spys(entry.stats, entry.path);
    }).then(function () {
      assert.ok(spys.callCount, 13);
      done();
    });
  });

  it('Should find everything with no return', function (done) {
    var spys = statsSpys();

    walk(
      DIR,
      function (entry) {
        spys(entry.stats, entry.path);
      },
      { lstat: true }
    ).then(function () {
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });

  it('Should find everything with return true', function (done) {
    var spys = statsSpys();

    walk(
      DIR,
      function (entry) {
        spys(entry.stats, entry.path);
        return true;
      },
      { lstat: true }
    ).then(function () {
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });

  it('should propagate errors', function (done) {
    walk(DIR, function () {
      return Promise.reject(new Error('Failed'));
    }).catch(function (err) {
      assert.ok(!!err);
      done();
    });
  });
});
