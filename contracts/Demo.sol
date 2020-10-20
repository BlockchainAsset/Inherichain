// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.0;

contract Demo {
    uint256 public value;
    address public addr;

    event newValue(uint256 indexed _value);

    function set(uint256 _newValue) public returns (bool status) {
        value = _newValue;
        emit newValue(_newValue);
        return true;
    }

    function get() public view returns (uint256) {
        return value;
    }
}
