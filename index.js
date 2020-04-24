var Iterator = require('fs-iterator');

module.exports = function walk(root, filter, options, callback) {
  if (typeof root !== 'string') throw new Error('Directory is required');
  if (typeof filter !== 'function') throw new Error('Filter is required');

  /* eslint-disable */
  if (arguments.length === 3 && typeof options === 'function') {
    callback = options;
    options = {};
  }

  // choose between promise and callback API
  if (typeof callback === 'function') {
    options = options || {};

    var iterator = new Iterator(root, {
      depth: options.depth === undefined ? Infinity : options.depth,
      alwaysStat: options.alwaysStat || false,
      lstat: options.lstat || false,
      filter: filter,
      callbacks: options.callbacks || options.async,
      error: function (err) {
        if (!~Iterator.EXPECTED_ERRORS.indexOf(err.code)) return false;
        if (options.error) return options.error(err);
        return true;
      },
    });

    return iterator.forEach(
      function () {},
      {
        concurrency: options.concurrency || Infinity,
      },
      function forEachCallback(err) {
        iterator.destroy();
        iterator = null;
        callback(err);
      }
    );
  } else {
    return new Promise(function (resolve, reject) {
      walk(root, filter, options, function (err) {
        err ? reject(err) : resolve();
      });
    });
  }
};
