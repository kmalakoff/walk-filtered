const chai = require('chai'); chai.use(require('sinon-chai'));

const { assert } = chai;
const sinon = require('sinon');
const generate = require('fs-generate');
const fs = require('fs-extra');
const sysPath = require('path');
const sleep = require('sleep-promise');

const walk = require('../..');

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

describe('filtering', () => {
  after((callback) => { fs.remove(DIR, callback); });

  describe('sync', () => {
    beforeEach((callback) => { fs.remove(DIR, () => { generate(DIR, STRUCTURE, callback); }); });

    it('Should filter everything under the root directory', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, () => { filterSpy(); return false; }, () => {
        assert.ok(filterSpy.callCount, 1);
        callback();
      });
    });

    it('Should filter everything under specific directories by relative path', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, (path) => { filterSpy(); return (path !== 'dir2'); }, true, () => {
        assert.ok(filterSpy.callCount, 13 - 2);
        callback();
      });
    });

    it('Should filter everything under specific directories by stats and relative path', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, (path, stats) => { filterSpy(); return !stats.isDirectory() || path.startsWith('dir3/dir4'); }, true, () => {
        assert.ok(filterSpy.callCount, 13 - 1);
        callback();
      });
    });
  });

  describe('async', () => {
    beforeEach((callback) => { fs.remove(DIR, () => { generate(DIR, STRUCTURE, callback); }); });

    it('Should filter everything under the root directory', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, (path, callback2) => { filterSpy(); callback2(null, false); }, { async: true }, () => {
        assert.ok(filterSpy.callCount, 1);
        callback();
      });
    });

    it('Should filter everything under specific directories by relative path', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, (path, stats, callback2) => { filterSpy(); callback2(null, (path !== 'dir2')); }, { stats: true, async: true }, () => {
        assert.ok(filterSpy.callCount, 13 - 2);
        callback();
      });
    });

    it('Should filter everything under specific directories by stats and relative path', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, (path, stats) => { filterSpy(); callback(null, !stats.isDirectory() || path.startsWith('dir3/dir4')); }, { stats: true, async: true }, () => {
        assert.ok(filterSpy.callCount, 13 - 1);
        callback();
      });
    });
  });

  describe('promise', () => {
    beforeEach((callback) => { fs.remove(DIR, () => { generate(DIR, STRUCTURE, callback); }); });

    it('Should filter everything under the root directory', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, async () => { filterSpy(); await sleep(50); return false; }, () => {
        assert.ok(filterSpy.callCount, 1);
        callback();
      });
    });

    it('Should filter everything under specific directories by relative path', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, async (path) => {
        filterSpy(); await sleep(50); return path !== 'dir2';
      }, { stats: true }, () => {
        assert.ok(filterSpy.callCount, 13 - 2);
        callback();
      });
    });

    it('Should filter everything under specific directories by stats and relative path', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, async (path, stats) => {
        filterSpy(); await sleep(50); return !stats.isDirectory() || path.startsWith('dir3/dir4');
      }, { stats: true }, () => {
        assert.ok(filterSpy.callCount, 13 - 1);
        callback();
      });
    });
  });
});
