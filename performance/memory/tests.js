var MemorySuite = require('./MemorySuite');

const CONCURRENCIES = [1, 100, 1600, Infinity];

const TESTS = [];
TESTS.push({ name: `default` });
for (const concurrency of CONCURRENCIES) {
  TESTS.push({ name: `${concurrency}`, options: { concurrency: concurrency } });
}

module.exports = async function run({ walk, version }, dir) {
  console.log('****************\n');
  console.log(`Running: ${version}`);
  console.log('----------------');

  var suite = new MemorySuite('Walk ' + dir);

  for (const test of TESTS) {
    suite.add(test.name, async function () {
      await walk(dir, () => {}, test.options);
    });
  }

  suite.on('cycle', (result) => {
    console.log(result);
  });

  console.log('Comparing ' + suite.name);
  global.gc();
  await suite.run({ maxTime: 10000 });
  console.log('****************\n');
};
