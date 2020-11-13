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

contract("Inherichain (Approver Functions)", (accounts) => {
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

  it("Approving heir by Approver should be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    const cOldVoteCount = await inherichain.voteCount();
    const cOldApproverOneVote = await inherichain.voted(approverOne);
    await inherichain.approveHeir(true, {from: approverOne});
    const cNewVoteCount = await inherichain.voteCount();
    const cNewApproverOneVote = await inherichain.voted(approverOne);
    assert.strictEqual(
      cNewVoteCount.toNumber(),
      cOldVoteCount.toNumber() + 1,
      "Vote not counted correctly."
    );
    assert.strictEqual(
      cOldApproverOneVote,
      false,
      "Default Approver One vote value wrong."
    );
    assert.strictEqual(
      cNewApproverOneVote,
      true,
      "Updated Approver One vote value wrong."
    );
  });

  it("Rejecting heir by Approver should be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    const cOldVoteCount = await inherichain.voteCount();
    const cOldApproverOneVote = await inherichain.voted(approverOne);
    await inherichain.approveHeir(false, {from: approverOne});
    const cNewVoteCount = await inherichain.voteCount();
    const cNewApproverOneVote = await inherichain.voted(approverOne);
    assert.strictEqual(
      cNewVoteCount.toNumber(),
      cOldVoteCount.toNumber(),
      "Vote not updated correctly."
    );
    assert.strictEqual(
      cOldApproverOneVote,
      false,
      "Default Approver One vote value wrong."
    );
    assert.strictEqual(
      cNewApproverOneVote,
      true,
      "Updated Approver One vote value wrong."
    );
  });

  it("Approving heir by Outsider should not be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await expectRevert(
      inherichain.approveHeir(true, {from: outsider}),
      "Only an approver can call this function."
    );
  });

  it("Rejecting heir by Outsider should not be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await expectRevert(
      inherichain.approveHeir(false, {from: outsider}),
      "Only an approver can call this function."
    );
  });

  it("Approving heir by Approver twice should not be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await inherichain.approveHeir(true, {from: approverOne});
    await expectRevert(
      inherichain.approveHeir(true, {from: approverOne}),
      "Already voted."
    );
  });

  it("Rejecting heir by Approver twice should not be possible.", async () => {
    await inherichain.claimOwnership({from: heir});
    await inherichain.approveHeir(false, {from: approverOne});
    await expectRevert(
      inherichain.approveHeir(false, {from: approverOne}),
      "Already voted."
    );
  });

  it("Without heir claiming ownership, voting by Approver should not be possible.", async () => {
    await expectRevert(
      inherichain.approveHeir(true, {from: approverOne}),
      "Claim has not started yet."
    );
  });

  it("With majority approving heir, the majority vote by Approver should emit heirApproved Event.", async () => {
    await inherichain.claimOwnership({from: heir});
    await inherichain.approveHeir(true, {from: approverOne});
    const receipt = await inherichain.approveHeir(true, {from: approverTwo});
    expectEvent(receipt, "heirApproved", {
      _approveCount: new BN(2),
    });
  });

  it("Approving heir by Approver should emit heirApproval Event.", async () => {
    await inherichain.claimOwnership({from: heir});
    const receipt = await inherichain.approveHeir(false, {from: approverOne});
    expectEvent(receipt, "heirApproval", {
      _approver: approverOne,
      _status: false,
    });
  });

});
