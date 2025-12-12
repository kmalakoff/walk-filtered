import assert from 'assert';
import generate from 'fs-generate';
import { safeRm } from 'fs-remove-compat';
import statsSpys from 'fs-stats-spys';
import path from 'path';
import Pinkie from 'pinkie-promise';
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

describe('concurrency', () => {
  beforeEach((done) => {
    safeRm(TEST_DIR, () => {
      generate(TEST_DIR, STRUCTURE, (err) => {
        done(err);
      });
    });
  });
  after((cb) => safeRm(TEST_DIR, () => cb()));

  describe('asynchronous', () => {
    it('should run with concurrency 1', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry): undefined => {
          spys(entry.stats);
        },
        { concurrency: 1 },
        (err) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });

    it('should run with concurrency 5', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry): undefined => {
          spys(entry.stats);
        },
        { concurrency: 5 },
        (err) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry): undefined => {
          spys(entry.stats);
        },
        { concurrency: Infinity },
        (err) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });
  });

  describe('callbacks', () => {
    it('should run with concurrency 1', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry, callback) => {
          spys(entry.stats);
          setTimeout(callback, 10);
        },
        { callbacks: true, concurrency: 1 },
        (err) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });

    it('should run with concurrency 5', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry, callback) => {
          spys(entry.stats);
          setTimeout(callback, 10);
        },
        { callbacks: true, concurrency: 5 },
        (err) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry, callback) => {
          spys(entry.stats);
          setTimeout(callback, 10);
        },
        { callbacks: true, concurrency: Infinity },
        (err) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 12);
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

    it('should run with concurrency 1', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry): undefined => {
          spys(entry.stats);
          return Pinkie.resolve();
        },
        { concurrency: 1 },
        (err) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });

    it('should run with concurrency 5', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry): undefined => {
          spys(entry.stats);
          return Pinkie.resolve();
        },
        { concurrency: 5 },
        (err) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry): undefined => {
          spys(entry.stats);
          return Pinkie.resolve();
        },
        { concurrency: Infinity },
        (err) => {
          if (err) {
            done(err);
            return;
          }
          assert.equal(spys.callCount, 12);
          done();
        }
      );
    });
  });
});
