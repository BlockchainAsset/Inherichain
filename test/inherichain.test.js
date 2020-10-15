const Inherichain = artifacts.require('Inherichain');

const {
    time,         // Convert different time units to seconds. Available helpers are: seconds, minutes, hours, days, weeks and years.
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

contract('Inherichain', (accounts) => {
    let inherichain = null;
    let owner, backupOwner, heir, approverOne, approverTwo, approverThree, newBackupOwner, newHeir, newApproverOne, newApproverTwo, newApproverThree, outsider;
    const deadline = time.duration.days(30).toNumber();
    const approverDeadline = time.duration.days(7).toNumber();
    const newDeadline = time.duration.days(60).toNumber();
    const newApproverDeadline = time.duration.days(14).toNumber();

    async function newInstance() {
        inherichain = await Inherichain.new(owner, backupOwner, heir, [approverOne, approverTwo, approverThree], 0, 0);
    }

    before('Initiating Accounts.', async () => {
        assert.isAtLeast(accounts.length, 12, "Atleast 12 Accounts are required to test the contracts.");
        [owner, backupOwner, heir, approverOne, approverTwo, approverThree, newBackupOwner, newHeir, newApproverOne, newApproverTwo, newApproverThree, outsider] = accounts;
        // inherichain = await Inherichain.deployed();
    });

    beforeEach('', async () => {
        inherichain = await Inherichain.new(owner, backupOwner, heir, [approverOne, approverTwo, approverThree], 0, 0);
    })

    it('Should create the contract correctly.', async () => {
        const cHeirDeadline = await inherichain.heirDeadline();
        const cHeirApprovedDeadline = await inherichain.heirApprovedDeadline();
        const cOwner = await inherichain.owner();
        const cBackupOwner = await inherichain.backupOwner();
        const cHeir = await inherichain.heir();
        const cApproverOneStatus = await inherichain.approverStatus(approverOne);
        const cApproverTwoStatus = await inherichain.approverStatus(approverTwo);
        const cApproverThreeStatus = await inherichain.approverStatus(approverThree);
        const cApproversLength = await inherichain.approversLength();
        assert.strictEqual(cHeirDeadline.toNumber(), 30*24*60*60, "Default deadline is not set.");
        assert.strictEqual(cHeirApprovedDeadline.toNumber(), 7*24*60*60, "Default approved deadline is not set.");
        assert.strictEqual(cOwner, owner, "Owner set in contract is wrong.");
        assert.strictEqual(cBackupOwner, backupOwner, "Backup Owner set in contract is wrong.");
        assert.strictEqual(cHeir, heir, "Heir set in contract is wrong.");
        assert.strictEqual(cApproverOneStatus, true, "Approver One status not set correctly.");
        assert.strictEqual(cApproverTwoStatus, true, "Approver Two status not set correctly.");
        assert.strictEqual(cApproverThreeStatus, true, "Approver Three status not set correctly.");
        assert.strictEqual(cApproversLength.toNumber(), 3, "Approver Length in contract is wrong.");
    });

    it('Updating Backup Owner by Owner should be possible.', async () => {
        const cOldBackupOwner = await inherichain.backupOwner();
        await inherichain.updateBackupOwner(newBackupOwner);
        const cNewBackupOwner = await inherichain.backupOwner();
        assert.notStrictEqual(cOldBackupOwner, cNewBackupOwner, "Backup Owner in contract is not updated.");
        assert.strictEqual(cNewBackupOwner, newBackupOwner, "Backup Owner updation failed.");
    });

    it('Updating Backup Owner by outsider should not be possible.', async () => {
        await expectRevert(
            inherichain.updateBackupOwner(newBackupOwner, {from: outsider}),
            "Only owner can call this function.");
    });

    it('Updating Zero Address as Backup Owner by Owner should not be possible.', async () => {
        await expectRevert(
            inherichain.updateBackupOwner(constants.ZERO_ADDRESS),
            "Address has to be valid.");
    });

    it('Updating Backup Owner to self by Owner should not be possible.', async () => {
        await expectRevert(
            inherichain.updateBackupOwner(owner),
            "Backup owner has to be different from Owner.");
    });

    it('Updating Backup Owner should emit backupOwnerUpdated Event.', async () => {
        const receipt = await inherichain.updateBackupOwner(newBackupOwner);
        expectEvent(receipt, 'backupOwnerUpdated', {
            _newBackupOwner: newBackupOwner,
            _owner: owner
        });
    });

    it('Updating Heir by Owner should be possible.', async () => {
        const cOldHeir = await inherichain.heir();
        await inherichain.updateHeir(newHeir);
        const cNewHeir = await inherichain.heir();
        assert.notStrictEqual(cOldHeir, cNewHeir, "Heir in contract is not updated.");
        assert.strictEqual(cNewHeir, newHeir, "Heir updation failed.");
    });

    it('Updating Heir by outsider should not be possible.', async () => {
        await expectRevert(
            inherichain.updateHeir(newHeir, {from: outsider}),
            "Only owner can call this function.");
    });

    it('Updating Zero Address as Heir by Owner should not be possible.', async () => {
        await expectRevert(
            inherichain.updateHeir(constants.ZERO_ADDRESS),
            "Address has to be valid.");
    });

    it('Updating Heir to Owner self by Owner should not be possible.', async () => {
        await expectRevert(
            inherichain.updateHeir(owner),
            "Owner and heir cannot be same.");
    });

    it('Updating Heir to Backup Owner by Owner should not be possible.', async () => {
        await expectRevert(
            inherichain.updateHeir(backupOwner),
            "Owner and heir cannot be same.");
    });

    it('Updating Heir should reset vote count and reset claim parameters.', async () => {
        const cInitialClaimStarted = await inherichain.claimStarted();
        const cInitialClaimTime = await inherichain.claimTime();
        const cInitialVoteCount = await inherichain.voteCount();
        const cInitialClaimStatus = await inherichain.claimStatus();
        await inherichain.claimOwnership({from: heir});
        await inherichain.approveHeir(true, {from: approverOne});
        await inherichain.approveHeir(true, {from: approverTwo});
        const cOldClaimStarted = await inherichain.claimStarted();
        const cOldClaimTime = await inherichain.claimTime();
        const cOldVoteCount = await inherichain.voteCount();
        const cOldClaimStatus = await inherichain.claimStatus();
        await inherichain.updateHeir(newHeir);
        const cNewClaimStarted = await inherichain.claimStarted();
        const cNewClaimTime = await inherichain.claimTime();
        const cNewVoteCount = await inherichain.voteCount();
        const cNewClaimStatus = await inherichain.claimStatus();
        assert.strictEqual(cInitialClaimStarted, false, "Claim should be false by default.");
        assert.strictEqual(cInitialClaimTime.toNumber(), 0, "Claim time should be zero by default.");
        assert.strictEqual(cInitialVoteCount.toNumber(), 0, "Vote Count should be zero by default.");
        assert.strictEqual(cInitialClaimStatus, false, "Claim Status should be false by default.");
        assert.strictEqual(cOldClaimStarted, true, "Claim should be true after claim requested.");
        assert.notStrictEqual(cOldClaimTime.toNumber(), 0, "Claim time should be non zero after claim.");
        assert.strictEqual(cOldVoteCount.toNumber(), 2, "Vote Count after two positive vote should be two.");
        assert.strictEqual(cOldClaimStatus, true, "Claim Status should be true after approvers majority approval.");
        assert.strictEqual(cNewClaimStarted, false, "Claim should be false after updating heir.");
        assert.strictEqual(cNewClaimTime.toNumber(), 0, "Claim time should be zero after updating heir.");
        assert.strictEqual(cNewVoteCount.toNumber(), 0, "Vote Count should be zero after updating heir.");
        assert.strictEqual(cNewClaimStatus, false, "Claim Status should be false after updating heir.");
    });

    it('Updating Heir should emit heirUpdated Event.', async () => {
        const receipt = await inherichain.updateHeir(newHeir);
        expectEvent(receipt, 'heirUpdated', {
            _newHeir: newHeir,
            _owner: owner
        });
    });

    it('Updating both Deadline by Owner should be possible.', async () => {
        const cOldDeadline = await inherichain.heirDeadline();
        const cOldApproverDeadline = await inherichain.heirApprovedDeadline();
        await inherichain.updateDeadline(newDeadline, newApproverDeadline);
        const cNewDeadline = await inherichain.heirDeadline();
        const cNewApproverDeadline = await inherichain.heirApprovedDeadline();
        assert.strictEqual(cOldDeadline.toNumber(), time.duration.days(30).toNumber(), "Default deadline is wrong.");
        assert.strictEqual(cOldApproverDeadline.toNumber(), time.duration.days(7).toNumber(), "Default approved deadline is wrong.");
        assert.strictEqual(cNewDeadline.toNumber(), newDeadline, "New deadline is wrong.");
        assert.strictEqual(cNewApproverDeadline.toNumber(), newApproverDeadline, "New approved deadline is wrong.");
    });

    it('Updating both Deadline by outsider should not be possible.', async () => {
        await expectRevert(
            inherichain.updateDeadline(newDeadline, newApproverDeadline, {from: outsider}),
            "Only owner can call this function.");
    });

    it('Updating only heir Deadline by Owner should be possible.', async () => {
        const cOldApproverDeadline = await inherichain.heirApprovedDeadline();
        await inherichain.updateDeadline(newDeadline, 0);
        const cNewDeadline = await inherichain.heirDeadline();
        const cNewApproverDeadline = await inherichain.heirApprovedDeadline();
        assert.strictEqual(cNewDeadline.toNumber(), newDeadline, "New deadline is wrong.");
        assert.strictEqual(cNewApproverDeadline.toNumber(), cOldApproverDeadline.toNumber(), "Approved deadline should not have been changed.");
    });

    it('Updating only approval Deadline by Owner should be possible.', async () => {
        const cOldDeadline = await inherichain.heirDeadline();
        await inherichain.updateDeadline(0, newApproverDeadline);
        const cNewDeadline = await inherichain.heirDeadline();
        const cNewApproverDeadline = await inherichain.heirApprovedDeadline();
        assert.strictEqual(cNewDeadline.toNumber(), cOldDeadline.toNumber(), "Deadline should not have been changed.");
        assert.strictEqual(cNewApproverDeadline.toNumber(), newApproverDeadline, "New approved deadline is wrong.");
    });

    it('Updating Deadline should emit deadlineUpdated Event.', async () => {
        const receipt = await inherichain.updateDeadline(newDeadline, newApproverDeadline);
        expectEvent(receipt, 'deadlineUpdated', {
            _heirDeadline: new BN(newDeadline),
            _heirApprovedDeadline: new BN(newApproverDeadline),
            _owner: owner
        });
    });

    it('Adding an approver by Owner should be possible.', async () => {
        const cOldApproverCount = await inherichain.approversLength();
        const cOldApproverStatus = await inherichain.approverStatus(newApproverOne);
        await inherichain.addApprover(newApproverOne);
        const cNewApproverCount = await inherichain.approversLength();
        const cNewApproverStatus = await inherichain.approverStatus(newApproverOne);
        assert.strictEqual(cNewApproverCount.toNumber(), cOldApproverCount.toNumber() + 1, "Approver Count increment is wrong.");
        assert.strictEqual(cOldApproverStatus, false, "Default Approver Status is wrong.");
        assert.strictEqual(cNewApproverStatus, true, "Approver Status after adding is wrong.");
    });

    it('Adding an approver by outsider should not be possible.', async () => {
        await expectRevert(
            inherichain.addApprover(newApproverOne, {from: outsider}),
            "Only owner can call this function.");
    });

    it('Adding an already added approver should not be possible.', async () => {
        await inherichain.addApprover(newApproverOne);
        await expectRevert(
            inherichain.addApprover(newApproverOne),
            "Approver already added.");
    });

    it('Adding a zero address as approver by Owner should not be possible.', async () => {
        await expectRevert(
            inherichain.addApprover(constants.ZERO_ADDRESS),
            "Address has to be valid.");
    });

    it('Adding an approver by Owner should emit approverAdded Event.', async () => {
        const receipt = await inherichain.addApprover(newApproverOne);
        expectEvent(receipt, 'approverAdded', {
            _newApprover: newApproverOne,
            _owner: owner
        });
    });

    it('Deleting an approver by Owner should be possible.', async () => {
        await inherichain.addApprover(newApproverOne);
        const cOldApproverCount = await inherichain.approversLength();
        const cOldApproverStatus = await inherichain.approverStatus(newApproverOne);
        await inherichain.deleteApprover(newApproverOne);
        const cNewApproverCount = await inherichain.approversLength();
        const cNewApproverStatus = await inherichain.approverStatus(newApproverOne);
        assert.strictEqual(cNewApproverCount.toNumber(), cOldApproverCount.toNumber() - 1, "Approver Count decrement is wrong.");
        assert.strictEqual(cOldApproverStatus, true, "Approver Status after adding is wrong.");
        assert.strictEqual(cNewApproverStatus, false, "Approver Status after removing is wrong.");
    });

    it('Deleting an approver by outsider should not be possible.', async () => {
        await expectRevert(
            inherichain.deleteApprover(newApproverOne, {from: outsider}),
            "Only owner can call this function.");
    });

    it('Deleting a non existing approver by Owner should not be possible.', async () => {
        await expectRevert(
            inherichain.deleteApprover(newApproverOne),
            "Approver is not valid.");
    });

    it('Deleting an approver by Owner should emit approverDeleted Event.', async () => {
        await inherichain.addApprover(newApproverOne);
        const receipt = await inherichain.deleteApprover(newApproverOne);
        expectEvent(receipt, 'approverDeleted', {
            _deletedApprover: newApproverOne,
            _owner: owner
        });
    });

    it('Updating an Owner by Owner should be possible.', async () => {
        await inherichain.updateOwner(newBackupOwner);
        const cNewOwner = await inherichain.owner();
        assert.strictEqual(cNewOwner, newBackupOwner, "Updating owner is unsuccessful.");
    });

    it('Updating an Owner by Backup Owner should be possible.', async () => {
        await inherichain.updateOwner(newBackupOwner, {from: backupOwner});
        const cNewOwner = await inherichain.owner();
        assert.strictEqual(cNewOwner, newBackupOwner, "Updating owner is unsuccessful.");
    });

    it('Updating an Owner by Outsider should not be possible.', async () => {
        await expectRevert(
            inherichain.updateOwner(newBackupOwner, {from: outsider}),
            "Only primary or backup owner can call this function.");
    });

    it('Updating a Zero Address as Owner by Owner should not be possible.', async () => {
        await expectRevert(
            inherichain.updateOwner(constants.ZERO_ADDRESS),
            "Address has to be valid.");
    });

    it('Updating an Owner by Owner should emit the ownerUpdated Event.', async () => {
        const receipt = await inherichain.updateOwner(newBackupOwner, {from: backupOwner});
        expectEvent(receipt, 'ownerUpdated', {
            _newOwner: newBackupOwner,
            _oldOwner: owner,
            _changer: backupOwner
        });
    });

    it('Claim ownership by Heir should be possible.', async () => {
        const cOldClaimStarted = await inherichain.claimStarted();
        const cOldClaimTime = await inherichain.claimTime();
        await inherichain.claimOwnership({from: heir});
        const cNewClaimStarted = await inherichain.claimStarted();
        const cNewClaimTime = await inherichain.claimTime();
        assert.strictEqual(cOldClaimStarted, false, "Default Claim Start Status is Wrong.");
        assert.strictEqual(cOldClaimTime.toNumber(), 0, "Default Claim Start Time is Wrong.");
        assert.strictEqual(cNewClaimStarted, true, "Updated Claim Start Status is Wrong.");
        assert.notStrictEqual(cNewClaimTime.toNumber(), 0, "Updated Claim Start Time is Wrong.");
    });

    it('Claim ownership by Outsider should not be possible.', async () => {
        await expectRevert(
            inherichain.claimOwnership({from: outsider}),
            "Only heir can call this function.");
    });

    it('Claim ownership by Heir should emit the ownershipClaimed Event.', async () => {
        const receipt = await inherichain.claimOwnership({from: heir});
        expectEvent(receipt, 'ownershipClaimed', {
            _heir: heir,
            // _claimTime: ,
        });
    });

    it('Accessing ownership with approver votes by heir should be possible.', async () => {
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
            {from: heir});
        const cNewClaimStatus = await inherichain.claimStatus();
        const cNewOwner = await inherichain.owner();
        const cNewBackupOwner = await inherichain.backupOwner();
        const cNewHeir = await inherichain.heir();
        const cNewApproversLength = await inherichain.approversLength();
        const cOldApproverOneStatus = await inherichain.approverStatus(approverOne);
        const cOldApproverTwoStatus = await inherichain.approverStatus(approverTwo);
        const cOldApproverThreeStatus = await inherichain.approverStatus(approverThree);
        const cNewApproverOneStatus = await inherichain.approverStatus(newApproverOne);
        const cNewApproverTwoStatus = await inherichain.approverStatus(newApproverTwo);
        const cNewApproverThreeStatus = await inherichain.approverStatus(newApproverThree);
        assert.strictEqual(cNewClaimStatus, false, "Claim Status after majority voting is wrong.");
        assert.strictEqual(cNewOwner, heir, "Updating Owner from ownership claim is wrong.");
        assert.strictEqual(cNewBackupOwner, newBackupOwner, "Updating Backup Owner from ownership claim is wrong.");
        assert.strictEqual(cNewHeir, newHeir, "Updating Heir from ownership claim is wrong.");
        assert.strictEqual(cNewApproversLength.toNumber(), 3, "Updating Approvers from ownership claim is wrong.");
        assert.strictEqual(cOldApproverOneStatus, false, "Previous Approver should be invalidated.");
        assert.strictEqual(cOldApproverTwoStatus, false, "Previous Approver should be invalidated.");
        assert.strictEqual(cOldApproverThreeStatus, false, "Previous Approver should be invalidated.");
        assert.strictEqual(cNewApproverOneStatus, true, "New Approver should be validated.");
        assert.strictEqual(cNewApproverTwoStatus, true, "New Approver should be validated.");
        assert.strictEqual(cNewApproverThreeStatus, true, "New Approver should be validated.");
    });

    it('Accessing ownership without approver votes by heir should not be possible.', async () => {
        await inherichain.claimOwnership({from: heir});
        await expectRevert(
            inherichain.accessOwnershipFromApprover(
                newBackupOwner,
                newHeir,
                [newApproverOne, newApproverTwo, newApproverThree],
                newDeadline,
                newApproverDeadline,
                {from: heir}),
            "Majority vote required to access ownership.");
    });

    it('Accessing ownership with approver votes by outsider should not be possible.', async () => {
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
                {from: outsider}),
            "Only heir can call this function.");
    });

    it('Accessing ownership without approver votes by outsider should not be possible.', async () => {
        await inherichain.claimOwnership({from: heir});
        await expectRevert(
            inherichain.accessOwnershipFromApprover(
                newBackupOwner,
                newHeir,
                [newApproverOne, newApproverTwo, newApproverThree],
                newDeadline,
                newApproverDeadline,
                {from: outsider}),
            "Only heir can call this function.");
    });

    it('Accessing ownership from approver votes before approver deadline by heir should not be possible.', async () => {
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
                {from: heir}),
            "Deadline has not passed.");
    });

    it('Accessing ownership from approver votes by heir should emit ownershipAccessed Event.', async () => {
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
            {from: heir});
        expectEvent(receipt, 'ownershipAccessed', {
            _newOwner: heir,
            _newBackupOwner: newBackupOwner,
            _heir: newHeir,
            _approverCount: new BN(3),
            _heirDeadline: new BN(newDeadline),
            _heirApprovedDeadline: new BN(newApproverDeadline)
        });
    });

    it('Accessing ownership after deadline by heir should be possible.', async () => {
        await inherichain.claimOwnership({from: heir});
        await time.increase(deadline + 1);
        await inherichain.accessOwnershipAfterDeadline(
            newBackupOwner,
            newHeir,
            [newApproverOne, newApproverTwo, newApproverThree],
            newDeadline,
            newApproverDeadline,
            {from: heir});
        const cNewClaimStatus = await inherichain.claimStatus();
        const cNewOwner = await inherichain.owner();
        const cNewBackupOwner = await inherichain.backupOwner();
        const cNewHeir = await inherichain.heir();
        const cNewApproversLength = await inherichain.approversLength();
        const cOldApproverOneStatus = await inherichain.approverStatus(approverOne);
        const cOldApproverTwoStatus = await inherichain.approverStatus(approverTwo);
        const cOldApproverThreeStatus = await inherichain.approverStatus(approverThree);
        const cNewApproverOneStatus = await inherichain.approverStatus(newApproverOne);
        const cNewApproverTwoStatus = await inherichain.approverStatus(newApproverTwo);
        const cNewApproverThreeStatus = await inherichain.approverStatus(newApproverThree);
        assert.strictEqual(cNewClaimStatus, false, "Claim Status after majority voting is wrong.");
        assert.strictEqual(cNewOwner, heir, "Updating Owner from ownership claim is wrong.");
        assert.strictEqual(cNewBackupOwner, newBackupOwner, "Updating Backup Owner from ownership claim is wrong.");
        assert.strictEqual(cNewHeir, newHeir, "Updating Heir from ownership claim is wrong.");
        assert.strictEqual(cNewApproversLength.toNumber(), 3, "Updating Approvers from ownership claim is wrong.");
        assert.strictEqual(cOldApproverOneStatus, false, "Previous Approver should be invalidated.");
        assert.strictEqual(cOldApproverTwoStatus, false, "Previous Approver should be invalidated.");
        assert.strictEqual(cOldApproverThreeStatus, false, "Previous Approver should be invalidated.");
        assert.strictEqual(cNewApproverOneStatus, true, "New Approver should be validated.");
        assert.strictEqual(cNewApproverTwoStatus, true, "New Approver should be validated.");
        assert.strictEqual(cNewApproverThreeStatus, true, "New Approver should be validated.");
    });

    it('Accessing ownership before deadline by heir should not be possible.', async () => {
        await inherichain.claimOwnership({from: heir});
        await expectRevert(
            inherichain.accessOwnershipAfterDeadline(
                newBackupOwner,
                newHeir,
                [newApproverOne, newApproverTwo, newApproverThree],
                newDeadline,
                newApproverDeadline,
                {from: heir}),
            "Deadline has not passed.");
    });

    it('Accessing ownership after deadline by outsider should not be possible.', async () => {
        await inherichain.claimOwnership({from: heir});
        await time.increase(deadline + 1);
        await expectRevert(
            inherichain.accessOwnershipAfterDeadline(
                newBackupOwner,
                newHeir,
                [newApproverOne, newApproverTwo, newApproverThree],
                newDeadline,
                newApproverDeadline,
                {from: outsider}),
            "Only heir can call this function.");
    });

    it('Accessing ownership before deadline by outsider should not be possible.', async () => {
        await inherichain.claimOwnership({from: heir});
        await time.increase(deadline + 1);
        await expectRevert(
            inherichain.accessOwnershipAfterDeadline(
                newBackupOwner,
                newHeir,
                [newApproverOne, newApproverTwo, newApproverThree],
                newDeadline,
                newApproverDeadline,
                {from: outsider}),
            "Only heir can call this function.");
    });

    it('Accessing ownership after deadline by heir should emit ownershipAccessed Event.', async () => {
        await inherichain.claimOwnership({from: heir});
        await time.increase(deadline + 1);
        const receipt = await inherichain.accessOwnershipAfterDeadline(
            newBackupOwner,
            newHeir,
            [newApproverOne, newApproverTwo, newApproverThree],
            newDeadline,
            newApproverDeadline,
            {from: heir});
        expectEvent(receipt, 'ownershipAccessed', {
            _newOwner: heir,
            _newBackupOwner: newBackupOwner,
            _heir: newHeir,
            _approverCount: new BN(3),
            _heirDeadline: new BN(newDeadline),
            _heirApprovedDeadline: new BN(newApproverDeadline)
        });
    });

    it('Approving heir by Approver should be possible.', async () => {
        await inherichain.claimOwnership({from: heir});
        const cOldVoteCount = await inherichain.voteCount();
        const cOldApproverOneVote = await inherichain.voted(approverOne);
        await inherichain.approveHeir(true, {from: approverOne});
        const cNewVoteCount = await inherichain.voteCount();
        const cNewApproverOneVote = await inherichain.voted(approverOne);
        assert.strictEqual(cNewVoteCount.toNumber(), cOldVoteCount.toNumber() + 1, "Vote not counted correctly.");
        assert.strictEqual(cOldApproverOneVote, false, "Default Approver One vote value wrong.");
        assert.strictEqual(cNewApproverOneVote, true, "Updated Approver One vote value wrong.");
    });

    it('Rejecting heir by Approver should be possible.', async () => {
        await inherichain.claimOwnership({from: heir});
        const cOldVoteCount = await inherichain.voteCount();
        const cOldApproverOneVote = await inherichain.voted(approverOne);
        await inherichain.approveHeir(false, {from: approverOne});
        const cNewVoteCount = await inherichain.voteCount();
        const cNewApproverOneVote = await inherichain.voted(approverOne);
        assert.strictEqual(cNewVoteCount.toNumber(), cOldVoteCount.toNumber(), "Vote not updated correctly.");
        assert.strictEqual(cOldApproverOneVote, false, "Default Approver One vote value wrong.");
        assert.strictEqual(cNewApproverOneVote, true, "Updated Approver One vote value wrong.");
    });

    it('Approving heir by Outsider should not be possible.', async () => {
        await inherichain.claimOwnership({from: heir});
        await expectRevert(
            inherichain.approveHeir(true, {from: outsider}),
            "Only an approver can call this function.");
    });

    it('Rejecting heir by Outsider should not be possible.', async () => {
        await inherichain.claimOwnership({from: heir});
        await expectRevert(
            inherichain.approveHeir(false, {from: outsider}),
            "Only an approver can call this function.");
    });

    it('Approving heir by Approver twice should not be possible.', async () => {
        await inherichain.claimOwnership({from: heir});
        await inherichain.approveHeir(true, {from: approverOne});
        await expectRevert(
            inherichain.approveHeir(true, {from: approverOne}),
            "Already voted.");
    });

    it('Rejecting heir by Approver twice should not be possible.', async () => {
        await inherichain.claimOwnership({from: heir});
        await inherichain.approveHeir(false, {from: approverOne});
        await expectRevert(
            inherichain.approveHeir(false, {from: approverOne}),
            "Already voted.");
    });

    it('Without heir claiming ownership, voting by Approver should not be possible.', async () => {
        await expectRevert(
            inherichain.approveHeir(true, {from: approverOne}),
            "Claim has not started yet.");
    });

    it('With majority approving heir, the majority vote by Approver should emit heirApproved Event.', async () => {
        await inherichain.claimOwnership({from: heir});
        await inherichain.approveHeir(true, {from: approverOne});
        const receipt = await inherichain.approveHeir(true, {from: approverTwo});
        expectEvent(receipt, 'heirApproved', {
            _approveCount: new BN(2)
        });
    });

    it('Approving heir by Approver should emit heirApproval Event.', async () => {
        await inherichain.claimOwnership({from: heir});
        const receipt = await inherichain.approveHeir(false, {from: approverOne});
        expectEvent(receipt, 'heirApproval', {
            _approver: approverOne,
            _status: false
        });
    });

    it('Fallback function call by Owner should be possible.', async () => {
        // TODO
    });

    it('Fallback function call by outsider should be possible.', async () => {
        // TODO
    });

    it('Contract deployment by Owner should be possible.', async () => {
        // TODO
    });

    it('Contract deployment by Outsider should not be possible.', async () => {
        // TODO
    });

})