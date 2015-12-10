var sysPath = require('path');

var DIR = sysPath.resolve(sysPath.join(__dirname, '..', 'node_modules'));
var PATTERN = '**/*.js';

require('./run-directory')(DIR, PATTERN);
