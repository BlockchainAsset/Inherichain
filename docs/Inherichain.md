## `Inherichain`

Use this contract as a hot wallet without any worry about passing it on to the next generation.


This is an alpha version, it is not yet audited, use with caution.

### `onlyOwner()`





### `checkAddress(address _addr)`





### `onlyOwners()`





### `onlyHeir()`





### `onlyApprover()`






### `constructor(address _owner, address _backupOwner, address _heir, address[] _approvers, uint256 _deadline, uint256 _approverDeadline)` (public)



Constructor


### `updateBackupOwner(address _newBackupOwner)` (public)

Can be used to update the backup owner.


Owner and the new backup owner cannot be the same.


### `updateHeir(address _newHeir)` (public)

Can be used to update the heir.


Can also be used if the heir tried to access contract before the owner demise along with approvers.


### `updateDeadline(uint256 _deadline, uint256 _approverDeadline)` (public)

Can be used to update the deadlines.


If only one deadline has to be updated, passing the other zero is enough.


### `addApprover(address _approver)` (public)

Can be used to add an approver.


Cannot add zero address or already added address.


### `deleteApprover(address _approver)` (public)

Can be used to delete an approver.


The approver has to be valid.


### `fallback()` (external)

Fallback


Proxy Logic

### `deployContract(uint256 _value, bytes _bytecode) → address contractAddress` (public)

Can be used to deploy contracts.




### `updateOwner(address _newOwner)` (public)

Can be used to update the owner.


This function can be used by either owner or backupOwner.


### `claimOwnership()` (public)

Can be used to claim the contract ownership.


This function starts the claim process for heir.

### `accessOwnershipFromApprover(address _backupOwner, address _heir, address[] _approvers, uint256 _deadline, uint256 _approverDeadline)` (public)

Can be used by heir after approver approval.


This function can only be called once majority vote is attained.


### `accessOwnershipAfterDeadline(address _backupOwner, address _heir, address[] _approvers, uint256 _deadline, uint256 _approverDeadline)` (public)

Can be used by heir after deadline has been passed.


This function can be called with or without the approver approvals after the deadline.


### `_accessOwnership(address _backupOwner, address _heir, address[] _approvers, uint256 _deadline, uint256 _approverDeadline)` (internal)



This is an internal function which takes care of the ownership transfer tasks.


### `approveHeir(bool _acceptance)` (public)

Can be used to approve or reject a claim request by heir.


Only callable if claim has started and approver not already voted.


### `approversLength() → uint256 count` (public)

To get the length of the approvers array.


Used for testing and frontend.



### `contractCreated(address _owner, address _backupOwner, address _heir, uint256 _approverCount, uint256 _heirDeadline, uint256 _heirApprovedDeadline)`



This event is used to notify the contract creation.


### `backupOwnerUpdated(address _newBackupOwner, address _owner)`



This event is used to notify that the backup owner has been updated.


### `heirUpdated(address _newHeir, address _owner)`



The event is used to notify that the heir has been updated and any claim has been reset.


### `deadlineUpdated(uint256 _heirDeadline, uint256 _heirApprovedDeadline, address _owner)`



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


### `ownershipAccessed(address _newOwner, address _newBackupOwner, address _heir, uint256 _approverCount, uint256 _heirDeadline, uint256 _heirApprovedDeadline)`



This event is used to notify when the heir has received the access to the contract.


### `heirApproval(address _approver, bool _status)`



This event is used to notify the decision by the approver.


### `heirApproved(uint256 _approveCount)`



This event is used to notify when the approval is successful.


