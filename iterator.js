var path = require('path');
var Queue = require('queue-cb');

var Iterator = require('./lib/Iterator');
var getResult = require('./lib/getResult');
var getKeep = require('./lib/getKeep');

var DEFAULT_CONCURRENCY = 4096; // default concurrency

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

function processMore(options) {
  var queue = options.queue;
  var iterator = options.iterator;
  var concurrency = options.concurrency; // TODO: add a maximum batch size
  var filter = options.filter;

  if (concurrency > 100) concurrency = 100;

  while (!options.done && options.count < concurrency) {
    options.count++;
    queue.defer(function (callback) {
      iterator.next(function (relativePath, stat, callback2) {
        if (relativePath === null) { // done
          options.count--;
          options.done = true;
          return callback();
        }

        processFilter(relativePath, stat, filter, options.async, function (err, value) {
          options.count--;
          callback2(null, value);
          if (!options.done) processMore(options);
          callback(err);
        });
      });
    });
  }
}

module.exports = function (cwd, filter, options, callback) {
  /* eslint-disable */
  if (arguments.length === 3 && typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  var queue = new Queue();
  var iterator = new Iterator(cwd, Object.assign({}, options, {async: true}));
  var concurrency = options.concurrency || DEFAULT_CONCURRENCY;
  var count = 0;

  processMore({ cwd: cwd, filter: filter, queue: queue, iterator: iterator, concurrency: concurrency, async: options.async, count: count });

  // choose between promise and callback API
  if (typeof callback === 'function') return queue.await(callback);
  return new Promise(function (resolve, reject) {
    queue.await(function (err, result) {
      err ? reject(err) : resolve(result);
    });
  });
};
