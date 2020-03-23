#!/usr/bin/env node

var walk = require('..');
var memory = require('memory');
var userHome = require('user-home');
var log = require('single-line-log').stdout;
var util = require('util');

var writeSnapshot = util.promisify(require('heapdump').writeSnapshot);

async function writeStats() {
  var mb = memory();
  log('Memory usage: ', mb);
  await writeSnapshot();
}

(async () => {
  var counter = 0;

  await writeStats();
  walk(
    userHome,
    async rel => {
      if (counter++ % 10000 === 0) {
        await writeStats();
      }
    },
    writeStats
  );
})();
