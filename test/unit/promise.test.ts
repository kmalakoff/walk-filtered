import assert from 'assert';
import generate from 'fs-generate';
import statsSpys from 'fs-stats-spys';
import path from 'path';
import Pinkie from 'pinkie-promise';
import rimraf2 from 'rimraf2';
import url from 'url';

import walk from 'walk-filtered';

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

describe('promise', () => {
  (() => {
    // patch and restore promise
    if (typeof global === 'undefined') return;
    const globalPromise = global.Promise;
    before(() => {
      global.Promise = Pinkie;
    });
    after(() => {
      global.Promise = globalPromise;
    });
  })();

  describe('setup tests', () => {
    beforeEach((done) => {
      rimraf2(TEST_DIR, { disableGlob: true }, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });
    after((cb) => rimraf2(TEST_DIR, { disableGlob: true }, () => cb()));

    it('should be default false', async () => {
      const spys = statsSpys();

      await walk(TEST_DIR, (entry): undefined => {
        spys(entry.stats);
      });
      assert.equal(spys.callCount, 12);
    });

    it('Should find everything with no return', async () => {
      const spys = statsSpys();

      await walk(
        TEST_DIR,
        (entry): undefined => {
          spys(entry.stats);
        },
        { lstat: true }
      );
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
    });

    it('Should find everything with return true', async () => {
      const spys = statsSpys();

      await walk(
        TEST_DIR,
        (entry): boolean => {
          spys(entry.stats);
          return true;
        },
        { lstat: true }
      );

      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
    });

    it('should propagate errors', async () => {
      try {
        await walk(TEST_DIR, (_entry) => {
          return Promise.reject(new Error('Failed'));
        });
        assert.ok(false);
      } catch (err) {
        assert.ok(!!err);
      }
    });
  });
});
