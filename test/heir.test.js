const Inherichain = artifacts.require("Inherichain");
const Demo = artifacts.require("Demo");
const SimpleERC20 = artifacts.require("SimpleERC20");

const {
  time, // Convert different time units to seconds. Available helpers are: seconds, minutes, hours, days, weeks and years.
  BN, // Big Number support.
  constants, // Common constants, like the zero address and largest integers.
  expectEvent, // Assertions for emitted events.
  expectRevert, // Assertions for transactions that should fail.
  balance, // For checking ether balance of an address.
  send, // For sending ether and transactions.
} = require("@openzeppelin/test-helpers");

function randomValue() {
  return Math.floor(Math.random() * 1000);
}

contract("Inherichain (Heir Functions)", (accounts) => {
  let inherichain = null;
  let demo = null;
  let simpleERC20 = null;
  let owner,
    backupOwner,
    heir,
    charity,
    approverOne,
    approverTwo,
    approverThree,
    newBackupOwner,
    newHeir,
    newApproverOne,
    newApproverTwo,
    newApproverThree,
    outsider;
  const sInitial = 0;
  const sHeirClaimed = 1;
  const sApproverApproved = 2;
  const sInitiatedCharity = 3;
  const deadline = time.duration.days(30).toNumber();
  const approverDeadline = time.duration.days(7).toNumber();
  const charityDeadline = time.duration.days(45).toNumber();
  const newDeadline = time.duration.days(60).toNumber();
  const newApproverDeadline = time.duration.days(14).toNumber();
  const newCharityDeadline = time.duration.days(90).toNumber();
  const demoBytecode =
    "0x608060405234801561001057600080fd5b506101af806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80633fa4f2451461005157806360fe47b11461006f5780636d4ce63c146100b3578063767800de146100d1575b600080fd5b610059610105565b6040518082815260200191505060405180910390f35b61009b6004803603602081101561008557600080fd5b810190808035906020019092919050505061010b565b60405180821515815260200191505060405180910390f35b6100bb61014a565b6040518082815260200191505060405180910390f35b6100d9610153565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b60005481565b600081600081905550817f44772b8c37c7d91700fb4f50422a6a6a1419a2b1360e62218c26998c1b2e02c160405160405180910390a260019050919050565b60008054905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff168156fea264697066735822122012df8d70209ff3a7bcf7e7681d6c5bb2ed5f1eba9fab9b8928dfe0a473e2a27964736f6c63430007000033";
  const transferValue = new BN(web3.utils.toWei("0.5", "ether"));
  const transferPartialValue = new BN(web3.utils.toWei("0.1", "ether"));

  before("Initiating Accounts.", async () => {
    assert.isAtLeast(
      accounts.length,
      14,
      "Atleast 14 Accounts are required to test the contracts."
    );
    [
      owner,
      backupOwner,
      heir,
      charity,
      approverOne,
      approverTwo,
      approverThree,
      newBackupOwner,
      newHeir,
      newCharity,
      newApproverOne,
      newApproverTwo,
      newApproverThree,
      outsider,
    ] = accounts;
    // inherichain = await Inherichain.deployed();
    demo = await Demo.deployed();
    simpleERC20 = await SimpleERC20.deployed();
  });

  beforeEach("", async () => {
    inherichain = await Inherichain.new(
      owner,
      backupOwner,
      heir,
      charity,
      [approverOne, approverTwo, approverThree],
      0,
      0,
      0
    );
  });

  it("Claim ownership by Heir should be possible.", async () => {
    const cOldStatus = await inherichain.status();
    const cOldClaimTime = await inherichain.claimTime();
    await inherichain.claimOwnership({from: heir});
    const cNewStatus = await inherichain.status();
    const cNewClaimTime = await inherichain.claimTime();
    assert.strictEqual(
      cOldStatus.toNumber(),
      sInitial,
      "Default Status should be Initial."
    );
    assert.strictEqual(
      cOldClaimTime.toNumber(),
      0,
      "Default Claim Start Time is Wrong."
    );
    assert.strictEqual(
      cNewStatus.toNumber(),
      sHeirClaimed,
      "Updated Status after heir claim is Wrong."
    );
    assert.notStrictEqual(
      cNewClaimTime.toNumber(),
      0,
      "Updated Claim Start Time is Wrong."
    );
  });

  it("Claim ownership by Outsider should not be possible.", async () => {
    await expectRevert(
      inherichain.claimOwnership({from: outsider}),
      "Only heir can call this function."
    );
  });

  it("Claim ownership by Heir twice should not be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await expectRevert(
      inherichain.claimOwnership({from: heir}),
      "Claim already started."
    );
  });

  it("Claim ownership by Heir should emit the ownershipClaimed Event.", async () => {
    const receipt = await inherichain.claimOwnership({from: heir});
    expectEvent(receipt, "ownershipClaimed", {
      _heir: heir,
      // _claimTime: ,
    });
  });

  it("Accessing ownership with approver votes by heir should be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await inherichain.approveHeir(true, {from: approverOne});
    await inherichain.approveHeir(true, {from: approverTwo});
    await time.increase(approverDeadline + 1);
    await inherichain.accessOwnershipFromApprover(
      newBackupOwner,
      newHeir,
      [newApproverOne, newApproverTwo, newApproverThree],
      newDeadline,
      newApproverDeadline,
      newCharityDeadline,
      {from: heir}
    );
    const cNewStatus = await inherichain.status();
    const cNewOwner = await inherichain.owner();
    const cNewBackupOwner = await inherichain.backupOwner();
    const cNewHeir = await inherichain.heir();
    const cNewApproversLength = await inherichain.approversLength();
    const cOldApproverOneStatus = await inherichain.approverStatus(approverOne);
    const cOldApproverTwoStatus = await inherichain.approverStatus(approverTwo);
    const cOldApproverThreeStatus = await inherichain.approverStatus(
      approverThree
    );
    const cNewApproverOneStatus = await inherichain.approverStatus(
      newApproverOne
    );
    const cNewApproverTwoStatus = await inherichain.approverStatus(
      newApproverTwo
    );
    const cNewApproverThreeStatus = await inherichain.approverStatus(
      newApproverThree
    );
    assert.strictEqual(
      cNewStatus.toNumber(),
      sInitial,
      "Claim Status after majority voting is wrong."
    );
    assert.strictEqual(
      cNewOwner,
      heir,
      "Updating Owner from ownership claim is wrong."
    );
    assert.strictEqual(
      cNewBackupOwner,
      newBackupOwner,
      "Updating Backup Owner from ownership claim is wrong."
    );
    assert.strictEqual(
      cNewHeir,
      newHeir,
      "Updating Heir from ownership claim is wrong."
    );
    assert.strictEqual(
      cNewApproversLength.toNumber(),
      3,
      "Updating Approvers from ownership claim is wrong."
    );
    assert.strictEqual(
      cOldApproverOneStatus,
      false,
      "Previous Approver should be invalidated."
    );
    assert.strictEqual(
      cOldApproverTwoStatus,
      false,
      "Previous Approver should be invalidated."
    );
    assert.strictEqual(
      cOldApproverThreeStatus,
      false,
      "Previous Approver should be invalidated."
    );
    assert.strictEqual(
      cNewApproverOneStatus,
      true,
      "New Approver should be validated."
    );
    assert.strictEqual(
      cNewApproverTwoStatus,
      true,
      "New Approver should be validated."
    );
    assert.strictEqual(
      cNewApproverThreeStatus,
      true,
      "New Approver should be validated."
    );
  });

  it("Accessing ownership without approver votes by heir should not be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await expectRevert(
      inherichain.accessOwnershipFromApprover(
        newBackupOwner,
        newHeir,
        [newApproverOne, newApproverTwo, newApproverThree],
        newDeadline,
        newApproverDeadline,
        newCharityDeadline,
        {from: heir}
      ),
      "Majority vote required to access ownership."
    );
  });

  it("Accessing ownership with approver votes by outsider should not be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await inherichain.approveHeir(true, {from: approverOne});
    await inherichain.approveHeir(true, {from: approverTwo});
    await expectRevert(
      inherichain.accessOwnershipFromApprover(
        newBackupOwner,
        newHeir,
        [newApproverOne, newApproverTwo, newApproverThree],
        newDeadline,
        newApproverDeadline,
        newCharityDeadline,
        {from: outsider}
      ),
      "Only heir can call this function."
    );
  });

  it("Accessing ownership without approver votes by outsider should not be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await expectRevert(
      inherichain.accessOwnershipFromApprover(
        newBackupOwner,
        newHeir,
        [newApproverOne, newApproverTwo, newApproverThree],
        newDeadline,
        newApproverDeadline,
        newCharityDeadline,
        {from: outsider}
      ),
      "Only heir can call this function."
    );
  });

  it("Accessing ownership from approver votes before approver deadline by heir should not be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await inherichain.approveHeir(true, {from: approverOne});
    await inherichain.approveHeir(true, {from: approverTwo});
    await expectRevert(
      inherichain.accessOwnershipFromApprover(
        newBackupOwner,
        newHeir,
        [newApproverOne, newApproverTwo, newApproverThree],
        newDeadline,
        newApproverDeadline,
        newCharityDeadline,
        {from: heir}
      ),
      "Deadline has not passed."
    );
  });

  it("Accessing ownership from approver votes by heir should emit ownershipAccessed Event.", async () => {
    await inherichain.claimOwnership({from: heir});
    await inherichain.approveHeir(true, {from: approverOne});
    await inherichain.approveHeir(true, {from: approverTwo});
    await time.increase(approverDeadline + 1);
    const receipt = await inherichain.accessOwnershipFromApprover(
      newBackupOwner,
      newHeir,
      [newApproverOne, newApproverTwo, newApproverThree],
      newDeadline,
      newApproverDeadline,
      newCharityDeadline,
      {from: heir}
    );
    expectEvent(receipt, "ownershipAccessed", {
      _newOwner: heir,
      _newBackupOwner: newBackupOwner,
      _heir: newHeir,
      _approverCount: new BN(3),
      _heirDeadline: new BN(newDeadline),
      _heirApprovedDeadline: new BN(newApproverDeadline),
    });
  });

  it("Accessing ownership after deadline by heir should be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await time.increase(deadline + 1);
    await inherichain.accessOwnershipAfterDeadline(
      newBackupOwner,
      newHeir,
      [newApproverOne, newApproverTwo, newApproverThree],
      newDeadline,
      newApproverDeadline,
      newCharityDeadline,
      {from: heir}
    );
    const cNewStatus = await inherichain.status();
    const cNewOwner = await inherichain.owner();
    const cNewBackupOwner = await inherichain.backupOwner();
    const cNewHeir = await inherichain.heir();
    const cNewApproversLength = await inherichain.approversLength();
    const cOldApproverOneStatus = await inherichain.approverStatus(approverOne);
    const cOldApproverTwoStatus = await inherichain.approverStatus(approverTwo);
    const cOldApproverThreeStatus = await inherichain.approverStatus(
      approverThree
    );
    const cNewApproverOneStatus = await inherichain.approverStatus(
      newApproverOne
    );
    const cNewApproverTwoStatus = await inherichain.approverStatus(
      newApproverTwo
    );
    const cNewApproverThreeStatus = await inherichain.approverStatus(
      newApproverThree
    );
    assert.strictEqual(
      cNewStatus.toNumber(),
      sInitial,
      "Status after ownership access is wrong."
    );
    assert.strictEqual(
      cNewOwner,
      heir,
      "Updating Owner from ownership claim is wrong."
    );
    assert.strictEqual(
      cNewBackupOwner,
      newBackupOwner,
      "Updating Backup Owner from ownership claim is wrong."
    );
    assert.strictEqual(
      cNewHeir,
      newHeir,
      "Updating Heir from ownership claim is wrong."
    );
    assert.strictEqual(
      cNewApproversLength.toNumber(),
      3,
      "Updating Approvers from ownership claim is wrong."
    );
    assert.strictEqual(
      cOldApproverOneStatus,
      false,
      "Previous Approver should be invalidated."
    );
    assert.strictEqual(
      cOldApproverTwoStatus,
      false,
      "Previous Approver should be invalidated."
    );
    assert.strictEqual(
      cOldApproverThreeStatus,
      false,
      "Previous Approver should be invalidated."
    );
    assert.strictEqual(
      cNewApproverOneStatus,
      true,
      "New Approver should be validated."
    );
    assert.strictEqual(
      cNewApproverTwoStatus,
      true,
      "New Approver should be validated."
    );
    assert.strictEqual(
      cNewApproverThreeStatus,
      true,
      "New Approver should be validated."
    );
  });

  it("Accessing ownership before deadline by heir should not be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await expectRevert(
      inherichain.accessOwnershipAfterDeadline(
        newBackupOwner,
        newHeir,
        [newApproverOne, newApproverTwo, newApproverThree],
        newDeadline,
        newApproverDeadline,
        newCharityDeadline,
        {from: heir}
      ),
      "Deadline has not passed."
    );
  });

  it("Accessing ownership after deadline by outsider should not be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await time.increase(deadline + 1);
    await expectRevert(
      inherichain.accessOwnershipAfterDeadline(
        newBackupOwner,
        newHeir,
        [newApproverOne, newApproverTwo, newApproverThree],
        newDeadline,
        newApproverDeadline,
        newCharityDeadline,
        {from: outsider}
      ),
      "Only heir can call this function."
    );
  });

  it("Accessing ownership before deadline by outsider should not be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await time.increase(deadline + 1);
    await expectRevert(
      inherichain.accessOwnershipAfterDeadline(
        newBackupOwner,
        newHeir,
        [newApproverOne, newApproverTwo, newApproverThree],
        newDeadline,
        newApproverDeadline,
        newCharityDeadline,
        {from: outsider}
      ),
      "Only heir can call this function."
    );
  });

  it("Accessing ownership after deadline by heir should emit ownershipAccessed Event.", async () => {
    await inherichain.claimOwnership({from: heir});
    await time.increase(deadline + 1);
    const receipt = await inherichain.accessOwnershipAfterDeadline(
      newBackupOwner,
      newHeir,
      [newApproverOne, newApproverTwo, newApproverThree],
      newDeadline,
      newApproverDeadline,
      newCharityDeadline,
      {from: heir}
    );
    expectEvent(receipt, "ownershipAccessed", {
      _newOwner: heir,
      _newBackupOwner: newBackupOwner,
      _heir: newHeir,
      _approverCount: new BN(3),
      _heirDeadline: new BN(newDeadline),
      _heirApprovedDeadline: new BN(newApproverDeadline),
    });
  });

});
