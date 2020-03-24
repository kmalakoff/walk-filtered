#!/usr/bin/env node

var walk = require('..');
var userHome = require('user-home');
// var util = require('util');

// var writeSnapshot = util.promisify(require('heapdump').writeSnapshot);

var CHECK_SIZE = 10000;

async function writeStats() {
  const used = process.memoryUsage();
  for (let key in used) {
    console.log(`${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`);
  }
  console.log('----------------');
  // await writeSnapshot();
}

(async () => {
  var counter = 0;

  await writeStats();
  walk(
    userHome,
    async (rel) => {
      if (counter++ % CHECK_SIZE === 0) {
        await writeStats();
      }
    },
    writeStats
  );
})();
