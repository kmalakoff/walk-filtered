var Benchmark = require('benchmark');

const CONCURRENCIES = [1, 25, 100, 400, 1600, 6400, Infinity];
const FILE_SYSTEMS = [
  { name: 'fs', fs: require('fs') },
  { name: 'gfs', fs: require('graceful-fs') },
];

const TESTS = [];
for (const fileSystem of FILE_SYSTEMS) {
  TESTS.push({ name: `Options (${fileSystem.name})`, options: { fs: fileSystem.fs } });
  for (const concurrency of CONCURRENCIES) {
    TESTS.push({ name: `Options (${fileSystem.name}, ${concurrency})`, options: { fs: fileSystem.fs, concurrency: concurrency } });
  }
}

module.exports = async function run({ walk, version }, dir) {
  console.log('****************\n');
  console.log(`Running: ${version}`);
  console.log('----------------');
  global.gc();

  return new Promise(function (resolve, reject) {
    const suite = new Benchmark.Suite('Walk ' + dir);

    for (const test of TESTS) {
      suite.add(
        test.name,
        function (deferred) {
          walk(
            dir,
            function () {},
            test.options,
            function (err) {
              err ? deferred.reject() : deferred.resolve();
            }
          );
        },
        { defer: true }
      );
    }

    suite.on('start', function () {
      console.log('Comparing ' + this.name);
    });
    suite.on('cycle', function (event) {
      console.log(String(event.target));
    });
    suite.on('error', function () {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject();
    });
    suite.on('complete', function () {
      console.log('----------------\n');
      console.log('Fastest is ' + this.filter('fastest')[0].name);
      console.log('****************\n');
      resolve();
    });
    suite.run({ async: true, maxTime: 1000 });
  });
};