var Iterator = require('fs-iterator');
var maximize = require('maximize-iterator');

var DEFAULT_CONCURRENCY = 4096;

module.exports = function walk(cwd, filter, options, callback) {
  /* eslint-disable */
  if (arguments.length === 3 && typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  var iterator = new Iterator(cwd, {
    fs: options.fs,
    stat: options.stat,
    filter: filter,
    async: options.async,
  });

  // choose between promise and callback API
  if (typeof callback === 'function') return maximize(iterator, { concurrency: options.concurrency || DEFAULT_CONCURRENCY }, callback);
  return new Promise(function (resolve, reject) {
    walk(cwd, filter, options, function (err) {
      err ? reject(err) : resolve();
    });
  });
};
