var chai = require('chai'); chai.use(require('sinon-chai'));
var assert = chai.assert;
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

describe("walk everything", function() {
  beforeEach(function(callback) { fs.remove(DIR, function() { generate(DIR, STRUCTURE, callback); }); })
  after(function(callback) { fs.remove(DIR, callback); })

  it("Should find everything with no return", function(callback) {
    var spys = statsSpys();

    walk(DIR, function(path, stats) { spys(stats, path); }, true, function(err) {
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      callback();
    });
  });

  it("Should find everything with return true", function(callback) {
    var spys = statsSpys();

    walk(DIR, function(path, stats) { spys(stats, path); return true; }, true, function(err) {
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      callback();
    });
  });
});
