"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return walk;
    }
});
var _fsiterator = /*#__PURE__*/ _interop_require_default(require("fs-iterator"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function walk(root, filter, options, callback) {
    if (typeof root !== 'string') throw new Error('Directory is required');
    if (typeof filter !== 'function') throw new Error('Filter is required');
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    // choose between promise and callback API
    if (typeof callback === 'function') {
        options = options || {};
        var iterator = new _fsiterator.default(root, {
            depth: options.depth === undefined ? Infinity : options.depth,
            alwaysStat: options.alwaysStat || false,
            lstat: options.lstat || false,
            filter: filter,
            callbacks: options.callbacks || options.async,
            error: function(err) {
                if (!~_fsiterator.default.EXPECTED_ERRORS.indexOf(err.code)) return false;
                if (options.error) return options.error(err);
                return true;
            }
        });
        return iterator.forEach(function() {}, {
            concurrency: options.concurrency || Infinity
        }, function forEachCallback(err) {
            iterator.destroy();
            iterator = null;
            callback(err);
        });
    }
    return new Promise(function(resolve, reject) {
        walk(root, filter, options, function(err) {
            err ? reject(err) : resolve();
        });
    });
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }