import assert from 'assert';
import path from 'path';
import url from 'url';
import generate from 'fs-generate';
import statsSpys from 'fs-stats-spys';
import Pinkie from 'pinkie-promise';
import rimraf2 from 'rimraf2';

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

describe('depth', () => {
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, (err) => {
        done(err);
      });
    });
  });
  after((cb) => rimraf2(TEST_DIR, { disableGlob: true }, () => cb()));

  describe('synchronous', () => {
    it('depth 0', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
        },
        { depth: 0, lstat: true },
        (err) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry) => {
          spys(entry.stats);
        },
        { depth: 1, lstat: true },
        (err) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry) => {
          spys(entry.stats);
        },
        { depth: 2, lstat: true },
        (err) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry) => {
          spys(entry.stats);
        },
        { depth: Infinity, lstat: true },
        (err) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry, callback) => {
          spys(entry.stats);
          setTimeout(callback, 10);
        },
        {
          depth: 0,
          lstat: true,
          callbacks: true,
        },
        (err) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry, callback) => {
          spys(entry.stats);
          setTimeout(callback, 10);
        },
        {
          depth: 1,
          lstat: true,
          callbacks: true,
        },
        (err) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry, callback) => {
          spys(entry.stats);
          setTimeout(callback, 10);
        },
        {
          depth: 2,
          lstat: true,
          callbacks: true,
        },
        (err) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry, callback) => {
          spys(entry.stats);
          setTimeout(callback, 10);
        },
        {
          depth: Infinity,
          lstat: true,
          callbacks: true,
        },
        (err) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry, _callback) => {
          spys(entry.stats);
          return Pinkie.resolve();
        },
        {
          depth: 0,
          lstat: true,
        },
        (err) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry, _callback) => {
          spys(entry.stats);
          return Pinkie.resolve();
        },
        {
          depth: 1,
          lstat: true,
        },
        (err) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry, _callback) => {
          spys(entry.stats);
          return Pinkie.resolve();
        },
        {
          depth: 2,
          lstat: true,
        },
        (err) => {
          if (err) {
            done(err.message);
            return;
          }
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
        (entry, _callback) => {
          spys(entry.stats);
          return Pinkie.resolve();
        },
        {
          depth: Infinity,
          lstat: true,
        },
        (err) => {
          if (err) {
            done(err.message);
            return;
          }
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 2);
          done();
        }
      );
    });
  });
});
