const path = require('path');

const tests = require('./tests');

const WALK_VERSIONS = require('../WALK_VERSIONS');
const DATA_DIR = path.resolve(path.join(__dirname, '..', 'node_modules'));

(async () => {
  for (const options of WALK_VERSIONS) {
    await tests(options, DATA_DIR);
  }
})();
