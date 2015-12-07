var sysPath = require('path');

var DIR = sysPath.resolve(sysPath.join(__dirname, '..', '..', 'node_modules'));

module.exports.beforeEach = function(callback) { callback(null, DIR); }
module.exports.after = function(callback) { callback(); }
