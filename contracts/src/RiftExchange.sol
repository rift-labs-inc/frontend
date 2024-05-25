// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import { UltraVerifier as TransactionInclusionPlonkVerification } from './verifiers/TransactionInclusionPlonkVerification.sol';
import { HeaderStorage } from './HeaderStorage.sol';
import { console } from 'forge-std/console.sol';

error DepositTooLow();
error DepositTooHigh();
error DepositFailed();
error exchangeRateZero();
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
error InvalidEthereumAddress();
error InvalidBitcoinAddress();
error InvalidProof();

contract RiftExchange {
    uint64 public constant MIN_DEPOSIT = 0.05 ether;
    uint256 public constant MAX_DEPOSIT = 200_000 ether;
    uint64 public constant RESERVATION_LOCKUP_PERIOD = 6 hours;
    uint16 public constant MAX_DEPOSIT_OUTPUTS = 50;
    uint256 public constant PROOF_GAS_COST = 420_000;
    uint256 public constant MIN_ORDER_GAS_MULTIPLIER = 2;

    // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 - testing header storage contract address
    // 0x007ab3f410ceba1a111b100de2f76a8154b80126cda3f8cab47728d2f8cd0d6d - testing btc payout address

    uint8 public protocolFee = 100; // 100 bp = 1%
    uint8 public treasuryFee = 0;
    uint256 public proverGasReward = 0.002 ether;

    struct LPBalanceChange {
        uint32 vaultID;
        uint64 value;
    }

    struct DepositVault {
        uint256 ethDepositAmount;
        uint256 btcExchangeRate; // amount of btc per 1 eth, in sato
        string btcPayoutAddress;
        uint256[] ethReservedAmounts;
        uint256[] reservationTimestamps;
        bytes32 depositStateHash; // keccak256 of all deposit state variables
    }

    struct SwapReservation {
        address[] lpAddresses;
        uint32[] vaultIDs;
        uint256[] amountsToReserve;
        address ethPayoutAddress;
        string btcSenderAddress;
        uint256 reservationTimestamp;
        bytes32 nonce; // sent in bitcoin tx calldata from buyer -> lps to prevent replay attacks
        bytes32 combinedDepositsStateHash; // keccak256 of all deposit state hashes in the swap
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

        // [1] validate btcPayoutAddress && btcExchangeRate
        validateBtcAddress(btcPayoutAddress);
        if (btcExchangeRate == 0) {
            revert exchangeRateZero();
        }

        // [2] add new liquidity deposit
        uint32[] storage overwriteableIndexes = emptyVaultIDs[msg.sender];

        // overwrite an empty deposit slot if one exists
        if (overwriteableIndexes.length > 0) {
            // overwrite last available slot
            uint32 reuseIndex = overwriteableIndexes[overwriteableIndexes.length - 1];
            DepositVault storage oldDeposit = depositVaults[msg.sender][reuseIndex];

            // update old deposit slot
            oldDeposit.ethDepositAmount = uint64(depositAmount);
            oldDeposit.btcExchangeRate = btcExchangeRate;
            oldDeposit.btcPayoutAddress = btcPayoutAddress;

            //serialize ethReservedAmounts and reservationTimestamps

            uint256[] memory ethReservedAmounts = new uint256[](oldDeposit.ethReservedAmounts.length);
            uint256[] memory reservationTimestamps = new uint256[](oldDeposit.reservationTimestamps.length);

            for (uint i = 0; i < oldDeposit.ethReservedAmounts.length; i++) {
                ethReservedAmounts[i] = oldDeposit.ethReservedAmounts[i];
                reservationTimestamps[i] = oldDeposit.reservationTimestamps[i];
            }

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
                    btcExchangeRate: btcExchangeRate,
                    btcPayoutAddress: btcPayoutAddress,
                    ethReservedAmounts: new uint256[](0),
                    reservationTimestamps: new uint256[](0),
                    depositStateHash: keccak256(abi.encode(btcPayoutAddress, depositAmount, btcExchangeRate, new uint256[](0), new uint256[](0)))
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
        uint256 ethAvailableAmount = getAvailableLiquidityInVault(msg.sender, depositVaultIndex);
        require(ethAvailableAmount > 0, 'No unreserved ETH available to update');

        // If there are no reservations for this vault, simply update the exchange rate
        if (deposit.ethReservedAmounts.length == 0) {
            deposit.btcExchangeRate = newBtcExchangeRate;
            deposit.depositStateHash = keccak256(
                abi.encode(
                    deposit.ethDepositAmount,
                    newBtcExchangeRate,
                    deposit.btcPayoutAddress,
                    deposit.ethReservedAmounts,
                    deposit.reservationTimestamps
                )
            );
        } else {
            // Create a new deposit for the unreserved amount with the new exchange rate
            deposit.ethDepositAmount -= ethAvailableAmount;
            DepositVault memory newDeposit = DepositVault({
                ethDepositAmount: ethAvailableAmount,
                btcExchangeRate: newBtcExchangeRate,
                btcPayoutAddress: deposit.btcPayoutAddress,
                ethReservedAmounts: new uint256[](0),
                reservationTimestamps: new uint256[](0),
                depositStateHash: keccak256(
                    abi.encode(ethAvailableAmount, newBtcExchangeRate, deposit.btcPayoutAddress, new uint256[](0), new uint256[](0))
                )
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
        uint256 availableLiquidity = getAvailableLiquidityInVault(msg.sender, depositVaultIndex);
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
        uint32[] memory lpVaultIDs,
        uint256[] memory amountsToReserve,
        address ethPayoutAddress,
        string memory btcSenderAddress
    ) public payable {
        // validate btcSenderAddress and ethPayoutAddress
        validateBtcAddress(btcSenderAddress);

        // calculate total amount of ETH the user is attempting to reserve
        uint256 totalSwapAmount = 0;
        for (uint i = 0; i < amountsToReserve.length; i++) {
            totalSwapAmount += amountsToReserve[i];
        }

        // verify reservation amount is greater than minimum swap size
        // TODO: use max gas rather than tx.gasprice (avoid prover manipulation)
        if (totalSwapAmount < ((PROOF_GAS_COST * tx.gasprice) * MIN_ORDER_GAS_MULTIPLIER) + proverGasReward) {
            revert ReservationAmountTooLow();
        }

        // TODO: send back the excess amount to the user

        // array to hold the deposit state hashes
        bytes32[] memory combinedDepositsStateHash = new bytes32[](lpAddressesToReserve.length);

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
                DepositVault storage deposit = depositVaults[lpAddressesToReserve[i]][lpVaultIDs[i]];

                // add deposit state hash to combinedDepositsStateHash
                combinedDepositsStateHash[i] = deposit.depositStateHash;

                // calculate amount available in deposit
                uint256 ethAvailableToReserve = getAvailableLiquidityInVault(lpAddressesToReserve[i], lpVaultIDs[i]);

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
            swapReservation.vaultIDs = lpVaultIDs;
            swapReservation.amountsToReserve = amountsToReserve;
            swapReservation.ethPayoutAddress = ethPayoutAddress;
            swapReservation.btcSenderAddress = btcSenderAddress;
            swapReservation.reservationTimestamp = block.timestamp;
            swapReservation.nonce = keccak256(abi.encode(ethPayoutAddress, btcSenderAddress, block.timestamp, block.chainid, completedSwaps.length));
            swapReservation.combinedDepositsStateHash = keccak256(abi.encode(combinedDepositsStateHash));
            swapReservation.completed = false;

            // mark swap order as active by removing it from completed swaps
            completedSwaps.pop();
        }
        // if there are no completed swaps to overwrite, loop through swap reservations to find expired slots
        else {
            bool reservationOverwritten = false;
            for (uint i = 0; i < swapReservations[ethPayoutAddress].length; i++) {
                if (
                    // check if reservation has expired
                    block.timestamp - swapReservations[ethPayoutAddress][i].reservationTimestamp > RESERVATION_LOCKUP_PERIOD
                ) {
                    // overwrite expired reservation
                    swapReservations[ethPayoutAddress][i] = SwapReservation({
                        lpAddresses: lpAddressesToReserve,
                        vaultIDs: lpVaultIDs,
                        amountsToReserve: amountsToReserve,
                        ethPayoutAddress: ethPayoutAddress,
                        btcSenderAddress: btcSenderAddress,
                        reservationTimestamp: block.timestamp,
                        nonce: keccak256(abi.encode(ethPayoutAddress, btcSenderAddress, block.timestamp, block.chainid, completedSwaps.length)),
                        combinedDepositsStateHash: keccak256(abi.encode(combinedDepositsStateHash)),
                        completed: false
                    });
                    reservationOverwritten = true;
                    break;
                }
            }

            // push new reservation if no expired slots are available to overwrite
            if (!reservationOverwritten) {
                swapReservations[ethPayoutAddress].push(
                    SwapReservation({
                        lpAddresses: lpAddressesToReserve,
                        vaultIDs: lpVaultIDs,
                        amountsToReserve: amountsToReserve,
                        ethPayoutAddress: ethPayoutAddress,
                        btcSenderAddress: btcSenderAddress,
                        reservationTimestamp: block.timestamp,
                        nonce: keccak256(abi.encode(ethPayoutAddress, btcSenderAddress, block.timestamp, block.chainid, completedSwaps.length)),
                        combinedDepositsStateHash: keccak256(abi.encode(combinedDepositsStateHash)),
                        completed: false
                    })
                );
            }
        }
    }

    function unlockLiquidity(address ethPayoutAddress, uint256 swapReservationIndex, bytes memory proof, bytes32 publicInputsHash) public {
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

        // TODO: create publicInputs
        // Get public inputs from the HeaderStorage contract
        // uint256[] memory headerPublicInputs = HeaderStorageContract.getPublicInputs();

        // [x] verify proposed btc payment proof
        bytes32[] memory publicInputsHashArray = new bytes32[](1);
        publicInputsHashArray[0] = publicInputsHash;
        bool verified = VerifierContract.verify(proof, publicInputsHashArray);

        if (!verified) {
            revert InvalidProof();
        } else {
            // [x] mark swap order as completed
            swapReservation.completed = true;

            // [x] mark empty DepositVaults as completed
            for (uint i = 0; i < swapReservation.lpAddresses.length; i++) {
                // [x] retrieve deposit vault
                address lpAddress = swapReservation.lpAddresses[i];
                uint32 vaultID = swapReservation.vaultIDs[i];
                DepositVault storage deposit = depositVaults[lpAddress][vaultID];
                deposit.ethDepositAmount -= swapReservation.amountsToReserve[i];

                // [x] check if deposit is empty
                if (deposit.ethDepositAmount == 0) {
                    emptyVaultIDs[lpAddress].push(vaultID);
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
        }
    }

    //--------- READ FUNCTIONS ---------//

    function getDepositVault(address lpAddress, uint256 index) public view returns (DepositVault memory) {
        return depositVaults[lpAddress][index];
    }

    function getDepositVaultsLength(address lpAddress) public view returns (uint256) {
        return depositVaults[lpAddress].length;
    }

    function getAmountReservedInVault(address lpAddress, uint256 vaultID) public view returns (uint256) {
        // [0] validate deposit index
        require(vaultID < depositVaults[lpAddress].length, 'Invalid deposit index');

        // [1] retrieve deposit
        DepositVault storage vault = depositVaults[lpAddress][vaultID];
        uint256 totalReserved = 0;

        // [2] calculate total amount reserved
        for (uint256 i = 0; i < vault.ethReservedAmounts.length; i++) {
            if (block.timestamp - vault.reservationTimestamps[i] < RESERVATION_LOCKUP_PERIOD) {
                totalReserved += vault.ethReservedAmounts[i];
            }
        }

        return totalReserved;
    }

    function getAvailableLiquidityInVault(address lpAddress, uint vaultID) public view returns (uint256) {
        DepositVault storage vault = depositVaults[lpAddress][vaultID];
        return vault.ethDepositAmount - getAmountReservedInVault(lpAddress, vaultID);
    }

    function getReservation(address ethPayoutAddress, uint256 index) public view returns (SwapReservation memory) {
        return swapReservations[ethPayoutAddress][index];
    }

    function getReservationLength(address ethPayoutAddress) public view returns (uint256) {
        return swapReservations[ethPayoutAddress].length;
    }

    //--------- HELPER FUNCTIONS ---------//

    function validateBtcAddress(string memory btcAddress) public pure {
        bytes memory addressBytes = bytes(btcAddress);
        // revert if the address does not start with 'bc1q' or is not exactly 42 characters long
        bool correctPrefix = (addressBytes.length > 3 &&
            addressBytes[0] == 'b' &&
            addressBytes[1] == 'c' &&
            addressBytes[2] == '1' &&
            addressBytes[3] == 'q');
        if (addressBytes.length != 42 || !correctPrefix) {
            revert InvalidBitcoinAddress();
        }
    }
}
