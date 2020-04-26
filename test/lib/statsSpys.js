var sinon = require('sinon');

module.exports = function statsSpys() {
  function spys(stats) {
    if (stats.isSymbolicLink()) spys.link(stats);
    else if (stats.isDirectory()) spys.dir(stats);
    else if (stats.isFile()) spys.file(stats);
    spys.callCount++;
  }
  spys.dir = sinon.spy();
  spys.file = sinon.spy();
  spys.link = sinon.spy();
  spys.callCount = 0;

  return spys;
};
