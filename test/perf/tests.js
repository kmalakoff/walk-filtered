var sysPath = require('path');

var DIR = sysPath.resolve(sysPath.join(__dirname, '..', '..', 'node_modules'));

require('./run-directory')(DIR);
