const assert = require('assert');
const path = require('path');
const rimraf2 = require('rimraf2');
const generate = require('fs-generate');
const statsSpys = require('fs-stats-spys');

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

describe('promise', () => {
  (() => {
    // patch and restore promise
    let rootPromise;
    before(() => {
      rootPromise = global.Promise;
      global.Promise = require('pinkie-promise');
    });
    after(() => {
      global.Promise = rootPromise;
    });
  })();

  describe('setup tests', () => {
    beforeEach((done) => {
      rimraf2(TEST_DIR, { disableGlob: true }, () => {
        generate(TEST_DIR, STRUCTURE, done);
      });
    });
    after((cb) => rimraf2(TEST_DIR, { disableGlob: true }, () => cb()));

    it('should be default false', async () => {
      const spys = statsSpys();

      await walk(TEST_DIR, (entry) => {
        spys(entry.stats);
      });
      assert.ok(spys.callCount, 13);
    });

    it('Should find everything with no return', async () => {
      const spys = statsSpys();

      await walk(
        TEST_DIR,
        (entry) => {
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
        (entry) => {
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
        await walk(TEST_DIR, () => Promise.reject(new Error('Failed')));
        assert.ok(false);
      } catch (err) {
        assert.ok(!!err);
      }
    });
  });
});
