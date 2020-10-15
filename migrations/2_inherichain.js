const Inherichain = artifacts.require("Inherichain");

module.exports = function(deployer, network, accounts) {
    var owner, backupOwner, heir, approverOne, approverTwo, approverThree;
    [ owner, backupOwner, heir, approverOne, approverTwo, approverThree ] = accounts;
    deployer.deploy(Inherichain, owner, backupOwner, heir, [approverOne, approverTwo, approverThree], 0, 0);
};