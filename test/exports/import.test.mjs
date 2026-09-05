import assert from 'assert';
import walk from 'walk-filtered';

describe('exports .mjs', () => {
  it('default', () => {
    assert.equal(typeof walk, 'function');
  });
});
