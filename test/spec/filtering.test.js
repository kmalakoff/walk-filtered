var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var TestUtils = require('../lib/utils');
var sysPath = require('path');

var walk = require('../..');

describe("filtering", function() {
  var dir;

  beforeEach(function(callback) { TestUtils.beforeEach(function(err, _dir) { callback(err, dir =_dir); }); });
  after(TestUtils.after);

  it("Should filter everything under the root directory", function(callback) {
    var fileSpy = sinon.spy(function fileSpy(){});

    walk(dir, function(path, stats) { fileSpy(); return false; }, function(err) {
      assert.ok(fileSpy.callCount, 1);
      callback();
    });
  });

  it("Should filter everything under specific directories by relative path", function(callback) {
    var fileSpy = sinon.spy(function fileSpy(){});

    walk(dir, function(path, stats) { fileSpy(); return (path !== 'dir2'); }, true, function(err) {
      assert.ok(fileSpy.callCount, 13 - 2);
      callback();
    });
  });

  it("Should filter everything under specific directories by stats and relative path", function(callback) {
    var fileSpy = sinon.spy(function fileSpy(){});

    walk(dir, function(path, stats) { fileSpy(); return !stats.isDirectory() || path.startsWith('dir3/dir4'); }, true, function(err) {
      assert.ok(fileSpy.callCount, 13 - 1);
      callback();
    });
  });
});
