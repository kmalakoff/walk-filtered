const assert = require('assert');
const path = require('path');
const rimraf = require('rimraf');
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

describe('legacy', () => {
  beforeEach((done) => {
    rimraf(TEST_DIR, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, TEST_DIR));

  describe('async', () => {
    it('Should filter everything under the root directory', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry, callback) => {
          spys(entry.stats);
          setTimeout(() => {
            callback(null, false);
          }, 10);
        },
        { async: true },
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
          }, 10);
        },
        { async: true },
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
            callback(null, !entry.stats.isDirectory() || startsWith(entry.path, 'dir3/dir4'));
          }, 10);
        },
        { async: true },
        () => {
          assert.ok(spys.callCount, 13 - 1);
          done();
        }
      );
    });
  });
});
