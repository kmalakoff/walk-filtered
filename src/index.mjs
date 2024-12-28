import Iterator from 'fs-iterator';

export default function walk(root, filter, options, callback) {
  if (typeof root !== 'string') throw new Error('Directory is required');
  if (typeof filter !== 'function') throw new Error('Filter is required');

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // choose between promise and callback API
  if (typeof callback === 'function') {
    options = options || {};

    let iterator = new Iterator(root, {
      depth: options.depth === undefined ? Infinity : options.depth,
      alwaysStat: options.alwaysStat || false,
      lstat: options.lstat || false,
      filter: filter,
      callbacks: options.callbacks || options.async,
      error: (err) => {
        if (!~Iterator.EXPECTED_ERRORS.indexOf(err.code)) return false;
        if (options.error) return options.error(err);
        return true;
      },
    });

    return iterator.forEach(
      () => {},
      {
        concurrency: options.concurrency || Infinity,
      },
      function forEachCallback(err) {
        iterator.destroy();
        iterator = null;
        callback(err);
      }
    );
  }
  return new Promise((resolve, reject) => {
    walk(root, filter, options, (err) => {
      err ? reject(err) : resolve();
    });
  });
}
