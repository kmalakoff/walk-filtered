import assert from 'assert';
import generate from 'fs-generate';
import { safeRm } from 'fs-remove-compat';
import statsSpys from 'fs-stats-spys';
import path from 'path';
import url from 'url';
import walk from 'walk-filtered';
import { stringStartsWith } from '../lib/compat.ts';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TEST_DIR = path.join(path.join(__dirname, '..', '..', '.tmp', 'test'));
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
    safeRm(TEST_DIR, () => {
      generate(TEST_DIR, STRUCTURE, (err) => {
        done(err);
      });
    });
  });
  after((cb) => safeRm(TEST_DIR, () => cb()));

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
          assert.equal(spys.callCount, 6);
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
          assert.equal(spys.callCount, 10);
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
            callback(null, !entry.stats.isDirectory() || stringStartsWith(entry.path, 'dir3/dir4'));
          }, 10);
        },
        { async: true },
        () => {
          assert.equal(spys.callCount, 6);
          done();
        }
      );
    });
  });
});
