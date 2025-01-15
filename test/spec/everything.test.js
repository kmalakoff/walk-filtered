const assert = require('assert');
const path = require('path');
const rimraf2 = require('rimraf2');
const generate = require('fs-generate');
const statsSpys = require('fs-stats-spys');

const walk = require('walk-filtered');

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

describe('walk everything', () => {
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after((cb) => rimraf2(TEST_DIR, { disableGlob: true }, () => cb()));

  it('Should find everything with no return', (done) => {
    const spys = statsSpys();

    walk(
      TEST_DIR,
      (entry) => {
        spys(entry.stats);
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
      (entry) => {
        spys(entry.stats);
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
      (entry) => {
        try {
          spys(entry.stats);
        } catch (err) {
          return err;
        }

        if (entry.path === path.join('dir2', 'file1')) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      { concurrency: 1, lstat: true, alwaysStat: true },
      (err) => {
        if (err) return done(err.message);
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
      (entry) => {
        try {
          spys(entry.stats);
        } catch (err) {
          return err;
        }

        if (entry.path === path.join('dir2', 'file1')) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
        return true;
      },
      {
        concurrency: 1,
        lstat: true,
        alwaysStat: true,
        error: (err) => {
          errors.push(err);
        },
      },
      (err) => {
        if (err) return done(err.message);
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
      (entry) => {
        try {
          spys(entry.stats);
        } catch (err) {
          return err;
        }

        if (entry.path === path.join('dir2', 'file1')) rimraf2.sync(path.join(TEST_DIR, 'dir2'), { disableGlob: true });
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
