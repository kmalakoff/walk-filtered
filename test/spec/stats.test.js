var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var TestUtils = require('../lib/utils');

var walk = require('../..');

describe("stats", function() {
  var dir;

  beforeEach(function(callback) { TestUtils.beforeEach(function(err, _dir) { callback(err, dir =_dir); }); });
  after(TestUtils.after);

  it("should be default false", function(callback) {
    var fileSpy = sinon.spy();
    var statSpy = sinon.spy();

    walk(dir, function(path, stats) { fileSpy(); statSpy(stats); }, function(err) {
      assert.equal(fileSpy.callCount, 13);
      statSpy.args.forEach(function(args) { assert.isUndefined(args[0]); });
      callback();
    });
  });

  it("false (argument) should not return a stats", function(callback) {
    var fileSpy = sinon.spy();
    var statSpy = sinon.spy();

    walk(dir, function(path, stats) { fileSpy(); statSpy(stats); }, false, function(err) {
      assert.equal(fileSpy.callCount, 13);
      statSpy.args.forEach(function(args) { assert.isUndefined(args[0]); });
      callback();
    });
  });

  it("false (option) should not return a stats", function(callback) {
    var fileSpy = sinon.spy();
    var statSpy = sinon.spy();

    walk(dir, function(path, stats) { fileSpy(); statSpy(stats); }, {stats: false}, function(err) {
      assert.equal(fileSpy.callCount, 13);
      statSpy.args.forEach(function(args) { assert.isUndefined(args[0]); });
      callback();
    });
  });

  it("false (argument) should not return a stats", function(callback) {
    var fileSpy = sinon.spy();
    var statSpy = sinon.spy();

    walk(dir, function(path, stats) { fileSpy(); statSpy(stats); }, true, function(err) {
      assert.equal(fileSpy.callCount, 13);
      statSpy.args.forEach(function(args) { assert.isDefined(args[0]); });
      callback();
    });
  });

  it("false (option) should not return a stats", function(callback) {
    var fileSpy = sinon.spy();
    var statSpy = sinon.spy();

    walk(dir, function(path, stats) { fileSpy(); statSpy(stats); }, {stats: true}, function(err) {
      assert.equal(fileSpy.callCount, 13);
      statSpy.args.forEach(function(args) { assert.isDefined(args[0]); });
      callback();
    });
  });

  it("should be able to use stats to filter symlinks", function(callback) {
    var fileSpy = sinon.spy(function fileSpy(){});

    walk(dir, function(path, stats) { if (!stats.isSymbolicLink()) fileSpy(); }, true, function(err) {
      assert.ok(fileSpy.callCount, 13 - 2);
      callback();
    });
  });
});
