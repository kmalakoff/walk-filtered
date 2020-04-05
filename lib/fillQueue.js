var Queue = require('queue-cb');

var DEFAULT_CONCURRENCY = 4096;
var MAXIMUM_BATCH = 10;

function addMore(queue, iterator, options, endingCount) {
  var counter = 0;

  while (queue.tasks.length + queue.running_count - endingCount < queue.parallelism) {
    if (options.done || counter++ > MAXIMUM_BATCH) return; // done

    queue.defer(function (callback) {
      iterator.next(function (err, result) {
        if (err) return callback(err);
        options.done = result.done;
        if (!options.done) addMore(queue, iterator, options, 1);
        return callback();
      });
    });
  }
}

module.exports = function fillQueue(iterator, concurrency, callback) {
  var queue = new Queue(concurrency);
  addMore(queue, iterator, { count: 0 }, 0);

  // choose between promise and callback API
  if (typeof callback === 'function') return queue.await(callback);
  return new Promise(function (resolve, reject) {
    queue.await(function (err, result) {
      err ? reject(err) : resolve(result);
    });
  });
};
