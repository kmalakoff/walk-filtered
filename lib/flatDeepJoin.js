var isArray = require('lodash.isarray');

module.exports = function flatDeepJoin(array, sep, result) {
  for (var i = 0; i < array.length; i++) {
    var value = array[i];
    if (isArray(value)) result = flatDeepJoin(value, sep, result);
    else if (result === undefined) result = value;
    else result += sep + value;
  }
  return result || '';
};
