const Inherichain = artifacts.require("Inherichain");
const SimpleCentralizedArbitrator = artifacts.require(
  "SimpleCentralizedArbitrator"
);

module.exports = function (deployer, network, accounts) {
  var owner,
    backupOwner,
    heir,
    charity,
    approverOne,
    approverTwo,
    approverThree;
  [
    owner,
    backupOwner,
    heir,
    charity,
    approverOne,
    approverTwo,
    approverThree,
  ] = accounts;
  deployer.deploy(SimpleCentralizedArbitrator).then(function () {
    return deployer.deploy(
      Inherichain,
      owner,
      backupOwner,
      heir,
      charity,
      SimpleCentralizedArbitrator.address,
      `0x0`,
      "",
      [approverOne, approverTwo, approverThree],
      0,
      0,
      0
    );
  });
};
