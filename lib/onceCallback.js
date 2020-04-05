module.exports = function (callback) {
  var onceCallback = function () {
    if (!onceCallback.called) {
      onceCallback.called = true;
      callback.apply(this, arguments);
    }
  };

  return onceCallback;
};
