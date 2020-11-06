// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.0;

/// @title A wallet which has inheritance built in on the Ethereum Blockchain.
/// @author Shebin John
/// @notice Use this contract as a hot wallet without any worry about passing it on to the next generation.
/// @dev This is an alpha version, it is not yet audited, use with caution.
contract Inherichain {
    /*  Contract Variables  */

    bool public claimStarted; // It marks whether the claim by the heir has started or not.
    bool public claimStatus; // It marks whether the claim was approved by the approvers or not.

    uint256 public voteCount; // This counts the yes votes for a heir claim.
    uint256 public claimTime; // The time when the claim was started. Default is zero. Set at the time of claim call.
    // Below deadline can be changed at the time of contract creation.
    // Deadline also works for owner to reclaim if the heir colluded with approvers.
    uint256 public heirDeadline = 30 days; // Wait time for the heir without approvers approval. Default is 30 days.
    uint256 public heirApprovedDeadline = 7 days; // Wait time for the heir with approvers approval. Default is 7 days.

    address public owner; // The owner of this contract wallet.
    address public backupOwner; // The backup owner, same as owner of this wallet, but with a different address.
    address public heir; // The heir of this contract.

    mapping(address => bool) public approverStatus; // Whether the approver is valid or not.
    mapping(address => bool) public voted; // Whether the approver has voted or not.

    address[] public approvers; // Array of approver addresses.

    /*  Events  */

    ///	@dev This event is used to notify the contract creation.
    ///	@param _owner The owner of this contract.
    ///	@param _backupOwner The backup owner of this contract.
    ///	@param _heir The heir of this contract.
    ///	@param _approverCount The no. of approvers added to the contract.
    ///	@param _heirDeadline The wait time for heir to claim without approval from approvers.
    ///	@param _heirApprovedDeadline The wait time for heir to claim with approval from approvers.
    event contractCreated(
        address indexed _owner,
        address indexed _backupOwner,
        address indexed _heir,
        uint256 _approverCount,
        uint256 _heirDeadline,
        uint256 _heirApprovedDeadline
    );

    ///	@dev This event is used to notify that the backup owner has been updated.
    ///	@param _newBackupOwner The new backup owner address.
    ///	@param _owner The owner who made this change.
    event backupOwnerUpdated(
        address indexed _newBackupOwner,
        address indexed _owner
    );

    ///	@dev The event is used to notify that the heir has been updated and any claim has been reset.
    ///	@param _newHeir The new heir address.
    ///	@param _owner The owner who made this change.
    event heirUpdated(address indexed _newHeir, address indexed _owner);

    ///	@dev The event is used to notify a change in the deadline.
    ///	@param _heirDeadline The wait time for heir to claim without approval from approvers.
    ///	@param _heirApprovedDeadline The wait time for heir to claim with approval from approvers.
    ///	@param _owner The owner who made this change.
    event deadlineUpdated(
        uint256 indexed _heirDeadline,
        uint256 indexed _heirApprovedDeadline,
        address indexed _owner
    );

    ///	@dev The event is used to notify an addition to the approver list.
    ///	@param _newApprover The new approver address.
    ///	@param _owner The owner who made this change.
    event approverAdded(address indexed _newApprover, address indexed _owner);

    ///	@dev The event is used to notify the deletion of an approver from the list.
    ///	@param _deletedApprover The approver address who got deleted.
    ///	@param _owner The owner who made this change.
    event approverDeleted(
        address indexed _deletedApprover,
        address indexed _owner
    );

    ///	@dev The event is used to notify the updation of new owner.
    ///	@param _newOwner The address of the new owner.
    ///	@param _oldOwner The address of the old owner.
    ///	@param _changer The one who made the change. It can be either owner or backupOwner.
    event ownerUpdated(
        address indexed _newOwner,
        address indexed _oldOwner,
        address indexed _changer
    );

    ///	@notice This event is used to notify the approvers to fast track approval process.
    ///	@dev This event is emitted when the heir has made a request for access to the contract.
    ///	@param _heir The address of heir who made the claim.
    ///	@param _claimTime The time heir made the claim.
    event ownershipClaimed(address indexed _heir, uint256 indexed _claimTime);

    ///	@dev This event is used to notify when the heir has received the access to the contract.
    ///	@param _newOwner The new owner address of this contract (technically the previous heir).
    ///	@param _newBackupOwner The new backupOwner address of this contract.
    ///	@param _heir The new heir of this contract.
    ///	@param _approverCount The no. of new approvers added to the contract.
    ///	@param _heirDeadline The new wait time for heir to claim without approval from approvers.
    ///	@param _heirApprovedDeadline The new wait time for heir to claim with approval from approvers.
    event ownershipAccessed(
        address indexed _newOwner,
        address indexed _newBackupOwner,
        address indexed _heir,
        uint256 _approverCount,
        uint256 _heirDeadline,
        uint256 _heirApprovedDeadline
    );

    ///	@dev This event is used to notify the decision by the approver.
    ///	@param _approver The address of the approver.
    ///	@param _status The decision of the approver.
    event heirApproval(address indexed _approver, bool indexed _status);

    ///	@dev This event is used to notify when the approval is successful.
    ///	@param _approveCount The no. of votes received by the heir for approval.
    event heirApproved(uint256 indexed _approveCount);

    ///	@dev The event is used to notify the creation of a contract.
    ///	@param _contractAddress The newly created contract address.
    ///	@param _owner The owner who created the contract.
    event contractDeployed(
        address indexed _contractAddress,
        address indexed _owner
    );

    ///	@dev The event is used to notify ether deposits.
    ///	@param _amount The amount of ether received in wei.
    ///	@param _sender The address of the sender of eth.
    event ethReceived(uint256 indexed _amount, address indexed _sender);

    ///	@dev The event is used to notify ether withdraws.
    ///	@param _amount The amount of ether withdrawed in wei.
    ///	@param _receiver The address of the receiver of eth.
    event ethWithdrawed(uint256 indexed _amount, address indexed _receiver);

    ///	@dev The event is used to notify ether transfers.
    ///	@param _amount The amount of ether transferred in wei.
    ///	@param _receiver The address of the receiver of eth.
    event ethTransferred(uint256 indexed _amount, address indexed _receiver);

    /*  Modifiers   */

    /// @notice Only Primary owner can call this function.
    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    /// @notice Checks whether the address is valid or zero address.
    modifier checkAddress(address _addr) {
        require(_addr != address(0), "Address has to be valid.");
        _;
    }

    /// @notice Only Primary or Backup Owner can call this function.
    modifier onlyOwners {
        require(
            msg.sender == owner || msg.sender == backupOwner,
            "Only primary or backup owner can call this function."
        );
        _;
    }

    /// @notice Only Heir can call this function.
    modifier onlyHeir {
        require(msg.sender == heir, "Only heir can call this function.");
        _;
    }

    /// @notice Only an Approver can call this function.
    modifier onlyApprover {
        require(
            approverStatus[msg.sender],
            "Only an approver can call this function."
        );
        _;
    }

    /// @notice Check if the contract have enough balance.
    /// @param _amount The amount which will be transferred.
    modifier checkRemaining(uint256 _amount) {
        require(
            _amount <= payable(address(this)).balance,
            "Amount requested greater than balance."
        );
        _;
    }

    /*  Constructor */

    ///	@dev Constructor
    ///	@param _owner The owner of this contract.
    ///	@param _backupOwner The backup owner of this contract.
    ///	@param _heir The heir of this contract.
    ///	@param _approvers The approver address array added to the contract.
    ///	@param _deadline The wait time for heir to claim without approval from approvers.
    ///	@param _approverDeadline The wait time for heir to claim with approval from approvers.
    constructor(
        address _owner,
        address _backupOwner,
        address _heir,
        address[] memory _approvers,
        uint256 _deadline,
        uint256 _approverDeadline
    ) {
        owner = _owner; // By default owner will be assigned the constructor parameter.
        if (_owner == address(0)) {
            // If _owner is zero address, then msg.sender will be considered as the owner.
            owner = msg.sender;
        }

        require(
            _backupOwner != owner,
            "Backup owner and owner cannot be same."
        );
        if (_backupOwner != address(0)) {
            // We set backupOwner only if constructor parameter is assigned with one.
            backupOwner = _backupOwner;
        }

        require(
            _heir != owner && _heir != backupOwner,
            "Owner and heir cannot be same."
        );
        require(
            _heir != address(0),
            "Heir has to be set at the time of contract creation."
        );
        heir = _heir;

        for (uint256 user = 0; user < _approvers.length; user++) {
            // To add approver only once.
            require(
                !approverStatus[_approvers[user]],
                "Approver already added."
            );
            approverStatus[_approvers[user]] = true;
        }
        approvers = _approvers;

        if (_deadline != 0) {
            heirDeadline = _deadline;
        }

        if (_approverDeadline != 0) {
            heirApprovedDeadline = _approverDeadline;
        }

        emit contractCreated(
            owner,
            backupOwner,
            heir,
            _approvers.length,
            heirDeadline,
            heirApprovedDeadline
        );
    }

    /*  Functions   */

    /*  Primary Owner Functions */

    ///	@notice Can be used to update the backup owner.
    ///	@dev Owner and the new backup owner cannot be the same.
    ///	@param _newBackupOwner The address of the new backup owner.
    function updateBackupOwner(address _newBackupOwner)
        public
        onlyOwner
        checkAddress(_newBackupOwner)
    {
        require(
            msg.sender != _newBackupOwner,
            "Backup owner has to be different from Owner."
        );
        backupOwner = _newBackupOwner;
        emit backupOwnerUpdated(_newBackupOwner, msg.sender);
    }

    ///	@notice Can be used to update the heir.
    ///	@dev Can also be used if the heir tried to access contract before the owner demise along with approvers.
    ///	@param _newHeir The address of the new heir.
    function updateHeir(address _newHeir)
        public
        onlyOwner
        checkAddress(_newHeir)
    {
        require(
            (_newHeir != owner) && (_newHeir != backupOwner),
            "Owner and heir cannot be same."
        );
        heir = _newHeir;
        if (voteCount > 0) {
            for (uint256 index = 0; index < approvers.length; index++) {
                voted[approvers[index]] = false;
            }
        }
        voteCount = 0; // This resets the vote count, if the approver and colluded with the heir.
        claimStarted = false; // This resets the claim ownership from heir.
        claimTime = 0;
        claimStatus = false; // This ensures the new heir which is set cannot claim the ownership without approvers.
        emit heirUpdated(_newHeir, msg.sender);
    }

    ///	@notice Can be used to update the deadlines.
    ///	@dev If only one deadline has to be updated, passing the other zero is enough.
    ///	@param _deadline The deadline without approval.
    ///	@param _approverDeadline The deadline with approval.
    function updateDeadline(uint256 _deadline, uint256 _approverDeadline)
        public
        onlyOwner
    {
        if (_deadline != 0) {
            heirDeadline = _deadline;
        }
        if (_approverDeadline != 0) {
            heirApprovedDeadline = _approverDeadline;
        }
        emit deadlineUpdated(heirDeadline, heirApprovedDeadline, msg.sender);
    }

    ///	@notice Can be used to add an approver.
    ///	@dev Cannot add zero address or already added address.
    ///	@param _approver The new approver address.
    function addApprover(address _approver)
        public
        onlyOwner
        checkAddress(_approver)
    {
        require(!approverStatus[_approver], "Approver already added.");
        approverStatus[_approver] = true;
        approvers.push(_approver);
        emit approverAdded(_approver, msg.sender);
    }

    ///	@notice Can be used to delete an approver.
    ///	@dev The approver has to be valid.
    ///	@param _approver The approver address to be removed.
    function deleteApprover(address _approver) public onlyOwner {
        require(approverStatus[_approver], "Approver is not valid.");
        approverStatus[_approver] = false;
        uint256 count = approvers.length;
        uint256 index = count;
        for (uint256 i = 0; i < count; i++) {
            if (approvers[i] == _approver) {
                index = i;
            }
        }
        approvers[index] = approvers[count - 1];
        approvers.pop();
        emit approverDeleted(_approver, msg.sender);
    }

    ///	@notice Fallback Function for complex calls to other contracts.
    ///	@dev Proxy Logic only owner can call.
    fallback() external payable onlyOwner {
        address contractAddr;
        uint256 begin_index = msg.data.length - 32;
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, begin_index, 32)
            contractAddr := mload(ptr)
        }
        require(contractAddr != address(0));

        assembly {
            let ptr := mload(0x40)
            let actualcalldatasize := sub(calldatasize(), 32)
            // (1) copy incoming call data
            calldatacopy(ptr, 0, actualcalldatasize)
            // (2) call to contract
            let result := call(
                gas(),
                contractAddr,
                callvalue(),
                ptr,
                actualcalldatasize,
                0,
                0
            )
            let size := returndatasize()
            // (3) retrieve return data
            returndatacopy(ptr, 0, size)
            // (4) forward return data back to caller
            switch result
                case 0 {
                    revert(ptr, size)
                }
                default {
                    return(ptr, size)
                }
        }
    }

    /// @notice Can be used to receive ether from anyone.
    /// @dev This allows to receive ether from anyone unlike the fallback function.
    receive() external payable {
        emit ethReceived(msg.value, msg.sender);
    }

    /// @notice Withdraw Complete ETH balance.
    function withdrawAllETH() public onlyOwner {
        uint256 amount = payable(address(this)).balance;
        msg.sender.transfer(amount);
        emit ethWithdrawed(amount, msg.sender);
    }

    /// @notice Withdraw a particular amount of ETH.
    /// @param _amount Amount requested for withdrawal
    function withdrawSomeETH(uint256 _amount)
        public
        onlyOwner
        checkRemaining(_amount)
    {
        msg.sender.transfer(_amount);
        emit ethWithdrawed(_amount, msg.sender);
    }

    /// @notice Transfer `_amount` ETH to `_receiver`.
    /// @param _receiver The address of the receiver.
    /// @param _amount The amount to be received.
    function transferETH(address payable _receiver, uint256 _amount)
        public
        onlyOwner
        checkRemaining(_amount)
    {
        _receiver.transfer(_amount);
        emit ethTransferred(_amount, _receiver);
    }

    ///	@notice Can be used to deploy contracts.
    ///	@param _value The ether to be sent in wei.
    ///	@param _bytecode The smart contract code.
    ///	@return contractAddress The contract address created.
    function deployContract(uint256 _value, bytes memory _bytecode)
        public
        onlyOwner
        returns (address contractAddress)
    {
        assembly {
            /// the first slot of a dynamic type like bytes always holds the length of the array
            /// advance it by 32 bytes to access the actual contents
            contractAddress := create(
                _value,
                add(_bytecode, 0x20),
                mload(_bytecode)
            )
        }
        emit contractDeployed(contractAddress, msg.sender);
    }

    /*  Backup Owner Functions  */

    ///	@notice Can be used to update the owner.
    ///	@dev This function can be used by either owner or backupOwner.
    ///	@param _newOwner The new owner address.
    function updateOwner(address _newOwner)
        public
        onlyOwners
        checkAddress(_newOwner)
    {
        address oldOwner = owner;
        owner = _newOwner;
        emit ownerUpdated(_newOwner, oldOwner, msg.sender);
    }

    /*  Heir Functions  */

    ///	@notice Can be used to claim the contract ownership.
    ///	@dev This function starts the claim process for heir.
    function claimOwnership() public onlyHeir {
        require(!claimStarted, "Claim already started.");
        claimStarted = true;
        claimTime = block.timestamp;
        emit ownershipClaimed(msg.sender, claimTime);
    }

    ///	@notice Can be used by heir after approver approval.
    ///	@dev This function can only be called once majority vote is attained.
    ///	@param _backupOwner The new backup owner of this contract.
    ///	@param _heir The new heir of this contract.
    ///	@param _approvers The new approver address array added to the contract.
    ///	@param _deadline The new wait time for heir to claim without approval from approvers.
    ///	@param _approverDeadline The new wait time for heir to claim with approval from approvers.
    function accessOwnershipFromApprover(
        address _backupOwner,
        address _heir,
        address[] memory _approvers,
        uint256 _deadline,
        uint256 _approverDeadline
    ) public onlyHeir {
        require(claimStatus, "Majority vote required to access ownership.");
        require(
            block.timestamp - claimTime > heirApprovedDeadline,
            "Deadline has not passed."
        );
        _accessOwnership(
            _backupOwner,
            _heir,
            _approvers,
            _deadline,
            _approverDeadline
        );
    }

    ///	@notice Can be used by heir after deadline has been passed.
    ///	@dev This function can be called with or without the approver approvals after the deadline.
    ///	@param _backupOwner The new backup owner of this contract.
    ///	@param _heir The new heir of this contract.
    ///	@param _approvers The new approver address array added to the contract.
    ///	@param _deadline The new wait time for heir to claim without approval from approvers.
    ///	@param _approverDeadline The new wait time for heir to claim with approval from approvers.
    function accessOwnershipAfterDeadline(
        address _backupOwner,
        address _heir,
        address[] memory _approvers,
        uint256 _deadline,
        uint256 _approverDeadline
    ) public onlyHeir {
        require(
            block.timestamp - claimTime > heirDeadline,
            "Deadline has not passed."
        );
        _accessOwnership(
            _backupOwner,
            _heir,
            _approvers,
            _deadline,
            _approverDeadline
        );
    }

    ///	@dev This is an internal function which takes care of the ownership transfer tasks.
    ///	@param _backupOwner The new backup owner of this contract.
    ///	@param _heir The new heir of this contract.
    ///	@param _approvers The new approver address array added to the contract.
    ///	@param _deadline The new wait time for heir to claim without approval from approvers.
    ///	@param _approverDeadline The new wait time for heir to claim with approval from approvers.
    function _accessOwnership(
        address _backupOwner,
        address _heir,
        address[] memory _approvers,
        uint256 _deadline,
        uint256 _approverDeadline
    ) internal {
        require(claimStarted, "Claim was not started.");
        claimStatus = false;
        owner = msg.sender;
        updateBackupOwner(_backupOwner);
        updateHeir(_heir);
        address[] memory temp = approvers;
        for (uint256 user = 0; user < temp.length; user++) {
            deleteApprover(temp[user]);
        }
        for (uint256 user = 0; user < _approvers.length; user++) {
            addApprover(_approvers[user]);
        }
        updateDeadline(_deadline, _approverDeadline);
        emit ownershipAccessed(
            msg.sender,
            _backupOwner,
            _heir,
            _approvers.length,
            _deadline,
            _approverDeadline
        );
    }

    /*  Approver Functions  */

    ///	@notice Can be used to approve or reject a claim request by heir.
    ///	@dev Only callable if claim has started and approver not already voted.
    ///	@param _acceptance True if approved, False otherwise.
    function approveHeir(bool _acceptance) public onlyApprover {
        require(claimStarted, "Claim has not started yet.");
        require(!voted[msg.sender], "Already voted.");
        voted[msg.sender] = true;
        if (_acceptance) {
            voteCount++;
            if (voteCount > approvers.length / 2) {
                claimStatus = true;
                emit heirApproved(voteCount);
            }
        }
        emit heirApproval(msg.sender, _acceptance);
    }

    /*  Read/Getter Functions  */

    ///	@notice To get the length of the approvers array.
    ///	@dev Used for testing and frontend.
    ///	@return count The no. of approvers present at the moment.
    function approversLength() public view returns (uint256 count) {
        return approvers.length;
    }
}
