# walk-filtered

Walk a directory tree with a filter for deciding which entries to process. The walker does not accumulate results in memory and supports promise and callback filters.

```bash
npm install walk-filtered
```

## Usage

```js
var walk = require('walk-filtered');

(async function () {
  await walk(process.argv[2] || '.', function (entry) {
    console.log(entry.fullPath);
    return true;
  });
})();
```

The filter receives entries with `basename`, relative `path`, `fullPath`, and `stats` (an `fs.Stats` or `fs.Dirent`). Return false to skip an entry. Set `lstat: true` to inspect symlinks without following them.

For callback-style filters, pass `{ callbacks: true }` and a final callback:

```js
var rootPath = process.argv[2] || '.';

walk(rootPath, function (entry, callback) {
  callback(null, true);
}, { callbacks: true }, function (err) {
  if (err) throw err;
});
```

Options include `depth` (default `Infinity`), `alwaysStat`, `lstat`, `concurrency`, and `error`. Expected filesystem errors are skipped by default. An `error` handler can return `true` to skip an error or `false` to fail the walk.
