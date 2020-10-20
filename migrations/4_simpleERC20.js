const SimpleERC20 = artifacts.require("SimpleERC20");

module.exports = function (deployer, network, accounts) {
  var owner, backupOwner, heir;
  [owner, backupOwner, heir] = accounts;
  deployer.deploy(SimpleERC20, 10000, {from: heir});
};
