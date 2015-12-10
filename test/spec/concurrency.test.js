var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var TestUtils = require('../lib/utils');

var walk = require('../..');

describe("walk everything", function() {
  var dir;

  beforeEach(function(callback) { TestUtils.beforeEach(function(err, _dir) { callback(err, dir =_dir); }); });
  after(TestUtils.after);

  it("should run with concurrency 1", function(callback) {
    var fileSpy = sinon.spy();

    walk(dir, function(path, stat) { fileSpy(); }, {concurrency: 1}, function(err) {
      assert.equal(fileSpy.callCount, 13);
      callback();
    });
  });

  it("should run with concurrency 50", function(callback) {
    var fileSpy = sinon.spy();

    walk(dir, function(path, stat) { fileSpy(); }, {concurrency: 50}, function(err) {
      assert.equal(fileSpy.callCount, 13);
      callback();
    });
  });

  it("should run with concurrency Infinity", function(callback) {
    var fileSpy = sinon.spy();

    walk(dir, function(path, stat) { fileSpy(); }, {concurrency: Infinity}, function(err) {
      assert.equal(fileSpy.callCount, 13);
      callback();
    });
  });
});
