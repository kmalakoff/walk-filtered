const Readable = require('readable-stream');
var Queue = require('queue-cb');

var DEFAULT_CONCURRENCY = 4096;
var MAXIMUM_CONCURRENCY = 4096;

class WalkStream extends Readable {
  constructor(concurrency, iterator) {
    var highWaterMark = concurrency || DEFAULT_CONCURRENCY;
    if (highWaterMark > MAXIMUM_CONCURRENCY) highWaterMark = MAXIMUM_CONCURRENCY;

    super({
      objectMode: true,
      autoDestroy: true,
      highWaterMark: highWaterMark,
    });
    this.iterator = iterator;
  }

  _read(batch) {
    if (this.reading) return;
    this.reading = true;

    var self = this;
    // var queue = new Queue(batch);
    var done = false;
    while (!done && !this.destroyed && batch > 0) {
      batch--;
      // queue.defer(function(callback) {
      // if (self.destroyed || done) return callback();
      if (self.destroyed || done) return;
      self.iterator.next(function (err, result) {
        // if (self.destroyed) return callback();;
        if (self.destroyed) return;
        if (err) {
          self.destroy(err);
          return;
          // return callback(err);
        }
        if (result.done) {
          if (!done) {
            done = true;
            self.push(null);
          }
        } else self.push(true);
        //   callback();
      });
      // })
    }
    // queue.await(function() {
    self.reading = false;
    // })
  }
}

module.exports = function fillQueue(iterator, concurrency, callback) {
  var stream = new WalkStream(concurrency, iterator);

  // choose between promise and callback API
  if (typeof callback === 'function') {
    stream
      .on('data', function () {})
      .on('end', function () {
        callback();
      })
      .on('error', callback);
  } else {
    return new Promise(function (resolve, reject) {
      stream
        .on('data', function () {})
        .on('end', function () {
          resolve();
        })
        .on('error', function (err) {
          reject(err);
        });
    });
  }
};
