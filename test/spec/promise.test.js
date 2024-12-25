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

describe('promise', () => {
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after((cb) => rimraf2(TEST_DIR, { disableGlob: true }, () => cb()));

  it('should be default false', (done) => {
    const spys = statsSpys();

    walk(TEST_DIR, (entry) => {
      spys(entry.stats);
    }).then(() => {
      assert.ok(spys.callCount, 13);
      done();
    });
  });

  it('Should find everything with no return', (done) => {
    const spys = statsSpys();

    walk(
      TEST_DIR,
      (entry) => {
        spys(entry.stats);
      },
      { lstat: true }
    ).then(() => {
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });

  it('Should find everything with return true', (done) => {
    const spys = statsSpys();

    walk(
      TEST_DIR,
      (entry) => {
        spys(entry.stats);
        return true;
      },
      { lstat: true }
    ).then(() => {
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      done();
    });
  });

  it('should propagate errors', (done) => {
    walk(TEST_DIR, () => Promise.reject(new Error('Failed'))).catch((err) => {
      assert.ok(!!err);
      done();
    });
  });
});
