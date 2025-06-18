import assert from 'assert';
import generate from 'fs-generate';
import path from 'path';
import Pinkie from 'pinkie-promise';
import rimraf2 from 'rimraf2';
import url from 'url';

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

describe('errors', () => {
  beforeEach((done) => {
    rimraf2(TEST_DIR, { disableGlob: true }, () => {
      generate(TEST_DIR, STRUCTURE, (err) => {
        done(err);
      });
    });
  });
  after((cb) => rimraf2(TEST_DIR, { disableGlob: true }, () => cb()));

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
    it('should propagate errors', (done) => {
      walk(
        TEST_DIR,
        () => Pinkie.reject(new Error('Failed')),
        (err) => {
          assert.ok(!!err);
          done();
        }
      );
    });
  });
});
