#!/usr/bin/env node

(async () => {
  var walk = require('..');
  var memory = require('memory');
  var userHome = require('user-home');
  var log = require('single-line-log').stdout;
  var counter = 0;

  await walk(userHome, rel => {
    var mb = memory();
    if ((counter++ % 1000 === 1)) log('Memory usage: ', mb);
  });
})();
