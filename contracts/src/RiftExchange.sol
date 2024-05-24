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
error InvalidDepositIndex();
error WithdrawalAmountError();

contract RiftExchange {
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

    struct DepositVault {
        uint256 ethDepositAmount;
        uint256[] ethReservedAmounts;
        uint256 btcExchangeRate; // amount of btc per 1 eth
        string btcPayoutAddress;
        bytes32 depositStateHash;
        uint256[] reservationTimestamps;
    }

    struct SwapReservation {
        address[] lpAddresses;
        uint32[] depositIds;
        uint256[] amountsToReserve;
        address ethPayoutAddress;
        string btcSenderAddress;
        uint256 reservationTimestamp;
        bytes32 nonce;
        bytes32 depositsHash;
        bool completed;
    }

    // Liquidity Deposits
    mapping(address => DepositVault[]) public depositVaults; // lpAddress => DepositVaults
    mapping(address => uint32[]) public emptyVaultIDs; // lpAddress => id of completed deposits

    // Swap Reservations
    mapping(address => SwapReservation[]) public swapReservations; // ethPayoutAddress => SwapReservation
    SwapReservation[] public completedSwaps;

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
        emptyVaultIDs[msg.sender].push(index);
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
        uint32[] storage overwriteableIndexes = emptyVaultIDs[msg.sender];
        bytes32 depositStateHash = keccak256(abi.encode(btcPayoutAddress, depositAmount, btcExchangeRate)); // TODO: decide what to hash

        // overwrite an empty deposit slot if one exists
        if (overwriteableIndexes.length > 0) {
            // overwrite last available slot
            uint32 reuseIndex = overwriteableIndexes[overwriteableIndexes.length - 1];
            DepositVault storage oldDeposit = depositVaults[msg.sender][reuseIndex];

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
            depositVaults[msg.sender].push(
                DepositVault({
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

    function updateExchangeRate(uint256 depositVaultIndex, uint256 newBtcExchangeRate) public {
        // retrieve deposit
        DepositVault storage deposit = depositVaults[msg.sender][depositVaultIndex];

        // validate this is an active vault
        require(deposit.ethDepositAmount > 0, 'Invalid liquidity deposit index');
        require(newBtcExchangeRate > 0, 'Invalid new BTC exchange rate');

        // Check if there's any unreserved ETH to update
        uint256 ethAvailableAmount = getAvailableLiquidity(msg.sender, depositVaultIndex);
        require(ethAvailableAmount > 0, 'No unreserved ETH available to update');

        // If there are no reservations for this vault, simply update the exchange rate
        if (deposit.ethReservedAmounts.length == 0) {
            deposit.btcExchangeRate = newBtcExchangeRate;
            deposit.depositStateHash = keccak256(abi.encode(deposit));
        } else {
            // Create a new deposit for the unreserved amount with the new exchange rate
            deposit.ethDepositAmount -= ethAvailableAmount;
            DepositVault memory newDeposit = DepositVault({
                ethDepositAmount: ethAvailableAmount,
                ethReservedAmounts: new uint256[](0),
                btcExchangeRate: newBtcExchangeRate,
                btcPayoutAddress: deposit.btcPayoutAddress,
                depositStateHash: keccak256(abi.encode(deposit.btcPayoutAddress, ethAvailableAmount, newBtcExchangeRate)),
                reservationTimestamps: new uint256[](0)
            });

            depositVaults[msg.sender].push(newDeposit);
        }
    }

    function withdrawLiquidity(uint256 depositVaultIndex, uint256 amountToWithdraw) public {
        // [0] validate deposit index
        if (depositVaultIndex >= depositVaults[msg.sender].length) {
            revert InvalidDepositIndex();
        }

        // [1] retrieve the deposit
        DepositVault storage deposit = depositVaults[msg.sender][depositVaultIndex];

        // [2] validate amount to withdraw
        uint256 availableLiquidity = getAvailableLiquidity(msg.sender, depositVaultIndex);
        if (amountToWithdraw == 0 || amountToWithdraw > availableLiquidity) {
            revert WithdrawalAmountError();
        }

        // [3] withdraw funds
        deposit.ethDepositAmount -= amountToWithdraw;
        (bool success, ) = payable(msg.sender).call{ value: amountToWithdraw }('');
        require(success, 'Failed to transfer ETH');

        // [4] mark deposit as completed if empty
        if (deposit.ethDepositAmount == 0) {
            emptyVaultIDs[msg.sender].push(uint32(depositVaultIndex));
        }
    }

    function reserveLiquidity(
        address[] memory lpAddressesToReserve,
        uint32[] memory lpdepositIds,
        uint256[] memory amountsToReserve,
        address ethPayoutAddress,
        string memory btcSenderAddress // TODO: validateAddresses([ethPayoutAddress], [btcSenderAddress])
    ) public payable {
        // calculate total amount of ETH the user is attempting to reserve
        uint256 totalSwapAmount = 0;
        for (uint i = 0; i < amountsToReserve.length; i++) {
            totalSwapAmount += amountsToReserve[i];
        }

        // verify reservation amount is greater than minimum swap size
        if (totalSwapAmount < ((PROOF_GAS_COST * tx.gasprice) * MIN_ORDER_GAS_MULTIPLIER) + proverGasReward) {
            revert ReservationAmountTooLow();
        }

        // validate reservation fee can be paid
        if (msg.value < (totalSwapAmount * (protocolFee / 10_000))) {
            revert ReservationFeeTooLow();
        } else {
            // send protocol fee to protocol address
            (bool success, ) = protocolAddress.call{ value: msg.value }('');
            if (!success) {
                revert DepositFailed();
            }

            // iterate over each liquidity deposit to reserve
            for (uint i = 0; i < lpAddressesToReserve.length; i++) {
                // retrieve specific liquidity deposit
                DepositVault storage deposit = depositVaults[lpAddressesToReserve[i]][lpdepositIds[i]];

                // calculate amount available in deposit
                uint256 ethAvailableToReserve = getAvailableLiquidity(lpAddressesToReserve[i], lpdepositIds[i]);

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

        // check if there are any completed swap orders that can be overwritten
        if (completedSwaps.length > 0) {
            // retrieve swap order to overwrite
            SwapReservation storage swapReservation = completedSwaps[completedSwaps.length - 1];

            // overwrite old swap order
            swapReservation.lpAddresses = lpAddressesToReserve;
            swapReservation.depositIds = lpdepositIds;
            swapReservation.amountsToReserve = amountsToReserve;
            swapReservation.ethPayoutAddress = ethPayoutAddress;
            swapReservation.btcSenderAddress = btcSenderAddress;
            swapReservation.reservationTimestamp = block.timestamp;
            swapReservation.nonce = keccak256(abi.encode(ethPayoutAddress, btcSenderAddress, block.timestamp, swapReservation.lpAddresses.length)); // Assuming lpAddresses is still part of SwapReservation
            swapReservation.depositsHash = keccak256(abi.encode(1)); // TODO: fix this
            swapReservation.completed = false;

            // mark swap order as active by removing it from completed swaps
            completedSwaps.pop();
        }
        // if there are no completed swaps to overwrite, allocate a new one new swap order
        else {
            swapReservations[ethPayoutAddress].push(
                SwapReservation({
                    lpAddresses: lpAddressesToReserve,
                    depositIds: lpdepositIds,
                    amountsToReserve: amountsToReserve,
                    ethPayoutAddress: ethPayoutAddress,
                    btcSenderAddress: btcSenderAddress,
                    reservationTimestamp: block.timestamp,
                    nonce: keccak256(abi.encode(ethPayoutAddress, btcSenderAddress, block.timestamp)), // TODO: decide what randomness generates this nonce
                    depositsHash: keccak256(abi.encode(1)), // TODO: fix this
                    completed: false
                })
            );
        }
    }

    function unlockLiquidity(address ethPayoutAddress, uint256 swapReservationIndex, bytes memory proof, bytes32[] calldata publicInputs) public {
        // [0] retrieve swap order
        SwapReservation storage swapReservation = swapReservations[ethPayoutAddress][swapReservationIndex];

        // [1] verify swap order ETH payout address
        if (swapReservation.ethPayoutAddress != ethPayoutAddress) {
            revert InvalidOrder();
        }

        // [2] calculate total swap amount
        uint256 totalSwapAmount = 0;
        for (uint256 i = 0; i < swapReservation.amountsToReserve.length; i++) {
            totalSwapAmount += swapReservation.amountsToReserve[i];
        }

        // [3] verify swap amount matches public input's ETH output amount
        if (totalSwapAmount != uint256(publicInputs[0])) {
            revert NotEnoughLiquidityConsumed();
        }

        // Get public inputs from the HeaderStorage contract

        // uint256[] memory headerPublicInputs = HeaderStorageContract.getPublicInputs();
        // TODO: create publicInputs

        // [x] verify proposed btc payment proof
        bool verified = VerifierContract.verify(proof, publicInputs);

        if (verified) {
            // [x] mark swap order as completed
            swapReservation.completed = true;

            // [x] mark empty DepositVaults as completed
            for (uint i = 0; i < swapReservation.lpAddresses.length; i++) {
                // [x] retrieve deposit vault
                address lpAddress = swapReservation.lpAddresses[i];
                uint32 depositIndex = swapReservation.depositIds[i];
                DepositVault storage deposit = depositVaults[lpAddress][depositIndex];
                deposit.ethDepositAmount -= swapReservation.amountsToReserve[i];

                // [x] check if deposit is empty
                if (deposit.ethDepositAmount == 0) {
                    emptyVaultIDs[lpAddress].push(depositIndex);
                }
            }

            // Refund the proving cost + proving reward to the prover
            uint256 provingCostInWei = PROOF_GAS_COST * tx.gasprice;
            uint fees = provingCostInWei + proverGasReward;
            (bool success, ) = msg.sender.call{ value: fees }('');
            require(success, 'Prover reward payment failed');

            // Release the remaining funds to the ETH payout address
            (success, ) = ethPayoutAddress.call{ value: totalSwapAmount - fees }('');
            require(success, 'ETH payout failed');
        } else {
            revert('Proof verification failed');
        }
    }

    //--------- READ FUNCTIONS ---------//

    function getDepositVault(address lpAddress, uint256 index) public view returns (DepositVault memory) {
        return depositVaults[lpAddress][index];
    }

    function getDepositVaultsLength(address lpAddress) public view returns (uint256) {
        return depositVaults[lpAddress].length;
    }

    function getAmountReservedOnDeposit(address lpAddress, uint256 depositIndex) public view returns (uint256) {
        // [0] validate deposit index
        require(depositIndex < depositVaults[lpAddress].length, 'Invalid deposit index');

        // [1] retrieve deposit
        DepositVault storage deposit = depositVaults[lpAddress][depositIndex];
        uint256 totalReserved = 0;

        // [2] calculate total amount reserved
        for (uint256 i = 0; i < deposit.ethReservedAmounts.length; i++) {
            if (block.timestamp - deposit.reservationTimestamps[i] < RESERVATION_LOCKUP_PERIOD) {
                totalReserved += deposit.ethReservedAmounts[i];
            }
        }

        return totalReserved;
    }

    //--------- HELPER FUNCTIONS ---------//

    function getAvailableLiquidity(address lpAddress, uint depositIndex) public view returns (uint256) {
        // [0] retrieve specific liquidity deposit
        DepositVault storage deposit = depositVaults[lpAddress][depositIndex];

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
}
