// NOT ACTUALLY USED BY THE PROTOCOL (HELPER FOR FRONTEND)

// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

contract DepositVaultsData {
    constructor(uint256 startIndex, uint256 arrayLength, address riftExchangeContract) {
        bytes[] memory allDepositVaults = new bytes[](arrayLength);

        for (uint256 i = 0; i < arrayLength; ++i) {
            (bool depositVaultSuccess, bytes memory depositVaultData) = riftExchangeContract.call{gas: 20000}(
                abi.encodeWithSignature("getDepositVault(uint256)")
            );
        }

        bytes memory _abiEncodedData = abi.encode(allDepositVaults);

        assembly {
            let dataStart := add(_abiEncodedData, 0x20)
            return(dataStart, sub(msize(), dataStart))
        }
    }
}
