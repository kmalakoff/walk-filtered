var path = require('path');

var Iterator = require('./lib/Iterator');
var getResult = require('./lib/getResult');
var getKeep = require('./lib/getKeep');
var maximizeIterator = require('./lib/maximizeIterator');

var DEFAULT_CONCURRENCY = 4096;

function processFilter(relativePath, stat, filter, async, callback) {
  var callbackWrapper = function (err, result) {
    err ? callback(err) : callback(null, getResult(result));
  };

  try {
    async ? filter(relativePath, stat, callbackWrapper) : getKeep(filter(relativePath, stat), callbackWrapper);
  } catch (err) {
    callback(err);
  }
}

module.exports = function (cwd, filter, options, callback) {
  /* eslint-disable */
  if (arguments.length === 3 && typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  var iteratorOptions = {
    fs: options.fs,
    stat: options.stat,
    async: true,
    filter: function (relativePath, stat, callback) {
      processFilter(relativePath, stat, filter, options.async, callback);
    },
  };
  var iterator = new Iterator(cwd, iteratorOptions);

  // choose between promise and callback API
  if (typeof callback === 'function') return maximizeIterator(iterator, options.concurrency || DEFAULT_CONCURRENCY, function() {}, callback);
  return new Promise(function (resolve, reject) {
    maximizeIterator(
      iterator,
      options.concurrency || DEFAULT_CONCURRENCY,
      function() {},
      function (err, result) {
        err ? reject(err) : resolve(result);
      }
    );
  });
};
