module.exports = function (obj) {
  return !!obj && typeof obj === 'object' && typeof obj.then === 'function';
};
