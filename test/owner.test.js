const Inherichain = artifacts.require("Inherichain");
const Demo = artifacts.require("Demo");
const SimpleERC20 = artifacts.require("SimpleERC20");
const SimpleCentralizedArbitrator = artifacts.require(
  "SimpleCentralizedArbitrator"
);

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

contract("Inherichain (Owner Functions)", (accounts) => {
  let inherichain = null;
  let demo = null;
  let simpleERC20 = null;
  let arbitrator = null;
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
  const arbitratorExtraData = `0x0`;
  const metaEvidence = "";
  const sInitial = 0;
  const sHeirClaimed = 1;
  const sClaimDisputed = 2;
  const sDisputeResultPending = 3;
  const sApproverApproved = 4;
  const sArbitratorApproved = 5;
  const sArbitratorRejected = 6;
  const sInitiatedCharity = 7;
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
    arbitrator = await SimpleCentralizedArbitrator.deployed();
  });

  beforeEach("", async () => {
    inherichain = await Inherichain.new(
      owner,
      backupOwner,
      heir,
      charity,
      arbitrator.address,
      arbitratorExtraData,
      metaEvidence,
      [approverOne, approverTwo, approverThree],
      0,
      0,
      0
    );
  });

  it("Updating Backup Owner by Owner should be possible.", async () => {
    const cOldBackupOwner = await inherichain.backupOwner();
    await inherichain.updateBackupOwner(newBackupOwner);
    const cNewBackupOwner = await inherichain.backupOwner();
    assert.notStrictEqual(
      cOldBackupOwner,
      cNewBackupOwner,
      "Backup Owner in contract is not updated."
    );
    assert.strictEqual(
      cNewBackupOwner,
      newBackupOwner,
      "Backup Owner updation failed."
    );
  });

  it("Updating Backup Owner by outsider should not be possible.", async () => {
    await expectRevert(
      inherichain.updateBackupOwner(newBackupOwner, { from: outsider }),
      "Only owner can call this function."
    );
  });

  it("Updating Zero Address as Backup Owner by Owner should not be possible.", async () => {
    await expectRevert(
      inherichain.updateBackupOwner(constants.ZERO_ADDRESS),
      "Address has to be valid."
    );
  });

  it("Updating Backup Owner to self by Owner should not be possible.", async () => {
    await expectRevert(
      inherichain.updateBackupOwner(owner),
      "Backup owner has to be different from Owner."
    );
  });

  it("Updating Backup Owner should emit backupOwnerUpdated Event.", async () => {
    const receipt = await inherichain.updateBackupOwner(newBackupOwner);
    expectEvent(receipt, "backupOwnerUpdated", {
      _newBackupOwner: newBackupOwner,
      _owner: owner,
    });
  });

  it("Updating Heir by Owner should be possible.", async () => {
    const cOldHeir = await inherichain.heir();
    await inherichain.updateHeir(newHeir);
    const cNewHeir = await inherichain.heir();
    assert.notStrictEqual(
      cOldHeir,
      cNewHeir,
      "Heir in contract is not updated."
    );
    assert.strictEqual(cNewHeir, newHeir, "Heir updation failed.");
  });

  it("Updating Heir by outsider should not be possible.", async () => {
    await expectRevert(
      inherichain.updateHeir(newHeir, { from: outsider }),
      "Only owner can call this function."
    );
  });

  it("Updating Zero Address as Heir by Owner should not be possible.", async () => {
    await expectRevert(
      inherichain.updateHeir(constants.ZERO_ADDRESS),
      "Address has to be valid."
    );
  });

  it("Updating Heir to Owner self by Owner should not be possible.", async () => {
    await expectRevert(
      inherichain.updateHeir(owner),
      "Owner and heir cannot be same."
    );
  });

  it("Updating Heir to Backup Owner by Owner should not be possible.", async () => {
    await expectRevert(
      inherichain.updateHeir(backupOwner),
      "Owner and heir cannot be same."
    );
  });

  it("Updating Heir should reset vote count and reset claim parameters.", async () => {
    const cInitialStatus = await inherichain.status();
    const cInitialClaimTime = await inherichain.claimTime();
    const cInitialVoteCount = await inherichain.voteCount();
    await inherichain.claimOwnership({ from: heir });
    const cAfterClaimStatus = await inherichain.status();
    const cOldClaimTime = await inherichain.claimTime();
    await inherichain.approveHeir(true, { from: approverOne });
    await inherichain.approveHeir(true, { from: approverTwo });
    const cAfterApprovalStatus = await inherichain.status();
    const cOldVoteCount = await inherichain.voteCount();
    await inherichain.updateHeir(newHeir);
    const cNewStatus = await inherichain.status();
    const cNewClaimTime = await inherichain.claimTime();
    const cNewVoteCount = await inherichain.voteCount();
    assert.strictEqual(
      cInitialStatus.toNumber(),
      sInitial,
      "Default status should be Initial."
    );
    assert.strictEqual(
      cInitialClaimTime.toNumber(),
      0,
      "Claim time should be zero by default."
    );
    assert.strictEqual(
      cInitialVoteCount.toNumber(),
      0,
      "Vote Count should be zero by default."
    );
    assert.strictEqual(
      cAfterClaimStatus.toNumber(),
      sHeirClaimed,
      "Status should be HeirClaimed after Heir claims ownership."
    );
    assert.notStrictEqual(
      cOldClaimTime.toNumber(),
      0,
      "Claim time should be non zero after claim."
    );
    assert.strictEqual(
      cAfterApprovalStatus.toNumber(),
      sApproverApproved,
      "Status should be ApproverApproved after majority approver approves."
    );
    assert.strictEqual(
      cOldVoteCount.toNumber(),
      2,
      "Vote Count after two positive vote should be two."
    );
    assert.strictEqual(
      cNewStatus.toNumber(),
      sInitial,
      "Status should be Initial after heir reset."
    );
    assert.strictEqual(
      cNewClaimTime.toNumber(),
      0,
      "Claim time should be zero after updating heir."
    );
    assert.strictEqual(
      cNewVoteCount.toNumber(),
      0,
      "Vote Count should be zero after updating heir."
    );
  });

  it("Updating Heir should emit heirUpdated Event.", async () => {
    const receipt = await inherichain.updateHeir(newHeir);
    expectEvent(receipt, "heirUpdated", {
      _newHeir: newHeir,
      _owner: owner,
    });
  });

  it("Updating both Deadline by Owner should be possible.", async () => {
    const cOldDeadline = await inherichain.heirDeadline();
    const cOldApproverDeadline = await inherichain.heirApprovedDeadline();
    const cOldCharityDeadline = await inherichain.charityDeadline();
    await inherichain.updateDeadline(
      newDeadline,
      newApproverDeadline,
      newCharityDeadline
    );
    const cNewDeadline = await inherichain.heirDeadline();
    const cNewApproverDeadline = await inherichain.heirApprovedDeadline();
    const cNewCharityDeadline = await inherichain.charityDeadline();
    assert.strictEqual(
      cOldDeadline.toNumber(),
      time.duration.days(30).toNumber(),
      "Default deadline is wrong."
    );
    assert.strictEqual(
      cOldApproverDeadline.toNumber(),
      time.duration.days(7).toNumber(),
      "Default approved deadline is wrong."
    );
    assert.strictEqual(
      cOldCharityDeadline.toNumber(),
      time.duration.days(45).toNumber(),
      "Default charity deadline is wrong."
    );
    assert.strictEqual(
      cNewDeadline.toNumber(),
      newDeadline,
      "New deadline is wrong."
    );
    assert.strictEqual(
      cNewApproverDeadline.toNumber(),
      newApproverDeadline,
      "New approved deadline is wrong."
    );
    assert.strictEqual(
      cNewCharityDeadline.toNumber(),
      newCharityDeadline,
      "Default charity deadline is wrong."
    );
  });

  it("Updating both Deadline by outsider should not be possible.", async () => {
    await expectRevert(
      inherichain.updateDeadline(
        newDeadline,
        newApproverDeadline,
        newCharityDeadline,
        {
          from: outsider,
        }
      ),
      "Only owner can call this function."
    );
  });

  it("Updating only heir Deadline by Owner should be possible.", async () => {
    const cOldApproverDeadline = await inherichain.heirApprovedDeadline();
    const cOldCharityDeadline = await inherichain.charityDeadline();
    await inherichain.updateDeadline(newDeadline, 0, 0);
    const cNewDeadline = await inherichain.heirDeadline();
    const cNewApproverDeadline = await inherichain.heirApprovedDeadline();
    const cNewCharityDeadline = await inherichain.charityDeadline();
    assert.strictEqual(
      cNewDeadline.toNumber(),
      newDeadline,
      "New deadline is wrong."
    );
    assert.strictEqual(
      cNewApproverDeadline.toNumber(),
      cOldApproverDeadline.toNumber(),
      "Approved deadline should not have been changed."
    );
    assert.strictEqual(
      cNewCharityDeadline.toNumber(),
      cOldCharityDeadline.toNumber(),
      "Charity deadline should not have been changed."
    );
  });

  it("Updating only approval Deadline by Owner should be possible.", async () => {
    const cOldDeadline = await inherichain.heirDeadline();
    const cOldCharityDeadline = await inherichain.charityDeadline();
    await inherichain.updateDeadline(0, newApproverDeadline, 0);
    const cNewDeadline = await inherichain.heirDeadline();
    const cNewApproverDeadline = await inherichain.heirApprovedDeadline();
    const cNewCharityDeadline = await inherichain.charityDeadline();
    assert.strictEqual(
      cNewDeadline.toNumber(),
      cOldDeadline.toNumber(),
      "Deadline should not have been changed."
    );
    assert.strictEqual(
      cNewApproverDeadline.toNumber(),
      newApproverDeadline,
      "New approved deadline is wrong."
    );
    assert.strictEqual(
      cNewCharityDeadline.toNumber(),
      cOldCharityDeadline.toNumber(),
      "Charity deadline should not have been changed."
    );
  });

  it("Updating Deadline should emit deadlineUpdated Event.", async () => {
    const receipt = await inherichain.updateDeadline(
      newDeadline,
      newApproverDeadline,
      newCharityDeadline
    );
    expectEvent(receipt, "deadlineUpdated", {
      _heirDeadline: new BN(newDeadline),
      _heirApprovedDeadline: new BN(newApproverDeadline),
      _charityDeadline: new BN(newCharityDeadline),
      _owner: owner,
    });
  });

  it("Adding an approver by Owner should be possible.", async () => {
    const cOldApproverCount = await inherichain.approversLength();
    const cOldApproverStatus = await inherichain.approverStatus(newApproverOne);
    await inherichain.addApprover(newApproverOne);
    const cNewApproverCount = await inherichain.approversLength();
    const cNewApproverStatus = await inherichain.approverStatus(newApproverOne);
    assert.strictEqual(
      cNewApproverCount.toNumber(),
      cOldApproverCount.toNumber() + 1,
      "Approver Count increment is wrong."
    );
    assert.strictEqual(
      cOldApproverStatus,
      false,
      "Default Approver Status is wrong."
    );
    assert.strictEqual(
      cNewApproverStatus,
      true,
      "Approver Status after adding is wrong."
    );
  });

  it("Adding an approver by outsider should not be possible.", async () => {
    await expectRevert(
      inherichain.addApprover(newApproverOne, { from: outsider }),
      "Only owner can call this function."
    );
  });

  it("Adding an already added approver should not be possible.", async () => {
    await inherichain.addApprover(newApproverOne);
    await expectRevert(
      inherichain.addApprover(newApproverOne),
      "Approver already added."
    );
  });

  it("Adding a zero address as approver by Owner should not be possible.", async () => {
    await expectRevert(
      inherichain.addApprover(constants.ZERO_ADDRESS),
      "Address has to be valid."
    );
  });

  it("Adding an approver by Owner should emit approverAdded Event.", async () => {
    const receipt = await inherichain.addApprover(newApproverOne);
    expectEvent(receipt, "approverAdded", {
      _newApprover: newApproverOne,
      _owner: owner,
    });
  });

  it("Deleting an approver by Owner should be possible.", async () => {
    await inherichain.addApprover(newApproverOne);
    const cOldApproverCount = await inherichain.approversLength();
    const cOldApproverStatus = await inherichain.approverStatus(newApproverOne);
    await inherichain.deleteApprover(newApproverOne);
    const cNewApproverCount = await inherichain.approversLength();
    const cNewApproverStatus = await inherichain.approverStatus(newApproverOne);
    assert.strictEqual(
      cNewApproverCount.toNumber(),
      cOldApproverCount.toNumber() - 1,
      "Approver Count decrement is wrong."
    );
    assert.strictEqual(
      cOldApproverStatus,
      true,
      "Approver Status after adding is wrong."
    );
    assert.strictEqual(
      cNewApproverStatus,
      false,
      "Approver Status after removing is wrong."
    );
  });

  it("Deleting an approver by outsider should not be possible.", async () => {
    await expectRevert(
      inherichain.deleteApprover(newApproverOne, { from: outsider }),
      "Only owner can call this function."
    );
  });

  it("Deleting a non existing approver by Owner should not be possible.", async () => {
    await expectRevert(
      inherichain.deleteApprover(newApproverOne),
      "Approver is not valid."
    );
  });

  it("Deleting an approver by Owner should emit approverDeleted Event.", async () => {
    await inherichain.addApprover(newApproverOne);
    const receipt = await inherichain.deleteApprover(newApproverOne);
    expectEvent(receipt, "approverDeleted", {
      _deletedApprover: newApproverOne,
      _owner: owner,
    });
  });

  it("Fallback function call by Owner should be possible.", async () => {
    const valueToUpdate = randomValue();
    const signature = web3.utils.sha3("set(uint256)").slice(0, 10);
    const msgData =
      signature +
      web3.utils.toHex(valueToUpdate).slice(2).padStart(64, "0") +
      demo.address.slice(2).padStart(64, "0");
    await web3.eth.sendTransaction({
      from: owner,
      to: inherichain.address,
      // value: ???,
      // gas: ???,
      // gasPrice: ???,
      data: msgData,
    });
    const cNewValue = await demo.get();
    assert.strictEqual(cNewValue.toNumber(), valueToUpdate);
  });

  it("Fallback function call by outsider should not be possible.", async () => {
    const valueToUpdate = randomValue();
    const signature = web3.utils.sha3("set(uint256)").slice(0, 10);
    const msgData =
      signature +
      web3.utils.toHex(valueToUpdate).slice(2).padStart(64, "0") +
      demo.address.slice(2).padStart(64, "0");
    await web3.eth
      .sendTransaction({
        from: outsider,
        to: inherichain.address,
        // value: ???,
        // gas: ???,
        // gasPrice: ???,
        data: msgData,
      })
      .then(() => {
        assert(false);
      }) // Should not have succeeded.
      .catch(() => {
        assert(true);
      }); // Should have failed.
  });

  it("Fallback function should have a non zero address as contract address.", async () => {
    const valueToUpdate = randomValue();
    const signature = web3.utils.sha3("set(uint256)").slice(0, 10);
    const msgData =
      signature +
      web3.utils.toHex(valueToUpdate).slice(2).padStart(64, "0") +
      constants.ZERO_ADDRESS.slice(2).padStart(64, "0");
    await web3.eth
      .sendTransaction({
        from: owner,
        to: inherichain.address,
        // value: ???,
        // gas: ???,
        // gasPrice: ???,
        data: msgData,
      })
      .then(() => {
        assert(false);
      }) // Should not have succeeded.
      .catch(() => {
        assert(true);
      }); // Should have failed.
  });

  it("Should be able to deposit & withdraw an ERC20 Token by Owner.", async () => {
    const valueToDeposit = randomValue();
    await simpleERC20.transfer(inherichain.address, valueToDeposit, {
      from: heir,
    });
    const cOldERC20Bal = await simpleERC20.balanceOf(inherichain.address);
    const signature = web3.utils.sha3("transfer(address,uint256)").slice(0, 10);
    const msgData =
      signature +
      backupOwner.slice(2).padStart(64, "0") +
      web3.utils.toHex(valueToDeposit).slice(2).padStart(64, "0") +
      simpleERC20.address.slice(2).padStart(64, "0");
    await web3.eth.sendTransaction({
      from: owner,
      to: inherichain.address,
      data: msgData,
    });
    const cNewERC20Bal = await simpleERC20.balanceOf(inherichain.address);
    const cNewBackupOwnerERC20Bal = await simpleERC20.balanceOf(backupOwner);
    assert.strictEqual(
      cOldERC20Bal.toNumber(),
      valueToDeposit,
      "ERC20 Not correctly deposited to Contract."
    );
    assert.strictEqual(
      cNewERC20Bal.toNumber(),
      0,
      "ERC20 not correctly sent from the contract."
    );
    assert.strictEqual(
      cNewBackupOwnerERC20Bal.toNumber(),
      valueToDeposit,
      "ERC20 not correctly sent to the intended address."
    );
  });

  it("Should not be able to withdraw an ERC20 Token by Outsider.", async () => {
    const valueToDeposit = randomValue();
    const signature = web3.utils.sha3("transfer(address,uint256)").slice(0, 10);
    const msgData =
      signature +
      backupOwner.slice(2).padStart(64, "0") +
      web3.utils.toHex(valueToDeposit).slice(2).padStart(64, "0") +
      simpleERC20.address.slice(2).padStart(64, "0");
    await web3.eth
      .sendTransaction({
        from: outsider,
        to: inherichain.address,
        data: msgData,
      })
      .then(() => {
        assert(false);
      }) // Should not have succeeded.
      .catch(() => {
        assert(true);
      }); // Should have failed.
  });

  it("Contract deployment by Owner should be possible.", async () => {
    const inherichainReceipt = await inherichain.deployContract(
      0,
      demoBytecode
    );
    expectEvent(inherichainReceipt, "contractDeployed", {
      _owner: owner,
    });
    const demoAddress = inherichainReceipt.logs[0].args._contractAddress;
    const demoInstance = await Demo.at(demoAddress);
    const valueToUpdate = randomValue();
    const demoReceipt = await demoInstance.set(valueToUpdate);
    expectEvent(demoReceipt, "newValue", {
      _value: new BN(valueToUpdate),
    });
    const cNewValueDemo = await demoInstance.get();
    assert.strictEqual(
      cNewValueDemo.toNumber(),
      valueToUpdate,
      "Deployed contract is not working correctly."
    );
  });

  it("Contract deployment by Outsider should not be possible.", async () => {
    await expectRevert(
      inherichain.deployContract(0, demoBytecode, { from: outsider }),
      "Only owner can call this function."
    );
  });

  it("Should be able to withdraw all ether by Owner.", async () => {
    await send.ether(owner, inherichain.address, transferValue);
    const cOldBalance = await balance.current(inherichain.address);
    const ownerOldBalance = await balance.current(owner);
    const receipt = await inherichain.withdrawAllETH();
    const gasUsed = new BN(receipt.receipt.gasUsed);
    const gasPrice = new BN(
      JSON.parse(
        JSON.stringify(await web3.eth.getTransaction(receipt.tx))
      ).gasPrice
    );
    const cNewBalance = await balance.current(
      inherichain.address,
      (unit = "wei")
    );
    const ownerNewBalance = await balance.current(owner);
    expectEvent(receipt, "ethWithdrawed", {
      _amount: transferValue,
      _receiver: owner,
    });
    assert(
      cNewBalance.eq(cOldBalance.sub(transferValue)),
      "Balance in contract not updated correctly."
    );
    assert(
      ownerNewBalance.eq(
        ownerOldBalance.add(transferValue).sub(gasUsed.mul(gasPrice))
      ),
      "Balance in owner wallet not updated correctly."
    );
  });

  it("Should be able to withdraw partial ether by Owner.", async () => {
    await send.ether(owner, inherichain.address, transferValue);
    const cOldBalance = await balance.current(inherichain.address);
    const ownerOldBalance = await balance.current(owner);
    const receipt = await inherichain.withdrawSomeETH(transferPartialValue);
    const gasUsed = new BN(receipt.receipt.gasUsed);
    const gasPrice = new BN(
      JSON.parse(
        JSON.stringify(await web3.eth.getTransaction(receipt.tx))
      ).gasPrice
    );
    const cNewBalance = await balance.current(
      inherichain.address,
      (unit = "wei")
    );
    const ownerNewBalance = await balance.current(owner);
    expectEvent(receipt, "ethWithdrawed", {
      _amount: transferPartialValue,
      _receiver: owner,
    });
    assert(
      cNewBalance.eq(cOldBalance.sub(transferPartialValue)),
      "Balance in contract not updated correctly."
    );
    assert(
      ownerNewBalance.eq(
        ownerOldBalance.add(transferPartialValue).sub(gasUsed.mul(gasPrice))
      ),
      "Balance in owner wallet not updated correctly."
    );
  });

  it("Should not be able to withdraw ether amount higher than contract balance by Owner.", async () => {
    await expectRevert(
      inherichain.withdrawSomeETH(transferValue),
      "Amount requested greater than balance."
    );
  });

  it("Should not be able to withdraw all ether by Outsider.", async () => {
    await expectRevert(
      inherichain.withdrawAllETH({ from: outsider }),
      "Only owner can call this function."
    );
  });

  it("Should not be able to withdraw partial ether by Outsider.", async () => {
    await expectRevert(
      inherichain.withdrawSomeETH(transferValue, { from: outsider }),
      "Only owner can call this function."
    );
  });

  it("Should be able to transfer ether by Owner.", async () => {
    const transferValue = web3.utils.toWei(new BN(1), "ether");
    await send.ether(owner, inherichain.address, transferValue);
    const cOldBalance = await balance.current(inherichain.address);
    const oldBackupOwnerBalance = await balance.current(backupOwner);
    const receipt = await inherichain.transferETH(backupOwner, transferValue);
    const cNewBalance = await balance.current(
      inherichain.address,
      (unit = "wei")
    );
    const newBackupOwnerBalance = await balance.current(backupOwner);
    expectEvent(receipt, "ethTransferred", {
      _amount: transferValue,
      _receiver: backupOwner,
    });
    assert(
      newBackupOwnerBalance.eq(oldBackupOwnerBalance.add(transferValue)),
      "Ether not received correctly to Backup Owner."
    );
    assert(
      cOldBalance.eq(transferValue),
      "Ether not received correctly in Contract."
    );
    assert.strictEqual(
      cNewBalance.toNumber(),
      0,
      "Contract balance not updated correctly."
    );
  });

  it("Should not be able to transfer ether by Outsider.", async () => {
    await expectRevert(
      inherichain.transferETH(backupOwner, transferValue, { from: outsider }),
      "Only owner can call this function."
    );
  });

  it("Updating an Owner by Owner should be possible.", async () => {
    await inherichain.updateOwner(newBackupOwner);
    const cNewOwner = await inherichain.owner();
    assert.strictEqual(
      cNewOwner,
      newBackupOwner,
      "Updating owner is unsuccessful."
    );
  });

  it("Updating an Owner by Outsider should not be possible.", async () => {
    await expectRevert(
      inherichain.updateOwner(newBackupOwner, { from: outsider }),
      "Only primary or backup owner can call this function."
    );
  });

  it("Updating a Zero Address as Owner by Owner should not be possible.", async () => {
    await expectRevert(
      inherichain.updateOwner(constants.ZERO_ADDRESS),
      "Address has to be valid."
    );
  });

  it("Updating an Owner by Owner should emit the ownerUpdated Event.", async () => {
    const receipt = await inherichain.updateOwner(newBackupOwner);
    expectEvent(receipt, "ownerUpdated", {
      _newOwner: newBackupOwner,
      _oldOwner: owner,
      _changer: owner,
    });
  });
});
