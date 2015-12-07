var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var TestUtils = require('./lib/utils');

var walk = require('..');

// TODO: write tests for all cases - currently functionality is valdated through chokidar's tests
describe("Find files", function() {
  var dir;

  beforeEach(function(callback) { TestUtils.beforeEach(function(err, _dir) { callback(err, dir =_dir); }); });
  after(TestUtils.after);

  it("Should find files", function(callback) {
    var fileSpy = sinon.spy(function fileSpy(){});

    walk(dir, function(err) {
      assert.ok(fileSpy.callCount>100);
      callback();
    })
      .on('file', fileSpy);
  });
});
