const assert = require('assert');
const walk = require('walk-filtered');

describe('exports .cjs', () => {
  it('default', () => {
    assert.equal(typeof walk, 'function');
  });
});
