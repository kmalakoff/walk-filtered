const chai = require('chai'); chai.use(require('sinon-chai'));

const { assert } = chai;
const sinon = require('sinon');
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

describe('stats', () => {
  beforeEach((callback) => { fs.remove(DIR, () => { generate(DIR, STRUCTURE, callback); }); });
  after((callback) => { fs.remove(DIR, callback); });

  it('should be default false', (callback) => {
    const statsSpy = sinon.spy();

    walk(DIR, (path, stats) => { statsSpy(stats); }, () => {
      assert.ok(statsSpy.callCount, 13);
      statsSpy.args.forEach((args) => { assert.isUndefined(args[0]); });
      callback();
    });
  });

  it('false (argument) should not return a stats', (callback) => {
    const statsSpy = sinon.spy();

    walk(DIR, (path, stats) => { statsSpy(stats); }, false, () => {
      assert.ok(statsSpy.callCount, 13);
      statsSpy.args.forEach((args) => { assert.isUndefined(args[0]); });
      callback();
    });
  });

  it('false (option) should not return a stats', (callback) => {
    const statsSpy = sinon.spy();

    walk(DIR, (path, stats) => { statsSpy(stats); }, { stats: false }, () => {
      assert.ok(statsSpy.callCount, 13);
      statsSpy.args.forEach((args) => { assert.isUndefined(args[0]); });
      callback();
    });
  });

  it('false (argument) should not return a stats', (callback) => {
    const spys = statsSpys();
    const statsSpy = sinon.spy();

    walk(DIR, (path, stats) => { spys(stats, path); statsSpy(stats); }, true, () => {
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      assert.ok(statsSpy.callCount, 13);
      statsSpy.args.forEach((args) => { assert.isDefined(args[0]); });
      callback();
    });
  });

  it('false (option) should not return a stats', (callback) => {
    const spys = statsSpys();
    const statsSpy = sinon.spy();

    walk(DIR, (path, stats) => { spys(stats, path); statsSpy(stats); }, { stats: true }, () => {
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 2);
      assert.ok(statsSpy.callCount, 13);
      statsSpy.args.forEach((args) => { assert.isDefined(args[0]); });
      callback();
    });
  });

  it('should be able to use stats to filter symlinks', (callback) => {
    const spys = statsSpys();
    const statsSpy = sinon.spy();

    walk(DIR, (path, stats) => { if (!stats.isSymbolicLink()) spys(stats, path); statsSpy(stats); }, true, () => {
      assert.equal(spys.dir.callCount, 6);
      assert.equal(spys.file.callCount, 5);
      assert.equal(spys.link.callCount, 0);
      assert.ok(statsSpy.callCount, 13 - 2);
      statsSpy.args.forEach((args) => { assert.isDefined(args[0]); });
      callback();
    });
  });
});
