// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.2;

import {UltraVerifier as TransactionInclusionPlonkVerification} from
    "./verifiers/TransactionInclusionPlonkVerification.sol";
import {HeaderStorage} from "./HeaderStorage.sol";

error DepositTooLow();
error DepositTooHigh();
error DepositFailed();
error WithdrawFailed();
error LpDoesntExist();
error TooManyLps();
error NotEnoughLiquidity();
error InvalidOrder();
error NotEnoughLiquidityConsumed();
error LiquidityReserved(uint256 unlockTime);
error LiquidityNotReserved();
error InvalidLpIndex();
error NoLiquidityToReserve();
error OrderComplete();

contract Exchange {
    uint64 public constant MIN_DEPOSIT = 0.05 ether; 
    uint64 public constant RESERVATION_LOCKUP = 12 hours; 
    uint16 public constant MAX_DEPOSIT_OUTPUTS = 50; 
    // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 - testing header storage contract address
    // 0x007ab3f410ceba1a111b100de2f76a8154b80126cda3f8cab47728d2f8cd0d6d - testing btc payout address

    struct LPBalanceChange {
        uint32 depositIndex;
        uint64 value;
    }

    struct LiquidityDeposit {
        uint64 ethDepositAmount;
        uint64[] ethReservedAmounts;
        uint64 btcExchangeRate; // amount of btc per 1 eth
        bytes32 btcPayoutAddress;
        bytes32 depositStateHash;
        uint256[] reservationTimestamps;
    }

    struct SwapReservation {
        uint32[] depositIndexes;
        address ethPayoutAddress;
        string btcSenderAddress;
        uint256 reservationTimestamp;
        bytes32 nonce;
        bytes32 depositsHash;
        bool completed;
    }

    // Liquidity Deposit Mappings
    mapping(address => LiquidityDeposit[]) public LiquidityDeposits;
    mapping(address => uint32[]) public OverwritableDepositIndexes;
    
    // Swap Reservation Mappings
    mapping(uint32 => SwapReservation) public SwapReservations;
    mapping(address => uint32[]) public CompletedSwapIndexs;

    TransactionInclusionPlonkVerification public immutable VerifierContract;
    HeaderStorage public immutable HeaderStorageContract;

    constructor(address headerStorageContractAddress) {
        VerifierContract = new TransactionInclusionPlonkVerification();
        HeaderStorageContract = HeaderStorage(headerStorageContractAddress);
    }

    function markDepositOverwritableTesting (uint32 index) public {
        OverwritableDepositIndexes[msg.sender].push(index);
    }

    function depositLiquidity(bytes32 btcPayoutAddress, uint64 btcExchangeRate) public payable {
        // [0] validate deposit amount
        uint256 depositAmount = msg.value;
        if (depositAmount < MIN_DEPOSIT) {
            revert DepositTooLow();  
        } else if (depositAmount > 200000 ether) {
            revert DepositTooHigh();
        }

        // TODO: [1] validate btcPayoutAddress && btcExchangeRate

        // [2] add new liquidity deposit
        uint32[] storage overwriteableIndexes = OverwritableDepositIndexes[msg.sender];
        bytes32 depositStateHash = keccak256(abi.encode(btcPayoutAddress, depositAmount, btcExchangeRate));  // TODO: decide what to hash

        // overwrite an empty deposit slot if one exists
        if (overwriteableIndexes.length > 0) {
            // overwrite last available slot
            uint32 reuseIndex = overwriteableIndexes[overwriteableIndexes.length - 1];
            LiquidityDeposit storage oldDeposit = LiquidityDeposits[msg.sender][reuseIndex];

            // update old deposit slot
            oldDeposit.ethDepositAmount = uint64(depositAmount);
            oldDeposit.btcExchangeRate = btcExchangeRate;
            oldDeposit.btcPayoutAddress = btcPayoutAddress;
            oldDeposit.depositStateHash = depositStateHash;

            // clear arrays
            delete oldDeposit.ethReservedAmounts;
            delete oldDeposit.reservationTimestamps;

            // remove slot from available indexes
            overwriteableIndexes.pop(); 

        // if no empty slot exists, add a new deposit 
        } else {         
            LiquidityDeposits[msg.sender].push(LiquidityDeposit({
                ethDepositAmount: uint64(depositAmount),
                ethReservedAmounts: new uint64[](0),
                btcExchangeRate: btcExchangeRate,
                btcPayoutAddress: btcPayoutAddress,
                depositStateHash: depositStateHash,
                reservationTimestamps: new uint256[](0)
            }));
        }
    }


//-------------------- ^ valid code above this line ^ --------------------

    // function getLiquidity(uint32 _depositIndex)
    //     internal
    //     returns (
    //         uint64 _exchangeRate,
    //         uint64 _ethDepositAmount,
    //         uint256 _lastReservationPointer // Changed type from uint176 to uint256
    //     )
    // {
    //     LiquidityDeposit storage deposit = LiquidityDeposits[_depositIndex];
    //     _ethDepositAmount = deposit.ethDepositAmount;
    //     _lastReservationPointer = deposit.lastReservationTimestamp;
    //     if (deposit.btcRequestedAmount > 0) {
    //         _exchangeRate = deposit.ethDepositAmount / deposit.btcRequestedAmount;
    //     } else {
    //         _exchangeRate = 0;
    //     }
    // }

    // function validateLiquidityFree(uint256 _lastReservationPointer) internal {
    //     if (_lastReservationPointer != 0) {
    //         uint256 unlock_timestamp =
    //             SwapReservations[_lastReservationPointer - 1].reservationTimestamp + RESERVATION_LOCKUP;

    //         if (block.timestamp <= unlock_timestamp) {
    //             revert LiquidityReserved(unlock_timestamp); // Provide the expected unlockTime argument
    //         }
    //     }
    // }


    // function withdrawLiquidity(uint64 amount) public {
    //     uint32 _depositIndex = depositIndex[msg.sender];
    //     if (_depositIndex == 0) {
    //         revert LpDoesntExist();
    //     }

    //     uint64 amountDeposited;
    //     uint256 lastReservationPointer;
    //     (, amountDeposited, lastReservationPointer) = getLiquidity(_depositIndex);

    //     if (amountDeposited < amount) {
    //         revert NotEnoughLiquidity();
    //     }

    //     validateLiquidityFree(lastReservationPointer);

    //     LiquidityDeposits[_depositIndex].ethDepositAmount -= amount;
    // }

    // function reserveLiquidity(
    //     uint32[] memory _depositIndexes,
    //     address _ethPayoutAddress,
    //     string memory _senderBTCAddress
    // ) public {
    //     if (_depositIndexes.length > MAX_DEPOSIT_OUTPUTS) {
    //         revert TooManyLps();
    //     }
    //     bytes32 depositsHash;
    //     for (uint16 i = 0; i < _depositIndexes.length; i++) {
    //         if (_depositIndexes[i] > totalDepositCount) {
    //             revert InvalidLpIndex();
    //         }

    //         LiquidityDeposit memory lp = LiquidityDeposits[_depositIndexes[i]];

    //         // Here we correct `amountDeposited` to `ethDepositAmount`
    //         if (lp.ethDepositAmount == 0) {
    //             revert NoLiquidityToReserve();
    //         }

    //         uint256 unlock_timestamp = lp.lastReservationTimestamp + RESERVATION_LOCKUP;

    //         if (block.timestamp <= unlock_timestamp) {
    //             revert LiquidityReserved(unlock_timestamp);
    //         }

    //         depositsHash = keccak256(abi.encode(depositsHash, lp.ethDepositAmount, lp.btcPayoutAddress));

    //         LiquidityDeposits[_depositIndexes[i]].lastReservationTimestamp = block.timestamp;
    //     }

    //     SwapReservation memory newSwapReservation = SwapReservation({
    //         depositIndexes: _depositIndexes,
    //         ethPayoutAddress: _ethPayoutAddress,
    //         btcSenderAddress: _senderBTCAddress, // Corrected from senderBtcAddress to btcSenderAddress
    //         reservationTimestamp: block.timestamp,
    //         nonce: keccak256(
    //             abi.encode(_ethPayoutAddress, _senderBTCAddress, block.timestamp, block.chainid, SwapReservations.length)
    //             ),
    //         depositsHash: depositsHash,
    //         completed: false
    //     });

    //     SwapReservations.push(newSwapReservation);
    // }
}
