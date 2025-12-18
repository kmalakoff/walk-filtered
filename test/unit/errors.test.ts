import assert from 'assert';
import generate from 'fs-generate';
import { safeRm } from 'fs-remove-compat';
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
        (_entry): Error => new Error('Failed'),
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
    it('should propagate errors', (done) => {
      walk(
        TEST_DIR,
        (_entry) => Pinkie.reject(new Error('Failed')),
        (err): void => {
          assert.ok(!!err);
          done();
        }
      );
    });
  });
});
