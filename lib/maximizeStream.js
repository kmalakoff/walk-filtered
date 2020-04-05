const Readable = require('readable-stream');
var maximizeIterator = require('./maximizeIterator');

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
    var done = false;
    maximizeIterator(
      this.iterator,
      batch,
      function (err, result) {
        if (done) return;
        if (err) {
          done = true;
          if (!self.destroyed) self.destroy(err);
          return;
        }
        if (result.done) {
          done = true;
          self.push(null)
        }
        else self.push(result.value)
      },
      function (err) {
        self.reading = false;
      }
    );
  }
}

module.exports = function maximizeStream(iterator, concurrency, callback) {
  new WalkStream(concurrency, iterator)
    .on('data', function () {})
    .on('end', function () {
      callback();
    })
    .on('error', callback);
};
