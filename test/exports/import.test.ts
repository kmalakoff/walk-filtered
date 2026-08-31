import assert from 'assert';
import walk from 'walk-filtered';

describe('exports .ts', () => {
  it('default', () => {
    assert.equal(typeof walk, 'function');
  });
});
