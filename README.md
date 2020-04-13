## walk-filtered

A simple, performant file system walker to provided fine-grained control over directories and files to walk. Supports Node 0.10 and above.

_Note:_ This API is very robust for a variety of use cases as it passes the [chokidar](https://github.com/paulmillr/chokidar) and [readdirp](https://github.com/paulmillr/readdirp) test suites plus it does not accumulate results in memory.

Entries are of the format:

- string: basename - file or directory name
- string: path - realtive path from the directory to the file or directory
- string: fullPath - full path to the file or directory
- fs.Stats: stats - file, directory or symlink stats

**Promise Filter Function**

```
await walk(rootPath, async (entry) => { /* do something */ return true or false });
```

**Callback Filter Function**

```
walk(rootPath, function(entry, callback) { /* do something */ callback(null, true or false); }, {async: true}, done);
```

**Synchronous Filter Function**

```
walk(rootPath, function(entry) { /* do something */ return true or false }, done);
```

**Options**:

- number: depth - choose maximum depth of the tree to traverse. (default: infinity)
- bool: alwaysStat - always call stats before filter. (default: false)
- number: concurrency - choose maximum number of concurrently processed files or folders. (default: set from performance testing)
- function: error - custom error callback for expected filesystem errors ('ENOENT', 'EPERM', 'EACCES', 'ELOOP'). Return false to stop processing. (default: silent filsystem errors)
- object: fs - choose an fs implementation; for example, you can use use graceful-fs and concurrency 1. (default: fs)
- bool: async - use an async filter function of the form function(path, stats, callback) with callback being of the form function(err, keep) where keep undefined means continue. `If you use promises, this is unnecessary`. (default: false)
