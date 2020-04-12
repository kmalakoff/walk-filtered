var EventEmitter = require('eventemitter3');
var memwatch = require('@luneo7/node-memwatch');
var stats = require('simple-statistics');
var humanize = require('humanize-data');

async function runOnce(fn) {
  memwatch.gc();
  var hd = new memwatch.HeapDiff();
  await fn();
  var diff = hd.end();
  return diff.change.size_bytes;
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

    for (let i = 0; i < this.tests.length; i++) {
      const test = this.tests[i];
      var samples = [];

      const start = Date.now();
      let time = start;
      while (time - start <= maxTime) {
        samples.push(await runOnce(test.fn));
        time = Date.now();
      }

      const mean = stats.mean(samples);
      const variance = stats.variance(samples);
      var standardDeviationPercent = Math.sqrt(variance / mean);
      this.emit('cycle', `${test.name} x ${humanize(mean)} ±${standardDeviationPercent.toFixed(2)}% (${samples.length} runs sampled)`);
    }
  }
};
