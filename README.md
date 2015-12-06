A simple file and directory walker

```
walk(rootPath, (path, stat) { /* filter */ }, done)
  .on('file', function(path, stat) {})
  .on('directory', function(path, stat) {});
```

Options:
- preStat (bool) - stat before calling filter
- filter (path, stat) - like array filter, true keeps the file or directory

```
walk(rootPath, options, done)
  .on('file', function(path, stat) {})
  .on('directory', function(path, stat) {});
```
