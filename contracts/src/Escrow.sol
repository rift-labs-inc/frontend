// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import { UltraVerifier as TransactionInclusionPlonkVerification } from './verifiers/TransactionInclusionPlonkVerification.sol';
import { HeaderStorage } from './HeaderStorage.sol';

error DepositTooLow();
error DepositTooHigh();
error DepositFailed();
error WithdrawFailed();
error LpDoesntExist();
error TooManyLps();
error NotEnoughLiquidity();
error ReservationAmountTooLow();
error InvalidOrder();
error NotEnoughLiquidityConsumed();
error LiquidityReserved(uint256 unlockTime);
error LiquidityNotReserved();
error InvalidLpIndex();
error NoLiquidityToReserve();
error OrderComplete();
error ReservationFeeTooLow();

contract Escrow {
    uint64 public constant MIN_DEPOSIT = 0.05 ether;
    uint256 public constant MAX_DEPOSIT = 200_000 ether;
    uint64 public constant RESERVATION_LOCKUP_PERIOD = 12 hours;
    uint16 public constant MAX_DEPOSIT_OUTPUTS = 50;
    uint256 public constant PROOF_GAS_COST = 420_000;
    uint256 public constant MIN_ORDER_GAS_MULTIPLIER = 2;

    // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 - testing header storage contract address
    // 0x007ab3f410ceba1a111b100de2f76a8154b80126cda3f8cab47728d2f8cd0d6d - testing btc payout address

    uint8 public protocolFee = 100; // 100 bp = 1%
    uint8 public treasuryFee = 0;
    uint256 public proverGasReward = 0.002 ether;

    struct LPBalanceChange {
        uint32 depositIndex;
        uint64 value;
    }

    struct LiquidityDeposit {
        uint256 ethDepositAmount;
        uint256[] ethReservedAmounts;
        uint256 btcExchangeRate; // amount of btc per 1 eth
        string btcPayoutAddress;
        bytes32 depositStateHash;
        uint256[] reservationTimestamps;
    }

    struct SwapOrder {
        address[] lpAddresses;
        uint32[] depositIndexes;
        uint256[] amountsToReserve;
        address ethPayoutAddress;
        string btcSenderAddress;
        uint256 reservationTimestamp;
        bytes32 nonce;
        bytes32 depositsHash;
        bool completed;
    }

    // Liquidity Deposits
    mapping(address => LiquidityDeposit[]) public liquidityDeposits; // lpAddress => LiquidityDeposits
    mapping(address => uint32[]) public completedDeposits;

    // Swap Reservations
    mapping(address => SwapOrder[]) public swapOrders; // ethPayoutAddress => SwapOrder
    SwapOrder[] public completedSwaps;

    TransactionInclusionPlonkVerification public immutable VerifierContract;
    HeaderStorage public immutable HeaderStorageContract;
    address payable protocolAddress = payable(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);

    //--------- CONSTRUCTOR ---------//

    constructor(address headerStorageContractAddress) {
        VerifierContract = new TransactionInclusionPlonkVerification();
        HeaderStorageContract = HeaderStorage(headerStorageContractAddress);
    }

    //--------- TESTING FUNCTIONS ---------//

    function markDepositOverwritableTesting(uint32 index) public {
        completedDeposits[msg.sender].push(index);
    }

    //--------- WRITE FUNCTIONS ---------//

    function depositLiquidity(string memory btcPayoutAddress, uint64 btcExchangeRate) public payable {
        // [0] validate deposit amount
        uint256 depositAmount = msg.value;
        if (depositAmount <= MIN_DEPOSIT) {
            revert DepositTooLow();
        } else if (depositAmount >= MAX_DEPOSIT) {
            revert DepositTooHigh();
        }

        // TODO: [1] validate btcPayoutAddress && btcExchangeRate

        // [2] add new liquidity deposit
        uint32[] storage overwriteableIndexes = completedDeposits[msg.sender];
        bytes32 depositStateHash = keccak256(abi.encode(btcPayoutAddress, depositAmount, btcExchangeRate)); // TODO: decide what to hash

        // overwrite an empty deposit slot if one exists
        if (overwriteableIndexes.length > 0) {
            // overwrite last available slot
            uint32 reuseIndex = overwriteableIndexes[overwriteableIndexes.length - 1];
            LiquidityDeposit storage oldDeposit = liquidityDeposits[msg.sender][reuseIndex];

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
            liquidityDeposits[msg.sender].push(
                LiquidityDeposit({
                    ethDepositAmount: uint64(depositAmount),
                    ethReservedAmounts: new uint256[](0),
                    btcExchangeRate: btcExchangeRate,
                    btcPayoutAddress: btcPayoutAddress,
                    depositStateHash: depositStateHash,
                    reservationTimestamps: new uint256[](0)
                })
            );
        }
    }

    function reserveLiquidity(
        address[] memory lpAddressesToReserve,
        uint32[] memory lpDepositIndexes,
        uint256[] memory amountsToReserve,
        address ethPayoutAddress,
        string memory btcSenderAddress // TODO: validateAddresses([ethPayoutAddress], [btcSenderAddress])
    ) public payable {
        // calculate total amount of ETH the user is attempting to reserve
        uint256 totalReserveAmount = 0;
        for (uint i = 0; i < amountsToReserve.length; i++) {
            totalReserveAmount += amountsToReserve[i];
        }

        // verify reservation amount is greater than minimum swap size
        if (totalReserveAmount < ((PROOF_GAS_COST * tx.gasprice) * MIN_ORDER_GAS_MULTIPLIER) + proverGasReward) {
            revert ReservationAmountTooLow();
        }

        // validate reservation fee can be paid
        if (msg.value < (totalReserveAmount * (protocolFee / 10_000))) {
            revert ReservationFeeTooLow();
        } else {
            // send protocol fee to protocol address
            (bool success, ) = protocolAddress.call{ value: msg.value }('');
            if (!success) {
                revert DepositFailed();
            }

            // iterate over each liquidity deposit to reserve
            for (uint i = 0; i < lpAddressesToReserve.length; i++) {
                // extract specific liquidity deposit
                LiquidityDeposit storage deposit = liquidityDeposits[lpAddressesToReserve[i]][lpDepositIndexes[i]];

                // calculate amount available in deposit
                uint256 ethAvailableToReserve = getAvailableLiquidity(lpAddressesToReserve[i], lpDepositIndexes[i]);

                // check if there is enough liquidity in this deposit to reserve
                if (amountsToReserve[i] > ethAvailableToReserve) {
                    revert NotEnoughLiquidity();
                }

                // check for expired reservation slots to overwrite
                int256 overwriteableReservationSlotIndex = -1;
                for (int256 j = 0; j < int256(deposit.reservationTimestamps.length); j++) {
                    if (block.timestamp - deposit.reservationTimestamps[uint256(j)] > RESERVATION_LOCKUP_PERIOD) {
                        overwriteableReservationSlotIndex = j;
                        break;
                    }
                }

                // overwrite expired reservation slot in deposit if available
                if (overwriteableReservationSlotIndex != -1) {
                    deposit.ethReservedAmounts[uint256(overwriteableReservationSlotIndex)] = amountsToReserve[i];
                    deposit.reservationTimestamps[uint256(overwriteableReservationSlotIndex)] = block.timestamp;
                }
                // if no expired slots available, push new reservation to deposit
                else {
                    deposit.ethReservedAmounts.push(amountsToReserve[i]);
                    deposit.reservationTimestamps.push(block.timestamp);
                }
            }
        }

        // [f] check if there is an empty swap order to overwrite
        if (completedSwaps.length > 0) {
            // overwrite last available slot
            SwapOrder storage swapOrder = completedSwaps[completedSwaps.length - 1];

            // update old swap order
            swapOrder.lpAddresses = lpAddressesToReserve;
            swapOrder.depositIndexes = lpDepositIndexes;
            swapOrder.amountsToReserve = amountsToReserve;
            swapOrder.ethPayoutAddress = ethPayoutAddress;
            swapOrder.btcSenderAddress = btcSenderAddress;
            swapOrder.reservationTimestamp = block.timestamp;
            swapOrder.nonce = keccak256(abi.encode(ethPayoutAddress, btcSenderAddress, block.timestamp, swapOrder.lpAddresses.length)); // Assuming lpAddresses is still part of SwapOrder
            swapOrder.depositsHash = keccak256(abi.encode(1)); // TODO: fix this
            swapOrder.completed = false;

            // remove slot from available indexes
            completedSwaps.pop();
        }
        // if slots available to overwrite, push new swap order
        else {
            SwapOrder memory newSwapOrder = SwapOrder({
                lpAddresses: lpAddressesToReserve,
                depositIndexes: lpDepositIndexes,
                amountsToReserve: amountsToReserve,
                ethPayoutAddress: ethPayoutAddress,
                btcSenderAddress: btcSenderAddress,
                reservationTimestamp: block.timestamp,
                nonce: keccak256(abi.encode(ethPayoutAddress, btcSenderAddress, block.timestamp)), // TODO: decide what randomness generates this nonce
                depositsHash: keccak256(abi.encode(1)), // TODO: fix this
                completed: false
            });

            swapOrders[ethPayoutAddress].push(newSwapOrder);
        }
    }

    //--------- READ FUNCTIONS ---------//

    function getLiquidityDepositsLength(address lpAddress) public view returns (uint256) {
        return liquidityDeposits[lpAddress].length;
    }

    function getLiquidityDeposit(address lpAddress, uint256 index) public view returns (LiquidityDeposit memory) {
        return liquidityDeposits[lpAddress][index];
    }

    //--------- HELPER FUNCTIONS ---------//

    function getAvailableLiquidity(address lpAddress, uint depositIndex) public view returns (uint256) {
        // [0] extract specific liquidity deposit
        LiquidityDeposit storage deposit = liquidityDeposits[lpAddress][depositIndex];

        // [1] calculate total amount reserved
        uint256 totalReserved = 0;
        for (uint i = 0; i < deposit.ethReservedAmounts.length; i++) {
            // ensure reservation is not expired
            if (block.timestamp - deposit.reservationTimestamps[i] < RESERVATION_LOCKUP_PERIOD) {
                totalReserved += deposit.ethReservedAmounts[i];
            }
        }

        // [2] return available liquidity amount
        return deposit.ethDepositAmount - totalReserved;
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
    //             OrderReservations[_lastReservationPointer - 1].reservationTimestamp + RESERVATION_LOCKUP;

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

    //     OrderReservation memory newOrderReservation = OrderReservation({
    //         depositIndexes: _depositIndexes,
    //         ethPayoutAddress: _ethPayoutAddress,
    //         btcSenderAddress: _senderBTCAddress, // Corrected from senderBtcAddress to btcSenderAddress
    //         reservationTimestamp: block.timestamp,
    //         nonce: keccak256(
    //             abi.encode(_ethPayoutAddress, _senderBTCAddress, block.timestamp, block.chainid, OrderReservations.length)
    //             ),
    //         depositsHash: depositsHash,
    //         completed: false
    //     });

    //     OrderReservations.push(newOrderReservation);
    // }
}
