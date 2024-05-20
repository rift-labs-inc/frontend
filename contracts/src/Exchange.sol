// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.2;

import {UltraVerifier as TransactionInclusionPlonkVerification} from
    "./verifiers/TransactionInclusionPlonkVerification.sol";
import {HeaderStorage} from "./HeaderStorage.sol";

error DepositTooLow();
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
    // TODO: Make this non-constant, recalculable targeting ~150 USD
    uint64 public constant MIN_DEPOSIT = 0.002 * 10 ** 8; // Min deposit: 0.002 BTC
    uint64 public constant RESERVATION_LOCKUP = 12 hours; // Lockup period: 12 hours
    uint16 public constant MAX_LIQUIDITY_PROVIDERS_PER_SWAP = 50; // Max output: 50 LPs

    struct LPDeposit {
        uint64 ethDepositAmount;
        uint64 btcRequestedAmount;
        bytes32 btcPayoutAddress;
        bytes32 stateRoot;
        uint256 lastReservationTimestamp;
    }

    struct SwapReservation {
        uint32[] depositIndexes;
        address ethPayoutAddress;
        string btcSenderAddress;
        uint256 reservationTimestamp;
        bytes32 nonce;
        bytes32 depositsHash;
        bool complete;
    }

    struct LPBalanceChange {
        uint32 depostIndex;
        uint64 value;
    }

    TransactionInclusionPlonkVerification public immutable verifier;
    HeaderStorage public immutable header_storage;

    uint32 totalDepositCount;
    mapping(uint32 => LPDeposit) public LPDeposits;
    mapping(address => uint32) public depostIndex;
    SwapReservation[] public SwapReservations;

    constructor(address _header_storage) {
        verifier = new TransactionInclusionPlonkVerification();
        header_storage = HeaderStorage(_header_storage);
    }

    function getLiquidity(uint32 _depostIndex)
        internal
        returns (
            uint64 _exchangeRate,
            uint64 _ethDepositAmount,
            uint256 _lastReservationPointer // Changed type from uint176 to uint256
        )
    {
        LPDeposit storage deposit = LPDeposits[_depostIndex];
        _ethDepositAmount = deposit.ethDepositAmount;
        _lastReservationPointer = deposit.lastReservationTimestamp;
        if (deposit.btcRequestedAmount > 0) {
            _exchangeRate = deposit.ethDepositAmount / deposit.btcRequestedAmount;
        } else {
            _exchangeRate = 0;
        }
    }

function validateLiquidityFree(uint256 _lastReservationPointer) internal {
    if (_lastReservationPointer != 0) {
        uint256 unlock_timestamp =
            SwapReservations[_lastReservationPointer - 1].reservationTimestamp + RESERVATION_LOCKUP;

        if (block.timestamp <= unlock_timestamp) {
            revert LiquidityReserved(unlock_timestamp); // Provide the expected unlockTime argument
        }
    }
}

function depositLiquidity(bytes32 btcPayoutAddress) public payable {
    uint64 depositAmount = uint64(msg.value);  // Convert msg.value to uint64, assuming the amounts won't exceed uint64 limits

    if (depositAmount < MIN_DEPOSIT) {
        revert DepositTooLow();
    }

    uint32 _depostIndex = depostIndex[msg.sender];
    if (_depostIndex != 0) {
        (, uint64 amountDeposited, uint256 lastReservationPointer) = getLiquidity(_depostIndex);
        validateLiquidityFree(lastReservationPointer);

        // Update deposited amount
        LPDeposits[_depostIndex].ethDepositAmount = depositAmount + amountDeposited;
        LPDeposits[_depostIndex].stateRoot =
            keccak256(abi.encode(btcPayoutAddress, depositAmount + amountDeposited));
    } else {
        uint32 _totalDepositCount = totalDepositCount;
        totalDepositCount = _totalDepositCount + 1;
        depostIndex[msg.sender] = _totalDepositCount;
        LPDeposits[_totalDepositCount] = LPDeposit({
            ethDepositAmount: depositAmount,
            btcRequestedAmount: 0, // Initialize as needed
            btcPayoutAddress: btcPayoutAddress,
            stateRoot: keccak256(abi.encode(btcPayoutAddress, depositAmount)),
            lastReservationTimestamp: 0
        });
    }
}

    function withdrawLiquidity(uint64 amount) public {
        uint32 _depostIndex = depostIndex[msg.sender];
        if (_depostIndex == 0) {
            revert LpDoesntExist();
        }

        uint64 amountDeposited;
        uint256 lastReservationPointer;
        (, amountDeposited, lastReservationPointer) = getLiquidity(_depostIndex);

        if (amountDeposited < amount) {
            revert NotEnoughLiquidity();
        }

        validateLiquidityFree(lastReservationPointer);

        LPDeposits[_depostIndex].ethDepositAmount -= amount;
    }

    function reserveLiquidity(
        uint32[] memory _depositIndexes,
        address _ethPayoutAddress,
        string memory _senderBTCAddress
    ) public {
        if (_depositIndexes.length > MAX_LIQUIDITY_PROVIDERS_PER_SWAP) {
            revert TooManyLps();
        }
        bytes32 depositsHash;
        for (uint16 i = 0; i < _depositIndexes.length; i++) {
            if (_depositIndexes[i] > totalDepositCount) {
                revert InvalidLpIndex();
            }

            LPDeposit memory lp = LPDeposits[_depositIndexes[i]];

            // Here we correct `amountDeposited` to `ethDepositAmount`
            if (lp.ethDepositAmount == 0) {
                revert NoLiquidityToReserve();
            }

            uint256 unlock_timestamp = lp.lastReservationTimestamp + RESERVATION_LOCKUP;

            if (block.timestamp <= unlock_timestamp) {
                revert LiquidityReserved(unlock_timestamp);
            }

            depositsHash = keccak256(abi.encode(depositsHash, lp.ethDepositAmount, lp.btcPayoutAddress));

            LPDeposits[_depositIndexes[i]].lastReservationTimestamp = block.timestamp;
        }

SwapReservation memory newSwapReservation = SwapReservation({
    depositIndexes: _depositIndexes,
    ethPayoutAddress: _ethPayoutAddress,
    btcSenderAddress: _senderBTCAddress, // Corrected from senderBtcAddress to btcSenderAddress
    reservationTimestamp: block.timestamp,
    nonce: keccak256(
        abi.encode(
            _ethPayoutAddress,
            _senderBTCAddress,
            block.timestamp,
            block.chainid,
            SwapReservations.length
        )
    ),
    depositsHash: depositsHash,
    complete: false
});


        SwapReservations.push(newSwapReservation);
    }

    // TODO: function proposeTransactionProof
}
