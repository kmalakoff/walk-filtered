import Iterator from 'fs-iterator';

export * from './types.ts';

import type { Callback, FilterFunction, Options } from './types.ts';

function worker(root: string, filter: FilterFunction, options: Options, callback: Callback) {
  let iterator = new Iterator(root, {
    depth: options.depth === undefined ? Infinity : options.depth,
    alwaysStat: options.alwaysStat || false,
    lstat: options.lstat || false,
    filter: filter,
    callbacks: options.callbacks || options.async,
    error: (err) => {
      if (!~Iterator.EXPECTED_ERRORS.indexOf(err.code)) return false;
      if (options.error) return options.error(err);
      return true;
    },
  });

  return iterator.forEach(
    (_entry: unknown): void => {},
    {
      concurrency: options.concurrency || Infinity,
    },
    function forEachCallback(err) {
      iterator.destroy();
      iterator = null;
      callback(err);
    }
  );
}

export default function walk(root: string, filter: FilterFunction): Promise<void>;
export default function walk(root: string, filter: FilterFunction, options: Options): Promise<void>;

export default function walk(root: string, filter: FilterFunction, callback: Callback): void;
export default function walk(root: string, filter: FilterFunction, options: Options, callback: Callback): void;

export default function walk(root: string, filter: FilterFunction, options?: Options | Callback, callback?: Callback): void | Promise<void> {
  if (typeof root !== 'string') throw new Error('Directory is required');
  if (typeof filter !== 'function') throw new Error('Filter is required');
  callback = typeof options === 'function' ? options : callback;
  options = typeof options === 'function' ? {} : ((options || {}) as Options);

  if (typeof callback === 'function') return worker(root, filter, options, callback);
  return new Promise((resolve, reject) => worker(root, filter, options, (err) => (err ? reject(err) : resolve())));
}
