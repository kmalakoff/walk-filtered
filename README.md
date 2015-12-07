A simple file and directory walker

```
walk(rootPath, (path, stat) { /* filter */ }, done)
  .on('file', function(path, stat) {})
  .on('directory', function(path, stat) {});
```

Options (all optional):
- function: filter(path, stat) - filter files and directories to traverse. Like array filter, 'true' keeps the file or directory
- bool: preStat - stat before calling filter; for example, if you need to filter both directories and files by knowing their type
- object: fs - choose an fs implementation (default fs); for example, use graceful-fs
- string: stat - choose a stat method from fs (default fs.stat)
- function: each - choose a each implementation (default async-each-series)

```
walk(rootPath, options, done)
  .on('file', function(path, stat) {})
  .on('directory', function(path, stat) {});
```
