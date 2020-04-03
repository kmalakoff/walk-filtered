async function updateMemory(highest) {
  const memory = process.memoryUsage();
  for (const key in highest) {
    if (highest[key] < memory[key]) highest[key] = memory[key];
  }
}

async function writeMemory(key, value) {
  console.log(`${key} ${Math.round((value / 1024 / 1024) * 100) / 100} MB`);
}

module.exports = async function run({ walk, version }, dir) {
  console.log('****************\n');
  console.log(`Running: ${version}`);
  console.log('----------------');
  global.gc();
  const start = process.memoryUsage();
  const highest = { heapUsed: start.heapUsed };

  await walk(
    dir,
    async (rel) => {
      updateMemory(highest);
    },
    { concurrency: 50 }
  );

  const end = process.memoryUsage();
  for (const key in highest) {
    writeMemory(`Highest ${key}`, highest[key] - start[key]);
    writeMemory(`End ${key}`, end[key] - start[key]);
  }
  console.log('****************\n');
};

// var util = require('util');
// var writeSnapshot = util.promisify(require('heapdump').writeSnapshot);
