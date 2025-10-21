import assert from 'assert';
import generate from 'fs-generate';
import statsSpys from 'fs-stats-spys';
import path from 'path';
import Pinkie from 'pinkie-promise';
import rimraf2 from 'rimraf2';
import startsWith from 'starts-with';
import url from 'url';

import walk, { type Entry } from 'walk-filtered';

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
      generate(TEST_DIR, STRUCTURE, (err) => {
        done(err);
      });
    });
  });
  after((cb) => rimraf2(TEST_DIR, { disableGlob: true }, () => cb()));

  describe('synchronous', () => {
    it('Should filter everything under the root directory', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry: Entry): boolean => {
          spys(entry.stats);
          return false;
        },
        (_err) => {
          assert.equal(spys.callCount, 6);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry: Entry): boolean => {
          spys(entry.stats);
          return entry.path !== 'dir2';
        },
        (_err) => {
          assert.equal(spys.callCount, 10);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry: Entry): boolean => {
          spys(entry.stats);
          return !entry.stats.isDirectory() || startsWith(entry.path, TEST_DIR_PATH);
        },
        (_err?) => {
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
        (entry, callback): undefined => {
          spys(entry.stats);
          setTimeout(() => {
            callback(null, false);
          });
        },
        { callbacks: true },
        (_err?) => {
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
        (_err) => {
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
        (_err): undefined => {
          assert.equal(spys.callCount, 6);
          done();
        }
      );
    });
  });

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

    it('Should filter everything under the root directory', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry: Entry): undefined => {
          spys(entry.stats);
          return Pinkie.resolve(false);
        },
        (_err): undefined => {
          assert.equal(spys.callCount, 6);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by relative path', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry: Entry) => {
          spys(entry.stats);
          return Pinkie.resolve(entry.path !== 'dir2');
        },
        (_err): undefined => {
          assert.equal(spys.callCount, 10);
          done();
        }
      );
    });

    it('Should filter everything under specific directories by stats and relative path', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry: Entry) => {
          spys(entry.stats);
          return Pinkie.resolve(!entry.stats.isDirectory() || startsWith(entry.path, TEST_DIR_PATH));
        },
        (_err): undefined => {
          assert.equal(spys.callCount, 6);
          done();
        }
      );
    });
  });
});
