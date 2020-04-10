var Iterator = require('fs-iterator');

var DEFAULT_CONCURRENCY = 100;
var NORMAL_FLOW_ERRORS = ['ENOENT', 'EPERM', 'EACCES', 'ELOOP'];

module.exports = function walk(cwd, filter, options, callback) {
  /* eslint-disable */
  if (arguments.length === 3 && typeof options === 'function') {
    callback = options;
    options = {};
  }

  // choose between promise and callback API
  if (typeof callback === 'function') {
    options = options || {};

    var iterator = new Iterator(cwd, {
      depth: options.depth === undefined ? Infinity : options.depth,
      fs: options.fs,
      stat: options.stat,
      filter: filter,
      async: options.async,
    });
    return iterator.each(
      function (err) {
        if (err && !~NORMAL_FLOW_ERRORS.indexOf(err.code)) throw err;
      },
      {
        concurrency: options.concurrency || DEFAULT_CONCURRENCY,
      },
      callback
    );
  } else {
    return new Promise(function (resolve, reject) {
      walk(cwd, filter, options, function (err) {
        err ? reject(err) : resolve();
      });
    });
  }
};
