const sysPath = require('path');

const DIR = sysPath.resolve(sysPath.join(__dirname, '..', '..', 'node_modules'));

require('./run-directory')(DIR);
