var chai = require('chai'); chai.use(require('sinon-chai'));

var assert = chai.assert;
var sinon = require('sinon');
var generate = require('fs-generate');
var fs = require('fs-extra');
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
  'dir3/link2': '~dir2/file1',
};

function sleep(timeout) {
  return new Promise(function (resolve) { setTimeout(resolve, timeout); });
}

describe('concurrency', function () {
  after(function (callback) { fs.remove(DIR, callback); });

  describe('sync', function () {
    beforeEach(function (callback) { fs.remove(DIR, function () { generate(DIR, STRUCTURE, callback); }); });

    it('should run with concurrency 1', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function () { filterSpy(); }, { concurrency: 1 }, function (err) {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });

    it('should run with concurrency 50', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function () { filterSpy(); }, { concurrency: 50 }, function (err) {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });

    it('should run with concurrency Infinity', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function () { filterSpy(); }, { concurrency: Infinity }, function (err) {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });
  });

  describe('async', function () {
    beforeEach(function (callback) { fs.remove(DIR, function () { generate(DIR, STRUCTURE, callback); }); });

    it('should run with concurrency 1', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function (path, callback2) { filterSpy(); callback2(); }, { concurrency: 1, async: true }, function (err) {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });

    it('should run with concurrency 50', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function (path, callback2) { filterSpy(); callback2(); }, { concurrency: 50, async: true }, function (err) {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });

    it('should run with concurrency Infinity', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function (path, callback2) { filterSpy(); callback2(); }, { concurrency: Infinity, async: true }, function (err) {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });
  });

  describe('promise', function () {
    beforeEach(function (callback) { fs.remove(DIR, function () { generate(DIR, STRUCTURE, callback); }); });

    it('should run with concurrency 1', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function () { filterSpy(); return sleep(50); }, { concurrency: 1 }, function (err) {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });

    it('should run with concurrency 50', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function () { filterSpy(); return sleep(50); }, { concurrency: 50 }, function (err) {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });

    it('should run with concurrency Infinity', function (callback) {
      var filterSpy = sinon.spy();

      walk(DIR, function () { filterSpy(); return sleep(50); }, { concurrency: Infinity }, function () {
        assert.ok(filterSpy.callCount, 13);
        callback();
      });
    });
  });
});
