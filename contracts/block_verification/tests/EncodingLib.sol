pragma solidity ^0.8.0;

library Codec {
    error IntegerEncodingError();

    function stringToUint(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        uint256 oldResult = 0;
        for (uint256 i = 0; i < b.length; i++) {
            // c = b[i] was not needed
            if (b[i] >= bytes1(uint8(48)) && b[i] <= bytes1(uint8(57))) {
                // store old value so we can check for overflows
                oldResult = result;
                result = result * 10 + (uint256(uint8(b[i])) - 48); // bytes and int are not compatible with the operator -.
                // prevent overflows
                if (oldResult > result) {
                    // we can only get here if the result overflowed and is smaller than last stored value
                    revert IntegerEncodingError();
                }
            } else {
                revert IntegerEncodingError();
            }
        }
        return result;
    }

    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
}
