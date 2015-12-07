var gfs = require('graceful-fs');
var eachlimit = require('each-limit');

var DEFAULT_LIMIT = 50;
var limitEachFn = function(limit) {
  return function(array, fn, callback) { eachlimit(array, limit, fn, callback); };
}

module.exports = {
  fs: gfs,
  each: limitEachFn(DEFAULT_LIMIT)
}
