var chai = require('chai'); chai.use(require('sinon-chai'));
var assert = chai.assert;
var sinon = require('sinon');
var generate = require('fs-generate');
var fs = require('fs-extra');
var sysPath = require('path');

var walk = require('../..');

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

describe.only("concurrency", function() {
  after(function(callback) { fs.remove(DIR, callback); })

  describe("sync", function() {
    beforeEach(function(callback) { fs.remove(DIR, function() { generate(DIR, STRUCTURE, callback); }); })

    it("should run with concurrency 1", function(callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function(path, stats) { filterSpy(); }, {concurrency: 1}, function(err) {
        assert.ok(filterSpy.callCount, 13);
        callback();
      });
    });

    it("should run with concurrency 50", function(callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function(path, stats) { filterSpy(); }, {concurrency: 50}, function(err) {
        assert.ok(filterSpy.callCount, 13);
        callback();
      });
    });

    it("should run with concurrency Infinity", function(callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function(path, stats) { filterSpy(); }, {concurrency: Infinity}, function(err) {
        assert.ok(filterSpy.callCount, 13);
        callback();
      });
    });
  });

  describe("async", function() {
    beforeEach(function(callback) { fs.remove(DIR, function() { generate(DIR, STRUCTURE, callback); }); })

    it("should run with concurrency 1", function(callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function(path, callback) { filterSpy(); callback(); }, {concurrency: 1, async: true}, function(err) {
        assert.ok(filterSpy.callCount, 13);
        callback();
      });
    });

    it("should run with concurrency 50", function(callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function(path, callback) { filterSpy(); callback(); }, {concurrency: 50, async: true}, function(err) {
        assert.ok(filterSpy.callCount, 13);
        callback();
      });
    });

    it("should run with concurrency Infinity", function(callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function(path, callback) { filterSpy(); callback(); }, {concurrency: Infinity, async: true}, function(err) {
        assert.ok(filterSpy.callCount, 13);
        callback();
      });
    });
  });
});
