var BenchmarkSuite = require('benchmark-suite');

module.exports = async function run({ walk, version, testOptions }, dir) {
  var suite = new BenchmarkSuite('walk ' + version, 'Operations');

  for (const test of testOptions) {
    suite.add(`${test.name}`, async function (fn) {
      await walk(dir, fn, test.options);
    });
  }

  suite.on('cycle', (results) => {
    for (var key in results) console.log(`${results[key].name.padStart(8, ' ')}| ${suite.formatStats(results[key].stats)}`);
  });
  suite.on('complete', function (results) {
    console.log('-----Fastest-----');
    for (var key in results) console.log(`${results[key].name.padStart(8, ' ')}| ${suite.formatStats(results[key].stats)}`);
  });

  console.log('----------' + suite.name + '----------');
  await suite.run({ time: 1000 });
  console.log('');
};
