var fillQueue = require('./fillQueue');
// var fillStream = require('./fillStream');

module.exports = function throttleIterator(iterator, concurrency, callback) {
  return fillQueue(iterator, concurrency, callback);
};
