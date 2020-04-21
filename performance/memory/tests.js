var BenchmarkSuite = require('benchmark-suite');

module.exports = async function run({ walk, version, testOptions }, dir) {
  var suite = new BenchmarkSuite('walk ' + version, 'Memory');

  for (const test of testOptions) {
    suite.add(`${test.name}`, async function (fn) {
      await walk(dir, fn, test.options);
    });
  }

  suite.on('cycle', (results) => {
    for (var key in results) console.log(`${results[key].name.padStart(8, ' ')}| ${suite.formatStats(results[key].stats)} - ${key}`);
  });
  suite.on('complete', function (results) {
    console.log('-----Largest-----');
    for (var key in results) console.log(`${results[key].name.padStart(8, ' ')}| ${suite.formatStats(results[key].stats)} - ${key}`);
  });

  console.log('----------' + suite.name + '----------');
  await suite.run({ time: 1000 }); //, heapdumpTrigger: 1024 * 100 });
  console.log('');
};
