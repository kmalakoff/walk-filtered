var DEFAULT_CONCURRENCY = 4096;
var MAXIMUM_BATCH = 10;

function addMore(queue, iterator, options, endingCount) {
  var counter = 0;

  while(queue.tasks.length + queue.running_count - endingCount < queue.parallelism) {
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

module.exports = function fillQueue(queue, iterator) {
  addMore(queue, iterator, {count: 0}, 0);
}
