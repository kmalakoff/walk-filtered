var sysPath = require('path');
var fs = require('fs-extra');
var eachSeries = require('async-each-series');

var DATA_DIR = sysPath.resolve(sysPath.join(__dirname, '..', 'data'));

var INIT_STRUCTURE = {
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

module.exports.beforeEach = function(callback) {
  fs.remove(DATA_DIR, function() {
    eachSeries(Object.keys(INIT_STRUCTURE), function(path, callback) {
      var fullPath = sysPath.join(DATA_DIR, path.split('/').join(sysPath.sep));

      var contents = INIT_STRUCTURE[path];
      if (!contents) return fs.mkdirs(fullPath, callback);

      fs.mkdirs(sysPath.dirname(fullPath), function(err) {
        if (err) return callback(err);
        if (!contents.startsWith('~')) return fs.writeFile(fullPath, contents, 'utf8', callback);

        var linkPath = sysPath.join(DATA_DIR, contents.slice(1).split('/').join(sysPath.sep));
        fs.symlink(linkPath, fullPath, callback);
      });
    },
    function(err) { err ? callback(err) : callback(null, DATA_DIR); });
  });
}

module.exports.after = function(callback) {
  fs.remove(DATA_DIR, function() { callback(); });
}
