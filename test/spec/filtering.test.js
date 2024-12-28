// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
const Promise = require('pinkie-promise');
const assert = require('assert');
const path = require('path');
const rimraf2 = require('rimraf2');
const generate = require('fs-generate');
const statsSpys = require('fs-stats-spys');
const startsWith = require('starts-with');

const walk = require('walk-filtered');

const TEST_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp', 'test'));
const STRUCTURE = {
  file1: 'a',
  file2: 'b',
  dir1: null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  filelink1: '~dir3/dir4/file1',
  'dir3/filelink2': '~dir2/file1',
};
const TEST_DIR_PATH = `dir3${path.sep}dir4`;

describe('filtering', () => {
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after((cb) => rimraf2(TEST_DIR, { disableGlob: true }, () => cb()));

  describe('synchronous', () => {
    it('Should filter everything under the root directory', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
          return false;
        },
        () => {
          assert.ok(spys.callCount, 1);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
          return entry.path !== 'dir2';
        },
        true,
        () => {
          assert.ok(spys.callCount, 13 - 2);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
          return !entry.stats.isDirectory() || startsWith(entry.path, TEST_DIR_PATH);
        },
        () => {
          assert.ok(spys.callCount, 13 - 1);
          done();
        }
      );
    });
  });

  describe('callbacks', () => {
    it('Should filter everything under the root directory', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry, callback) => {
          spys(entry.stats);
          setTimeout(() => {
            callback(null, false);
          });
        },
        { callbacks: true },
        () => {
          assert.ok(spys.callCount, 1);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry, callback) => {
          spys(entry.stats);
          setTimeout(() => {
            callback(null, entry.path !== 'dir2');
          });
        },
        { callbacks: true },
        () => {
          assert.ok(spys.callCount, 13 - 2);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry, callback) => {
          spys(entry.stats);
          setTimeout(() => {
            callback(null, !entry.stats.isDirectory() || startsWith(entry.path, TEST_DIR_PATH));
          });
        },
        { callbacks: true },
        () => {
          assert.ok(spys.callCount, 13 - 1);
          done();
        }
      );
    });
  });

  describe('promise', () => {
    it('Should filter everything under the root directory', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
          return Promise.resolve(false);
        },
        () => {
          assert.ok(spys.callCount, 1);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
          return Promise.resolve(path !== 'dir2');
        },
        () => {
          assert.ok(spys.callCount, 13 - 2);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
          return Promise.resolve(!entry.stats.isDirectory() || startsWith(entry.path, TEST_DIR_PATH));
        },
        () => {
          assert.ok(spys.callCount, 13 - 1);
          done();
        }
      );
    });
  });
});
