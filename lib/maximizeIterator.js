var onceCallback = require('./onceCallback');

var DEFAULT_CONCURRENCY = 4096;
var MAXIMUM_BATCH = 10;

function addMore(iterator, options, each, callback) {
  var counter = 0;

  while (options.count < options.concurrency) {
    if (options.done || counter++ > MAXIMUM_BATCH) return; // done
    options.count++;

    iterator.next(function (err, result) {
      options.count--;
      if (options.done) return;

      each(err, result); // callback

      if (err || result.done) {
        options.done = true;
        return callback(err);
      }
      addMore(iterator, options, each, callback);
    });
  }
}

module.exports = function maximizeIterator(iterator, concurrency, each, callback) {
  addMore(iterator, { concurrency: concurrency || DEFAULT_CONCURRENCY, count: 0 }, each, onceCallback(callback));
};
