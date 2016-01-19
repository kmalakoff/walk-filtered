var chai = require('chai'); chai.use(require('sinon-chai'));
var assert = chai.assert;
var sinon = require('sinon');
var generate = require('fs-generate');
var fs = require('fs-extra');
var sysPath = require('path');

var walk = require('../..');
var statsSpys = require('../utils').statsSpys;

var DIR = sysPath.resolve(sysPath.join(__dirname, '..', 'data'));
var STRUCTURE = {
  'file1': 'a',
  'file2': 'b',
  'dir1': null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  'link1': '~dir3/dir4/file1',
  'dir3/link2': '~dir2/file1'
};

describe("filtering", function() {
  after(function(callback) { fs.remove(DIR, callback); })

  describe("sync", function() {
    beforeEach(function(callback) { fs.remove(DIR, function() { generate(DIR, STRUCTURE, callback); }); })

    it("Should filter everything under the root directory", function(callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function(path, stats) { filterSpy(); return false; }, function(err) {
        assert.ok(filterSpy.callCount, 1);
        callback();
      });
    });

    it("Should filter everything under specific directories by relative path", function(callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function(path, stats) { filterSpy(); return (path !== 'dir2'); }, true, function(err) {
        assert.ok(filterSpy.callCount, 13 - 2);
        callback();
      });
    });

    it("Should filter everything under specific directories by stats and relative path", function(callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function(path, stats) { filterSpy(); return !stats.isDirectory() || path.startsWith('dir3/dir4'); }, true, function(err) {
        assert.ok(filterSpy.callCount, 13 - 1);
        callback();
      });
    });
  });

  describe("async", function() {
    beforeEach(function(callback) { fs.remove(DIR, function() { generate(DIR, STRUCTURE, callback); }); })

    it("Should filter everything under the root directory", function(callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function(path, callback) { filterSpy(); callback(null, false); }, {async: true}, function(err) {
        assert.ok(filterSpy.callCount, 1);
        callback();
      });
    });

    it("Should filter everything under specific directories by relative path", function(callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function(path, stats, callback) { filterSpy(); callback(null, (path !== 'dir2')); }, {stats: true, async: true}, function(err) {
        assert.ok(filterSpy.callCount, 13 - 2);
        callback();
      });
    });

    it("Should filter everything under specific directories by stats and relative path", function(callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function(path, stats) { filterSpy(); callback(null, !stats.isDirectory() || path.startsWith('dir3/dir4')); }, {stats: true, async: true}, function(err) {
        assert.ok(filterSpy.callCount, 13 - 1);
        callback();
      });
    });
  });
});
