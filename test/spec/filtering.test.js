var chai = require('chai'); chai.use(require('sinon-chai'));

var assert = chai.assert;
var sinon = require('sinon');
var generate = require('fs-generate');
var fs = require('fs-extra');
var sysPath = require('path');
var BPromise = require('bluebird');

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
  'dir3/link2': '~dir2/file1',
};

function startsWith(string, start) { return (string.substring(0, start.length) === start); }
function sleep(timeout) {
  return new BPromise(function (resolve) { setTimeout(resolve, timeout); });
}

describe('filtering', function () {
  after(function (callback) { fs.remove(DIR, callback); });

  describe('sync', function () {
    beforeEach(function (callback) { fs.remove(DIR, function () { generate(DIR, STRUCTURE, callback); }); });

    it('Should filter everything under the root directory', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function () { filterSpy(); return false; }, function () {
        assert.ok(filterSpy.callCount, 1);
        callback();
      });
    });

    it('Should filter everything under specific directories by relative path', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function (path) { filterSpy(); return (path !== 'dir2'); }, true, function () {
        assert.ok(filterSpy.callCount, 13 - 2);
        callback();
      });
    });

    it('Should filter everything under specific directories by stats and relative path', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function (path, stats) { filterSpy(); return !stats.isDirectory() || startsWith(path, 'dir3/dir4'); }, true, function () {
        assert.ok(filterSpy.callCount, 13 - 1);
        callback();
      });
    });
  });

  describe('async', function () {
    beforeEach(function (callback) { fs.remove(DIR, function () { generate(DIR, STRUCTURE, callback); }); });

    it('Should filter everything under the root directory', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function (path, callback2) { filterSpy(); callback2(null, false); }, { async: true }, function () {
        assert.ok(filterSpy.callCount, 1);
        callback();
      });
    });

    it('Should filter everything under specific directories by relative path', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function (path, stats, callback2) { filterSpy(); callback2(null, (path !== 'dir2')); }, { stats: true, async: true }, function () {
        assert.ok(filterSpy.callCount, 13 - 2);
        callback();
      });
    });

    it('Should filter everything under specific directories by stats and relative path', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function (path, stats) {
        filterSpy(); callback(null, !stats.isDirectory() || startsWith(path, 'dir3/dir4'));
      }, { stats: true, async: true }, function () {
        assert.ok(filterSpy.callCount, 13 - 1);
        callback();
      });
    });
  });

  describe('promise', function () {
    beforeEach(function (callback) { fs.remove(DIR, function () { generate(DIR, STRUCTURE, callback); }); });

    it('Should filter everything under the root directory', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function () { filterSpy(); return sleep(50).then(function () { return false; }); }, function () {
        assert.ok(filterSpy.callCount, 1);
        callback();
      });
    });

    it('Should filter everything under specific directories by relative path', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function (path) {
        filterSpy(); return sleep(50).then(function () { return path !== 'dir2'; });
      }, { stats: true }, function () {
        assert.ok(filterSpy.callCount, 13 - 2);
        callback();
      });
    });

    it('Should filter everything under specific directories by stats and relative path', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function (path, stats) {
        filterSpy(); return sleep(50).then(function () { return !stats.isDirectory() || startsWith(path, 'dir3/dir4'); });
      }, { stats: true }, function () {
        assert.ok(filterSpy.callCount, 13 - 1);
        callback();
      });
    });
  });
});
