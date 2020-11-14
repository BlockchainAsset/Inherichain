## `CentralizedArbitratorWithAppeal`






### `arbitrationCost(bytes _extraData) → uint256` (public)





### `appealCost(uint256 _disputeID, bytes _extraData) → uint256` (public)





### `setArbitrationCost(uint256 _newCost)` (public)





### `createDispute(uint256 _choices, bytes _extraData) → uint256 disputeID` (public)





### `disputeStatus(uint256 _disputeID) → enum IArbitrator.DisputeStatus status` (public)





### `currentRuling(uint256 _disputeID) → uint256 ruling` (public)





### `giveRuling(uint256 _disputeID, uint256 _ruling)` (public)





### `executeRuling(uint256 _disputeID)` (public)





### `appeal(uint256 _disputeID, bytes _extraData)` (public)





### `appealPeriod(uint256 _disputeID) → uint256 start, uint256 end` (public)






