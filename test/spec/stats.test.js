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

describe("stats", function() {
  beforeEach(function(callback) { fs.remove(DIR, function() { generate(DIR, STRUCTURE, callback); }); })
  after(function(callback) { fs.remove(DIR, callback); })

  it("should be default false", function(callback) {
    var statsSpy = sinon.spy();

    walk(DIR, function(path, stats) { statsSpy(stats); }, function(err) {
      assert.ok(statsSpy.callCount, 13);
      statsSpy.args.forEach(function(args) { assert.isUndefined(args[0]); });
      callback();
    });
  });

  it("false (argument) should not return a stats", function(callback) {
    var statsSpy = sinon.spy();

    walk(DIR, function(path, stats) { statsSpy(stats); }, false, function(err) {
      assert.ok(statsSpy.callCount, 13);
      statsSpy.args.forEach(function(args) { assert.isUndefined(args[0]); });
      callback();
    });
  });

  it("false (option) should not return a stats", function(callback) {
    var statsSpy = sinon.spy();

    walk(DIR, function(path, stats) { statsSpy(stats); }, {stats: false}, function(err) {
      assert.ok(statsSpy.callCount, 13);
      statsSpy.args.forEach(function(args) { assert.isUndefined(args[0]); });
      callback();
    });
  });

  it("false (argument) should not return a stats", function(callback) {
    var spys = statsSpys();
    var statsSpy = sinon.spy();

    walk(DIR, function(path, stats) { spys(stats, path); statsSpy(stats); }, true, function(err) {
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      assert.ok(statsSpy.callCount, 13);
      statsSpy.args.forEach(function(args) { assert.isDefined(args[0]); });
      callback();
    });
  });

  it("false (option) should not return a stats", function(callback) {
    var spys = statsSpys();
    var statsSpy = sinon.spy();

    walk(DIR, function(path, stats) { spys(stats, path); statsSpy(stats); }, {stats: true}, function(err) {
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      assert.ok(statsSpy.callCount, 13);
      statsSpy.args.forEach(function(args) { assert.isDefined(args[0]); });
      callback();
    });
  });

  it("should be able to use stats to filter symlinks", function(callback) {
    var spys = statsSpys();
    var statsSpy = sinon.spy();

    walk(DIR, function(path, stats) { if (!stats.isSymbolicLink()) spys(stats, path); statsSpy(stats); }, true, function(err) {
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 0);
      assert.ok(statsSpy.callCount, 13 - 2);
      statsSpy.args.forEach(function(args) { assert.isDefined(args[0]); });
      callback();
    });
  });
});
