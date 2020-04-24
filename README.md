## walk-filtered

A simple, performant file system walker to provided fine-grained control over directories and files to walk. Supports Node 0.10 and above.

_Note:_ This API is very robust for a variety of use cases as it passes the [chokidar](https://github.com/paulmillr/chokidar) and [readdirp](https://github.com/paulmillr/readdirp) test suites plus it does not accumulate results in memory.

Entries are of the format:

- string: basename - file or directory name
- string: path - realtive path from the directory to the file or directory
- string: fullPath - full path to the file or directory
- fs.Stats | fs.Dirent: stats - file, directory or symlink stats

**Promise Filter Function**

```
await walk(rootPath, async (entry) => { /* do something */ return true or false });
```

**Callback Filter Function**

```
walk(rootPath, function(entry, callback) { /* do something */ callback(null, true or false); }, {callbacks: true}, done);
```

**Synchronous Filter Function**

```
walk(rootPath, function(entry) { /* do something */ return true or false }, done);
```

**Options**:

- number: depth - choose maximum depth of the tree to traverse. (default: Infinity)
- function: filter - filter function to continue processing the tree. Return false to skip processing (default: process all)
- bool: callbacks - use a filter function with a callback format like `function(entry, callback)`. (default: false)
- bool: alwaysStat - stat each file individually rather than fetching dirents when reading directories. (default: false)
- bool: lstat - use lstat to get the link's stats instead of using stat on the file itself. (default: false)
- function: error - custom error callback for expected filesystem errors ('ENOENT', 'EPERM', 'EACCES', 'ELOOP'). Return false to stop processing. (default: silent filsystem errors)
