var isPromise = require('./isPromise');
var getResult = require('./getResult');

module.exports = function(keep, callback) {
  if (isPromise(keep)) {
    keep
      .then(function(resolvedKeep) {
        setTimeout(function() {
          callback(null, getResult(resolvedKeep));
        });
      })
      .catch(function(err) {
        callback(err);
      });
  } else {
    callback(null, getResult(keep));
  }
};
