var EventEmitter = require('eventemitter3');
var memwatch = require('@luneo7/node-memwatch');
var Stats = require('stats-incremental');
var humanize = require('humanize-data');

async function runOnce(fn) {
  const stats = Stats();
  memwatch.gc();
  var hd = new memwatch.HeapDiff();
  const start = process.memoryUsage();
  await fn(function () {
    stats.update(process.memoryUsage().heapUsed - start.heapUsed);
  });
  return { end: hd.end().change.size_bytes, iteration: stats };
}

module.exports = class MemorySuite extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.tests = [];
  }

  add(name, fn) {
    this.tests.push({ name, fn });
  }

  async run(options) {
    if (!options.maxTime) throw new Error('Missing maxTime option');
    const maxTime = options.maxTime;
    const largest = { end: null, max: null };

    for (const test of this.tests) {
      const current = { end: { name: test.name, stats: Stats() }, max: { name: test.name, stats: Stats() } };
      const start = Date.now();
      do {
        const run = await runOnce(test.fn);
        current.end.stats.update(run.end);
        current.max.stats.update(run.iteration.max);
      } while (Date.now() - start <= maxTime);

      this.emit('cycle', current);
      if (!largest.end || largest.end.stats.max < current.end.stats.max) largest.end = current.end;
      if (!largest.max || largest.max.stats.max < current.max.stats.max) largest.max = current.max;
    }
    this.emit('complete', largest);
  }

  formatStats(stats) {
    return `${humanize(stats.mean)} ±${Math.sqrt(stats.variance / stats.mean).toFixed(1)}% (${stats.n} runs sampled)`;
  }
};
