var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var TestUtils = require('../lib/utils');

var walk = require('../..');

describe("includeStat", function() {
  var dir;

  beforeEach(function(callback) { TestUtils.beforeEach(function(err, _dir) { callback(err, dir =_dir); }); });
  after(TestUtils.after);

  it("should be default false", function(callback) {
    var fileSpy = sinon.spy();
    var statSpy = sinon.spy();

    walk(dir, function(path, stat) { fileSpy(); statSpy(stat); }, function(err) {
      assert.equal(fileSpy.callCount, 13);
      statSpy.args.forEach(function(args) { assert.isUndefined(args[0]); });
      callback();
    });
  });

  it("false (argument) should not return a stat", function(callback) {
    var fileSpy = sinon.spy();
    var statSpy = sinon.spy();

    walk(dir, function(path, stat) { fileSpy(); statSpy(stat); }, false, function(err) {
      assert.equal(fileSpy.callCount, 13);
      statSpy.args.forEach(function(args) { assert.isUndefined(args[0]); });
      callback();
    });
  });

  it("false (option) should not return a stat", function(callback) {
    var fileSpy = sinon.spy();
    var statSpy = sinon.spy();

    walk(dir, function(path, stat) { fileSpy(); statSpy(stat); }, {includeStat: false}, function(err) {
      assert.equal(fileSpy.callCount, 13);
      statSpy.args.forEach(function(args) { assert.isUndefined(args[0]); });
      callback();
    });
  });

  it("false (argument) should not return a stat", function(callback) {
    var fileSpy = sinon.spy();
    var statSpy = sinon.spy();

    walk(dir, function(path, stat) { fileSpy(); statSpy(stat); }, true, function(err) {
      assert.equal(fileSpy.callCount, 13);
      statSpy.args.forEach(function(args) { assert.isDefined(args[0]); });
      callback();
    });
  });

  it("false (option) should not return a stat", function(callback) {
    var fileSpy = sinon.spy();
    var statSpy = sinon.spy();

    walk(dir, function(path, stat) { fileSpy(); statSpy(stat); }, {includeStat: true}, function(err) {
      assert.equal(fileSpy.callCount, 13);
      statSpy.args.forEach(function(args) { assert.isDefined(args[0]); });
      callback();
    });
  });

  it("should be able to use stat to filter symlinks", function(callback) {
    var fileSpy = sinon.spy(function fileSpy(){});

    walk(dir, function(path, stat) { if (!stat.isSymbolicLink()) fileSpy(); }, true, function(err) {
      assert.ok(fileSpy.callCount, 13 - 2);
      callback();
    });
  });
});
