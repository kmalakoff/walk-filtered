var BenchmarkSuite = require('benchmark-suite');

module.exports = async function run({ walk, version, testOptions }, dir) {
  console.log('****************\n');
  console.log(`Running: ${version}`);
  console.log('----------------');

  var suite = new BenchmarkSuite('walk ' + dir, 'Memory');

  for (const test of testOptions) {
    suite.add(`${version}-${test.name}`, async function (fn) {
      await walk(dir, fn, test.options);
    });
  }

  suite.on('cycle', (results) => {
    for (var key in results) console.log(`${results[key].name} (${key}) x ${suite.formatStats(results[key].stats)}`);
  });
  suite.on('complete', function (results) {
    console.log('----------------');
    console.log('Largest');
    console.log('----------------');
    for (var key in results) console.log(`${results[key].name} (${key}) x ${suite.formatStats(results[key].stats)}`);
    console.log('****************\n');
  });

  console.log('Comparing ' + suite.name);
  await suite.run({ time: 1000 }); //, heapdumpTrigger: 1024 * 100 });
  console.log('****************\n');
};
