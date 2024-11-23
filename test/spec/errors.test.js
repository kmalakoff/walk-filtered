const assert = require('assert');
const path = require('path');
const rimraf = require('rimraf');
const generate = require('fs-generate');

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

describe('errors', () => {
  beforeEach((done) => {
    rimraf(TEST_DIR, () => {
      generate(TEST_DIR, STRUCTURE, done);
    });
  });
  after(rimraf.bind(null, TEST_DIR));

  describe('synchronous', () => {
    it('should propagate errors', (done) => {
      walk(
        TEST_DIR,
        () => new Error('Failed'),
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
        (_entry, callback) => {
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
    if (typeof Promise === 'undefined') return; // no promise support

    it('should propagate errors', (done) => {
      walk(
        TEST_DIR,
        () => Promise.reject(new Error('Failed')),
        (err) => {
          assert.ok(!!err);
          done();
        }
      );
    });
  });
});
