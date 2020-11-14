## `Inherichain`

Use this contract as a hot wallet without any worry about passing it on to the next generation.


This is an alpha version, it is not yet audited, use with caution.

### `onlyOwner()`

Only Primary owner can call this function.



### `checkAddress(address _addr)`

Checks whether the address is valid or zero address.



### `onlyOwners()`

Only Primary or Backup Owner can call this function.



### `onlyHeir()`

Only Heir can call this function.



### `onlyApprover()`

Only an Approver can call this function.



### `checkRemaining(uint256 _amount)`

Check if the contract have enough balance.





### `constructor(address _owner, address _backupOwner, address payable _heir, address _charity, contract IArbitrator _arbitrator, bytes _arbitratorExtraData, string _metaevidence, address[] _approvers, uint256 _deadline, uint256 _approverDeadline, uint256 _charityDeadline)` (public)



Constructor


### `updateBackupOwner(address _newBackupOwner)` (public)

Can be used to update the backup owner.


Owner and the new backup owner cannot be the same.


### `updateHeir(address payable _newHeir)` (public)

Can be used to update the heir.


Can also be used if the heir tried to access contract before the owner demise along with approvers.


### `updateCharity(address _charity)` (public)

Can be used to update the Charity Address by the Owner. Also reset a initiated charity by Approver.


If the charity address is predetermined by owner, then approver cannot nominate a charity.


### `updateArbitrator(contract IArbitrator _arbitrator)` (public)

Can be used to update the Arbitrator Address by the Owner.


The arbitrator should follow ERC 792 and ERC 1497 standard.


### `updateArbitrationFeeDepositTime(uint256 _arbitrationFeeDepositTime)` (public)

Can be used to update the Arbitrator Fee Deposit Time.


This is the time the heir have to deposit ETH for arbitration fee.


### `updateDeadline(uint256 _deadline, uint256 _approverDeadline, uint256 _charityDeadline)` (public)

Can be used to update the deadlines.


If only one deadline has to be updated, passing the other zero is enough.


### `addApprover(address _approver)` (public)

Can be used to add an approver.


Cannot add zero address or already added address.


### `deleteApprover(address _approver)` (public)

Can be used to delete an approver.


The approver has to be valid.


### `fallback()` (external)

Fallback Function for complex calls to other contracts.


Proxy Logic only owner can call.

### `receive()` (external)

Can be used to receive ether from anyone.


This allows to receive ether from anyone unlike the fallback function.

### `withdrawAllETH()` (public)

Withdraw Complete ETH balance.



### `withdrawSomeETH(uint256 _amount)` (public)

Withdraw a particular amount of ETH.




### `transferETH(address payable _receiver, uint256 _amount)` (public)

Transfer `_amount` ETH to `_receiver`.




### `deployContract(uint256 _value, bytes _bytecode) → address contractAddress` (public)

Can be used to deploy contracts.




### `updateOwner(address _newOwner)` (public)

Can be used to update the owner.


This function can be used by either owner or backupOwner.


### `claimOwnership()` (public)

Can be used to claim the contract ownership.


This function starts the claim process for heir.

### `reclaimOwnership()` (public)

Can be used to reclaim the contract ownership after a rejected dispute from Arbitrator.


Might be used when Owner in health crisis, and approver disputed and won.

### `_claimOwnership()` (internal)

This is an internal function which takes care of the heir claim process.



### `accessOwnershipFromApprover(address _backupOwner, address payable _heir, address[] _approvers, uint256 _deadline, uint256 _approverDeadline, uint256 _charityDeadline)` (public)

Can be used by heir after approver approval.


This function can only be called once majority vote is attained.


### `accessOwnershipFromArbitrator(address _backupOwner, address payable _heir, address[] _approvers, uint256 _deadline, uint256 _approverDeadline, uint256 _charityDeadline)` (public)

Can be used by heir after arbitrator approval.


This function can only be called once arbitrator approval is attained.


### `accessOwnershipAfterDeadline(address _backupOwner, address payable _heir, address[] _approvers, uint256 _deadline, uint256 _approverDeadline, uint256 _charityDeadline)` (public)

Can be used by heir after deadline has been passed.


This function can be called with or without the approver approvals after the deadline.


### `_accessOwnership(address _backupOwner, address payable _heir, address[] _approvers, uint256 _deadline, uint256 _approverDeadline, uint256 _charityDeadline)` (internal)



