walk-filtered
------------

A simple, performant file system walker to provided fine-grained control over directories and files to walk. 

*Note:* This API is very robust for a variety of use cases as it passes the [chokidar](https://github.com/paulmillr/chokidar) and [readdirp](https://github.com/thlorenz/readdirp) test suites. Also, it does not accumulate results in memory by using an event emitter API to notify you of results.


**Everything**

```
walk(rootPath, done)
  .on('file', function(path, stat) {})
  .on('directory', function(path, stat) {});
```

**Simple Filtering**

```
walk(rootPath, (path, stat) { /* filter - return true to accept */ }, done)
  .on('file', function(path, stat) {})
  .on('directory', function(path, stat) {});
```

**Advanced Filtering**:

```
walk(rootPath, options, done)
  .on('file', function(path, stat) {})
  .on('directory', function(path, stat) {});
```

*Options*

- function: filter(path, stat) - filter files and directories to traverse. Like array filter, 'true' keeps the file or directory
- bool: preStat - stat before calling filter; for example, if you need to filter both directories and files by knowing their type (default: false). It is *potentially* more performant if you are expecting early exits based on string-only comparisons so enable only if you need it.
- object: fs - choose an fs implementation (default fs); for example, use graceful-fs
- string: stat - choose a stat method from fs (default fs.stat)
- function: each - choose a each implementation (default async-each-series)

