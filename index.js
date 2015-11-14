import fs from 'fs';
import {join as pathJoin} from 'path';
import waterfall from 'async-waterfall';
import {EventEmitter} from 'events';

function process(path, filter, emitter, callback) {
  fs.stat(path, (err, stat) => {
    if (err) return callback(err);

    if (stat.isDirectory()) {
      emitter.emit('directory', path);

      waterfall([
        (callback) => fs.readdir(path, callback),
        (names, callback) => callback(null, names.map(name => pathJoin(path, name))),
        (paths, callback) => { filter ? async.filter(paths, filter, (paths) => callback(null, paths)) : callback(null, paths); },
        (paths, callback) => async.each(paths, (path, callback) => process(path, filter, emitter, callback), callback)
      ], callback)
    }
    else {
      emitter.emit('file', path);
      callback();
    }
  });
}

export default (path, filter, callback) => {
  let emitter = new EventEmitter()
  if (arguments.length == 2) [filter, callback] = [null, filter];
  process(path, filter, emitter, callback);
  return emitter;
}
