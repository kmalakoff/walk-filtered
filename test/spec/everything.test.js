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

  it("Should find everything with no return", function(callback) {
    var fileSpy = sinon.spy();

    walk(dir, function(path, stats) { fileSpy(); }, function(err) {
      assert.equal(fileSpy.callCount, 13);
      callback();
    });
  });

  it("Should find everything with return true", function(callback) {
    var fileSpy = sinon.spy();

    walk(dir, function(path, stats) { fileSpy(); return true; }, function(err) {
      assert.equal(fileSpy.callCount, 13);
      callback();
    });
  });
});
