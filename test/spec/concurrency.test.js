// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
const Promise = require('pinkie-promise');
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

describe('concurrency', () => {
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after((cb) => rimraf2(TEST_DIR, { disableGlob: true }, () => cb()));

  describe('asynchronous', () => {
    it('should run with concurrency 1', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
        },
        { concurrency: 1 },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
        },
        { concurrency: 5 },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
        },
        { concurrency: Infinity },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.ok(spys.callCount, 13);
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
          assert.ok(!err, err ? err.message : '');
          assert.ok(spys.callCount, 13);
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
          assert.ok(!err, err ? err.message : '');
          assert.ok(spys.callCount, 13);
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
          assert.ok(!err, err ? err.message : '');
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });
  });

  describe('promise', () => {
    it('should run with concurrency 1', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
          return Promise.resolve();
        },
        { concurrency: 1 },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency 5', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
          return Promise.resolve();
        },
        { concurrency: 5 },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });

    it('should run with concurrency Infinity', (done) => {
      const spys = statsSpys();

      walk(
        TEST_DIR,
        (entry) => {
          spys(entry.stats);
          return Promise.resolve();
        },
        { concurrency: Infinity },
        (err) => {
          assert.ok(!err, err ? err.message : '');
          assert.ok(spys.callCount, 13);
          done();
        }
      );
    });
  });
});
