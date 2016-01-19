walk-filtered
------------

A simple, performant file system walker to provided fine-grained control over directories and files to walk.

*Note:* This API is very robust for a variety of use cases as it passes the [chokidar](https://github.com/paulmillr/chokidar) and [readdirp](https://github.com/thlorenz/readdirp) test suites. Also, it does not accumulate results in memory by using an event emitter API to notify you of results.


**Everything**

```
// do not include stats
walk(rootPath, function(path) { /* do something */ }, done);

// include stats
walk(rootPath, function(path, stats) { /* do something */ }, true, done);
```

**Simple Filtering**

```
walk(rootPath, function(path) { /* do something */ return true or false }, done);
```

**Advanced Options**:

```
walk(rootPath, function(path) { /* do something */ return true or false }, options, done);
```

- bool: stats - stats before calling filter and pass to the filter function; for example, if you need to filter both directories and files by knowing their type. This is an early exist optimization. (default: false)
- function: concurrency - choose maximum number of parallelly-processed files or folders (NOTE: currently this is not a global option, but per folder). Default Infinity.
- object: fs - choose an fs implementation (default graceful-fs); for example, you can use use fs and concurrency 1
- string: stat - choose a stats method from fs; for example, 'stat' (default 'lstat')
- function: each - choose an each implementation (default async-each-series)
- bool: async - use an async filter function of the form function(path, stats, callback) with callback being of the form function(err, keep) where keep undefined means continue