This is an internal function which takes care of the ownership transfer tasks.


### `payArbitrationFeeForHeir()` (public)

Can be used to pay the arbitration fee for Heir, if approver disputed.


Can be paid by anyone.

### `approveHeir(bool _acceptance)` (public)

Can be used to approve or reject a claim request by heir.


Only callable if claim has started and approver not already voted.


### `disputeHeir()` (public)

Can be used to dispute a Heir Claim, or dispute incorrect heir acceptance.


Call scope limited to Approvers to limit spamming.

### `reclaimInitialStatus()` (public)

Can be used by anyone to stop the claim process by heir after arbitration fee deposit time ends.


Can be used only after approver made a dispute to claim.

### `initiateCharity()` (public)

Can be used to initiate the charity process.


Called when owner and heir are no more.

### `accessOwnershipFromCharity(address _backupOwner, address payable _heir, address[] _approvers, uint256 _deadline, uint256 _approverDeadline, uint256 _charityDeadline)` (public)

Can be used by charity after deadline has been passed.


This function can only be called after the approver has initiated the charity.


### `rule(uint256 _disputeID, uint256 _ruling)` (public)

Give a ruling for a dispute. Must be called by the arbitrator.




### `submitEvidence(string _evidence)` (public)

Can be used to submit any evidence during the Claim Dispute Period.


Only owner, heir or approver can call this function.


### `approversLength() → uint256 count` (public)

To get the length of the approvers array.


Used for testing and frontend.



### `contractCreated(address _owner, address _backupOwner, address _heir, address _charity, contract IArbitrator _arbitrator, uint256 _approverCount, uint256 _heirDeadline, uint256 _heirApprovedDeadline, uint256 _charityDeadline, bytes _arbitratorExtraData)`



This event is used to notify the contract creation.


### `backupOwnerUpdated(address _newBackupOwner, address _owner)`



This event is used to notify that the backup owner has been updated.


### `heirUpdated(address _newHeir, address _owner)`



The event is used to notify that the heir has been updated and any claim has been reset.


### `charityUpdated(address _charity, address _changer)`



The event is used to notify that the charity has been updated.


### `arbitratorUpdated(contract IArbitrator _arbitrator, address _owner)`



The event is used to notify that the arbitrator has been updated.


### `arbitratorFeeDepositTimeUpdated(uint256 _arbitrationFeeDepositTime, address _owner)`



The event is used to notify that the arbitrator has been updated.


### `deadlineUpdated(uint256 _heirDeadline, uint256 _heirApprovedDeadline, uint256 _charityDeadline, address _owner)`



The event is used to notify a change in the deadline.


### `approverAdded(address _newApprover, address _owner)`



The event is used to notify an addition to the approver list.


### `approverDeleted(address _deletedApprover, address _owner)`



The event is used to notify the deletion of an approver from the list.


### `ownerUpdated(address _newOwner, address _oldOwner, address _changer)`



The event is used to notify the updation of new owner.


### `ownershipClaimed(address _heir, uint256 _claimTime)`

This event is used to notify the approvers to fast track approval process.


This event is emitted when the heir has made a request for access to the contract.


### `ownershipAccessed(address _newOwner, address _newBackupOwner, address _heir, uint256 _approverCount, uint256 _heirDeadline, uint256 _heirApprovedDeadline, uint256 _charityDeadline)`



This event is used to notify when the heir has received the access to the contract.


### `claimDisputeCreated(address _funder, contract IArbitrator _arbitrator, uint256 _disputeID)`



This event is used to notify the claim dispute has been started by arbitrator.


### `heirApproval(address _approver, bool _status)`



This event is used to notify the decision by the approver.


### `heirApproved(uint256 _approveCount)`



This event is used to notify when the approval is successful.


### `heirDisputed(address _approver)`



The event is used to notify the heir claim is disputed.


### `initialStatusReclaimed(address _initiator)`



The event is used to notify the initial status is reclaimed.


### `charityInitiated(address _approver)`



The event is used to notify that charity process has been initiated.


### `contractDeployed(address _contractAddress, address _owner)`



The event is used to notify the creation of a contract.


### `ethReceived(uint256 _amount, address _sender)`



The event is used to notify ether deposits.


### `ethWithdrawed(uint256 _amount, address _receiver)`



The event is used to notify ether withdraws.


### `ethTransferred(uint256 _amount, address _receiver)`



The event is used to notify ether transfers.


