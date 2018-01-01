walk-filtered
------------

A simple, performant file system walker to provided fine-grained control over directories and files to walk. Supports Node 0.10 and above.

*Note:* This API is very robust for a variety of use cases as it passes the [chokidar](https://github.com/paulmillr/chokidar) and [readdirp](https://github.com/thlorenz/readdirp) test suites plus it does not accumulate results in memory.


**Promise Filter Function**

```
await walk(rootPath, async (path) => { /* do something */ return true or false });
```

**Callback Filter Function**

```
walk(rootPath, function(path, callback) { /* do something */ callback(null, true or false); }, {async: true}, done);
```

**Synchronous Filter Function**

```
walk(rootPath, function(path) { /* do something */ return true or false }, done);
```

**Include stats**

```
walk(rootPath, function(path, stats) { /* do something */ }, {stats: true}, done);
```

**Options**:

- bool: stats - collect stats before calling filter and pass to the filter function; for example, if you need to filter both directories and files by knowing their type. This is an early exit optimization if you are for example using a regex on the file name. (default: false for fastest string-based filtering).
- number: concurrency - choose maximum number of parallelly-processed files or folders (NOTE: currently this is not a global option, but per folder). (default: 50 from performance testing).
- object: fs - choose an fs implementation; for example, you can use use graceful-fs and concurrency 1. (default: fs)
- string: stat - choose a stats method from fs; for example, 'stat'. (default: 'lstat')
- function: each - choose an each implementation (default: async-each-series)
- bool: async - use an async filter function of the form function(path, stats, callback) with callback being of the form function(err, keep) where keep undefined means continue. `If you use promises, this is unnecessary`. (default: false)
