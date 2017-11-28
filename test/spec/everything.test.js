const chai = require('chai'); chai.use(require('sinon-chai'));

const { assert } = chai;
const generate = require('fs-generate');
const fs = require('fs-extra');
const sysPath = require('path');

const walk = require('../..');
const { statsSpys } = require('../utils');

const DIR = sysPath.resolve(sysPath.join(__dirname, '..', 'data'));
const STRUCTURE = {
  file1: 'a',
  file2: 'b',
  dir1: null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  link1: '~dir3/dir4/file1',
  'dir3/link2': '~dir2/file1',
};

describe('walk everything', () => {
  beforeEach((callback) => { fs.remove(DIR, () => { generate(DIR, STRUCTURE, callback); }); });
  after((callback) => { fs.remove(DIR, callback); });

  it('Should find everything with no return', (callback) => {
    const spys = statsSpys();

    walk(DIR, (path, stats) => { spys(stats, path); }, true, () => {
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      callback();
    });
  });

  it('Should find everything with return true', (callback) => {
    const spys = statsSpys();

    walk(DIR, (path, stats) => { spys(stats, path); return true; }, true, () => {
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      callback();
    });
  });
});
