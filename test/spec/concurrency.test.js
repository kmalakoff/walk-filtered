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

describe('concurrency', () => {
  after((callback) => { fs.remove(DIR, callback); });

  describe('sync', () => {
    beforeEach((callback) => { fs.remove(DIR, () => { generate(DIR, STRUCTURE, callback); }); });

    it('should run with concurrency 1', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, () => { filterSpy(); }, { concurrency: 1 }, (err) => {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });

    it('should run with concurrency 50', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, () => { filterSpy(); }, { concurrency: 50 }, (err) => {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });

    it('should run with concurrency Infinity', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, () => { filterSpy(); }, { concurrency: Infinity }, (err) => {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });
  });

  describe('async', () => {
    beforeEach((callback) => { fs.remove(DIR, () => { generate(DIR, STRUCTURE, callback); }); });

    it('should run with concurrency 1', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, (path, callback2) => { filterSpy(); callback2(); }, { concurrency: 1, async: true }, (err) => {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });

    it('should run with concurrency 50', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, (path, callback2) => { filterSpy(); callback2(); }, { concurrency: 50, async: true }, (err) => {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });

    it('should run with concurrency Infinity', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, (path, callback2) => { filterSpy(); callback2(); }, { concurrency: Infinity, async: true }, (err) => {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });
  });

  describe('promise', () => {
    beforeEach((callback) => { fs.remove(DIR, () => { generate(DIR, STRUCTURE, callback); }); });

    it('should run with concurrency 1', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, async () => { filterSpy(); await sleep(50); }, { concurrency: 1 }, (err) => {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });

    it('should run with concurrency 50', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, async () => { filterSpy(); await sleep(50); }, { concurrency: 50 }, (err) => {
        assert.ok(filterSpy.callCount, 13);
        callback(err);
      });
    });

    it('should run with concurrency Infinity', (callback) => {
      const filterSpy = sinon.spy();

      walk(DIR, async () => { filterSpy(); await sleep(50); }, { concurrency: Infinity }, () => {
        assert.ok(filterSpy.callCount, 13);
        callback();
      });
    });
  });
});
