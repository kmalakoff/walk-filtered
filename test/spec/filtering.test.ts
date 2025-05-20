import assert from 'assert';
import path from 'path';
import url from 'url';
import generate from 'fs-generate';
import statsSpys from 'fs-stats-spys';
import Pinkie from 'pinkie-promise';
import rimraf2 from 'rimraf2';
import startsWith from 'starts-with';

// @ts-ignore
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
          assert.equal(spys.callCount, 6);
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
          assert.equal(spys.callCount, 10);
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
          assert.equal(spys.callCount, 6);
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
          });
        },
        { callbacks: true },
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
            callback(null, !entry.stats.isDirectory() || startsWith(entry.path, TEST_DIR_PATH));
          });
        },
        { callbacks: true },
        () => {
          assert.equal(spys.callCount, 6);
          done();
        }
      );
    });
  });

  describe('promise', () => {
    (() => {
      // patch and restore promise
      // @ts-ignore
      let rootPromise: Promise;
      before(() => {
        rootPromise = global.Promise;
        global.Promise = Pinkie;
      });
      after(() => {
        global.Promise = rootPromise;
      });
    })();

    it('Should filter everything under the root directory', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
          return Pinkie.resolve(false);
        },
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
        (entry) => {
          spys(entry.stats);
          return Pinkie.resolve(entry.path !== 'dir2');
        },
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
        (entry) => {
          spys(entry.stats);
          return Pinkie.resolve(!entry.stats.isDirectory() || startsWith(entry.path, TEST_DIR_PATH));
        },
        () => {
          assert.equal(spys.callCount, 6);
          done();
        }
      );
    });
  });
});
