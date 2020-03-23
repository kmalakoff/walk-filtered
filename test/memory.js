#!/usr/bin/env node

(async () => {
  var walk = require('..');
  var memory = require('memory');
  var userHome = require('user-home');

  walk(userHome, rel => {
    var mb = memory();
    console.log('Memory usage: ', mb);
    //   console.log(rel)
  });
})();
