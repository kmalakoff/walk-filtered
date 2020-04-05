var path = require('path');
var Queue = require('queue-cb');
const Readable = require('readable-stream');

var Iterator = require('./lib/Iterator');
var getResult = require('./lib/getResult');
var getKeep = require('./lib/getKeep');

var DEFAULT_CONCURRENCY = 4096;
var MAXIMUM_CONCURRENCY = 4 * 4096;

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

class WalkStream extends Readable {
  constructor(options, iterator) {
    var highWaterMark = options.concurrency || DEFAULT_CONCURRENCY;
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
    var queue = new Queue(batch); 
    var done = false;
    while (!done && !this.destroyed && batch > 0) {
      batch--;
      queue.defer(function(callback) {
        if (self.destroyed || done) return callback();
        self.iterator.next(function (err, result) {
          if (self.destroyed) return callback();;
          if (err) {
            return self.destroy(err);
            callback(err);
          }
          if (result.done) {
            if (!done) {
              done = true;
              self.push(null);
            }
          }
          else self.push(true)
          callback();
        });
      })
    }
    queue.await(function() {
      self.reading = false;
    })
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
  var stream = new WalkStream(options, iterator);

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
        .on('end', resolve)
        .on('error', reject);
    });
  }
};
