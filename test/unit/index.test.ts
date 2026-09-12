import assert from 'assert';
import generate from 'fs-generate';
import { safeRm, safeRmSync } from 'fs-remove-compat';
import statsSpys from 'fs-stats-spys';
import path from 'path';
import Pinkie from 'pinkie-promise';
import url from 'url';

import walk, { type Entry } from 'walk-filtered';
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
const TEST_DIR_PATH = `dir3${path.sep}dir4`;

describe('walk', () => {
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
          (entry: Entry): void => {
            spys(entry.stats as NonNullable<Entry['stats']>);
          },
          { concurrency: 1 },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });

      it('should run with concurrency 5', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry): void => {
            spys(entry.stats as NonNullable<Entry['stats']>);
          },
          { concurrency: 5 },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });

      it('should run with concurrency Infinity', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry): void => {
            spys(entry.stats as NonNullable<Entry['stats']>);
          },
          { concurrency: Infinity },
          (err) => {
            if (err) return done(err);

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
          (entry: Entry, callback) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(callback, 10);
          },
          { callbacks: true, concurrency: 1 },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });

      it('should run with concurrency 5', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry, callback) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(callback, 10);
          },
          { callbacks: true, concurrency: 5 },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });

      it('should run with concurrency Infinity', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry, callback) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(callback, 10);
          },
          { callbacks: true, concurrency: Infinity },
          (err) => {
            if (err) return done(err);

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
          (entry: Entry) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            return Pinkie.resolve();
          },
          { concurrency: 1 },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });

      it('should run with concurrency 5', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            return Pinkie.resolve();
          },
          { concurrency: 5 },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });

      it('should run with concurrency Infinity', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            return Pinkie.resolve();
          },
          { concurrency: Infinity },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.callCount, 12);
            done();
          }
        );
      });
    });
  });

  describe('depth', () => {
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });
    after((cb) => safeRm(TEST_DIR, () => cb()));

    describe('synchronous', () => {
      it('depth 0', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry): void => {
            spys(entry.stats as NonNullable<Entry['stats']>);
          },
          { depth: 0, lstat: true },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });

      it('depth 1', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry): void => {
            spys(entry.stats as NonNullable<Entry['stats']>);
          },
          { depth: 1, lstat: true },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 4);
            assert.equal(spys.file.callCount, 4);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('depth 2', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry): void => {
            spys(entry.stats as NonNullable<Entry['stats']>);
          },
          { depth: 2, lstat: true },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('depth Infinity', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry): void => {
            spys(entry.stats as NonNullable<Entry['stats']>);
          },
          { depth: Infinity, lstat: true },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    });

    describe('callbacks', () => {
      it('depth 0', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry, callback) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(callback, 10);
          },
          {
            depth: 0,
            lstat: true,
            callbacks: true,
          },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });

      it('depth 1', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry, callback) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(callback, 10);
          },
          {
            depth: 1,
            lstat: true,
            callbacks: true,
          },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 4);
            assert.equal(spys.file.callCount, 4);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('depth 2', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry, callback) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(callback, 10);
          },
          {
            depth: 2,
            lstat: true,
            callbacks: true,
          },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('depth Infinity', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry, callback) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(callback, 10);
          },
          {
            depth: Infinity,
            lstat: true,
            callbacks: true,
          },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    });

    describe('promise', () => {
      it('depth 0', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry, _callback) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            return Pinkie.resolve();
          },
          {
            depth: 0,
            lstat: true,
          },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 3);
            assert.equal(spys.file.callCount, 2);
            assert.equal(spys.link.callCount, 1);
            done();
          }
        );
      });

      it('depth 1', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry, _callback) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            return Pinkie.resolve();
          },
          {
            depth: 1,
            lstat: true,
          },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 4);
            assert.equal(spys.file.callCount, 4);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('depth 2', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry, _callback) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            return Pinkie.resolve();
          },
          {
            depth: 2,
            lstat: true,
          },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });

      it('depth Infinity', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry, _callback) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            return Pinkie.resolve();
          },
          {
            depth: Infinity,
            lstat: true,
          },
          (err) => {
            if (err) return done(err);

            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    });
  });

  describe('errors', () => {
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });
    after((cb) => safeRm(TEST_DIR, () => cb()));

    describe('synchronous', () => {
      it('should propagate errors', (done) => {
        walk(
          TEST_DIR,
          (_entry: Entry): Error => new Error('Failed'),
          { concurrency: 1 },
          (err) => {
            assert.ok(!!err);
            done();
          }
        );
      });
    });

    describe('callbacks', () => {
      it('should propagate errors', (done) => {
        walk(
          TEST_DIR,
          (_entry: Entry, callback) => {
            setTimeout(() => {
              callback(new Error('Failed'));
            }, 10);
          },
          { callbacks: true },
          (err) => {
            assert.ok(!!err);
            done();
          }
        );
      });
    });

    describe('promise', () => {
      it('should propagate errors', (done) => {
        walk(
          TEST_DIR,
          (_entry: Entry) => Pinkie.reject(new Error('Failed')),
          (err): void => {
            assert.ok(!!err);
            done();
          }
        );
      });
    });
  });

  describe('walk everything', () => {
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });
    after((cb) => safeRm(TEST_DIR, () => cb()));

    it('Should find everything with no return', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry: Entry): void => {
          spys(entry.stats as NonNullable<Entry['stats']>);
        },
        { lstat: true },
        () => {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('Should find everything with return true', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry: Entry) => {
          spys(entry.stats as NonNullable<Entry['stats']>);
          return true;
        },
        { lstat: true },
        () => {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });

    it('Should handle a delete', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry: Entry) => {
          try {
            spys(entry.stats as NonNullable<Entry['stats']>);
          } catch (err) {
            return err;
          }

          if (entry.path === path.join('dir2', 'file1')) safeRmSync(path.join(TEST_DIR, 'dir2'), { recursive: true, force: true });
          return true;
        },
        { concurrency: 1, lstat: true, alwaysStat: true },
        (err) => {
          if (err) return done(err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('Should handle a delete (custom error callback)', (done) => {
      const spys = statsSpys();
      const errors = [];

      walk(
        TEST_DIR,
        (entry: Entry) => {
          try {
            spys(entry.stats as NonNullable<Entry['stats']>);
          } catch (err) {
            return err;
          }

          if (entry.path === path.join('dir2', 'file1')) safeRmSync(path.join(TEST_DIR, 'dir2'), { recursive: true, force: true });
          return true;
        },
        {
          concurrency: 1,
          lstat: true,
          alwaysStat: true,
          error: (err): void => {
            errors.push(err);
          },
        },
        (err) => {
          if (err) return done(err);
          assert.equal(errors.length, 2);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 4);
          assert.equal(spys.link.callCount, 1);
          done();
        }
      );
    });

    it('Should handle a delete (custom error callback, false)', (done) => {
      const spys = statsSpys();
      const errors = [];

      walk(
        TEST_DIR,
        (entry: Entry) => {
          try {
            spys(entry.stats as NonNullable<Entry['stats']>);
          } catch (err) {
            return err;
          }

          if (entry.path === path.join('dir2', 'file1')) safeRmSync(path.join(TEST_DIR, 'dir2'), { recursive: true, force: true });
          return true;
        },
        {
          concurrency: 1,
          lstat: true,
          alwaysStat: true,
          error: (err) => {
            errors.push(err);
            return false;
          },
        },
        (err) => {
          assert.ok(err);
          assert.equal(errors.length, 1);
          assert.equal(spys.dir.callCount, 2);
          assert.equal(spys.file.callCount, 1);
          assert.equal(spys.link.callCount, 0);
          done();
        }
      );
    });
  });

  describe('filtering', () => {
    beforeEach((done) => {
      safeRm(TEST_DIR, () => {
        generate(TEST_DIR, STRUCTURE, (err) => {
          done(err);
        });
      });
    });
    after((cb) => safeRm(TEST_DIR, () => cb()));

    describe('synchronous', () => {
      it('Should filter everything under the root directory', (done) => {
        const spys = statsSpys();

        walk(
          TEST_DIR,
          (entry: Entry): boolean => {
            spys(entry.stats as NonNullable<Entry['stats']>);
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
            spys(entry.stats as NonNullable<Entry['stats']>);
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
            spys(entry.stats as NonNullable<Entry['stats']>);
            return !(entry.stats?.isDirectory() ?? false) || stringStartsWith(entry.path, TEST_DIR_PATH);
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
          (entry, callback): void => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(() => {
              callback(undefined, false);
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
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(() => {
              callback(undefined, entry.path !== 'dir2');
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
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(() => {
              callback(undefined, !(entry.stats?.isDirectory() ?? false) || stringStartsWith(entry.path, TEST_DIR_PATH));
            });
          },
          { callbacks: true },
          (_err): void => {
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
          (entry: Entry) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            return Pinkie.resolve(false);
          },
          (_err): void => {
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
            spys(entry.stats as NonNullable<Entry['stats']>);
            return Pinkie.resolve(entry.path !== 'dir2');
          },
          (_err): void => {
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
            spys(entry.stats as NonNullable<Entry['stats']>);
            return Pinkie.resolve(!(entry.stats as NonNullable<Entry['stats']>).isDirectory() || stringStartsWith(entry.path, TEST_DIR_PATH));
          },
          (_err): void => {
            assert.equal(spys.callCount, 6);
            done();
          }
        );
      });
    });
  });

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
          (entry: Entry, callback) => {
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(() => {
              callback(undefined, false);
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
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(() => {
              callback(undefined, entry.path !== 'dir2');
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
            spys(entry.stats as NonNullable<Entry['stats']>);
            setTimeout(() => {
              callback(undefined, !(entry.stats?.isDirectory() ?? false) || stringStartsWith(entry.path, 'dir3/dir4'));
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
});
