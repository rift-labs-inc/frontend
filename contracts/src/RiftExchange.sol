// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.2;

import { UltraVerifier as TransactionInclusionPlonkVerification } from './verifiers/TransactionInclusionPlonkVerification.sol';
import { BlockHeaderStorage } from './BlockHeaderStorage.sol';
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
error InvalidvaultIndex();
error WithdrawalAmountError();
error InvalidEthereumAddress();
error InvalidBitcoinAddress();
error InvalidProof();
error InvaidSameExchangeRatevaultIndex();
error InvalidVaultUpdate();
error ReservationNotExpired();
error InvalidUpdateWithActiveReservations();

contract RiftExchange {
    uint256 public constant MIN_DEPOSIT = 0.5 ether;
    uint256 public constant MAX_DEPOSIT = 200_000 ether; // TODO: find out what the real max deposit is
    uint256 public constant RESERVATION_LOCKUP_PERIOD = 6 hours; // TODO: get longest 6 block confirmation time
    uint16 public constant MAX_DEPOSIT_OUTPUTS = 50;
    uint256 public constant PROOF_GAS_COST = 420_000;
    uint256 public constant MIN_ORDER_GAS_MULTIPLIER = 2;
    uint8 public constant SAMPLING_SIZE = 10;

    // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 - testing header storage contract address
    // 0x007ab3f410ceba1a111b100de2f76a8154b80126cda3f8cab47728d2f8cd0d6d - testing btc payout address

    uint8 public protocolFee = 100; // 100 bp = 1%
    uint8 public treasuryFee = 0;
    uint256 public proverGasReward = 0.002 ether;

    struct LPunreservedBalanceChange {
        uint256 vaultIndex;
        uint256 value;
    }

    struct LiquidityProvider {
        uint256[] depositVaultIndexes;
        bytes32[] btcPayoutAddresses; // TODO: change to locking script
    }

    struct DepositVault {
        uint256 initialBalance;
        uint256 unreservedBalance; // true balance = unreservedBalance + sum(!completed && !dead && expired SwapReservations)
        uint256 btcExchangeRate; // amount of btc per 1 eth, in sats
        uint256 btcPayoutAddressIndex;
    }

    struct SwapReservation {
        bool isCompleted;
        bool isDead;
        address ethPayoutAddress;
        string btcSenderAddress;
        uint256 reservationTimestamp;
        bytes32 nonce; // sent in bitcoin tx calldata from buyer -> lps to prevent replay attacks
        bytes32 reservationStateHash; // keccak256 of all deposit state hashes in the swap
        uint256[] vaultIndexes;
        uint256[] amountsToReserve;
    }

    mapping(address => LiquidityProvider) liquidityProviders; // lpAddress => LiquidityProvider
    SwapReservation[] public swapReservations;
    DepositVault[] public depositVaults;

    TransactionInclusionPlonkVerification public immutable verifierContract;
    BlockHeaderStorage public immutable blockHeaderStorageContract;
    address payable protocolAddress = payable(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);

    //--------- CONSTRUCTOR ---------//

    constructor(address headerStorageContractAddress) {
        verifierContract = new TransactionInclusionPlonkVerification();
        blockHeaderStorageContract = BlockHeaderStorage(headerStorageContractAddress);
    }

    //--------- WRITE FUNCTIONS ---------//
    function depositLiquidity(
        bytes32 btcPayoutAddress,
        uint256 btcExchangeRate,
        int256 vaultIndexToOverwrite,
        uint256[] memory vaultIndexesWithSameExchangeRate
    ) public payable {
        // [0] validate deposit amount
        uint256 depositAmount = msg.value;
        if (depositAmount < MIN_DEPOSIT) {
            revert DepositTooLow();
        } else if (depositAmount >= MAX_DEPOSIT) {
            revert DepositTooHigh();
        }

        // [2] validate btc exchange rate
        if (btcExchangeRate == 0) {
            revert exchangeRateZero();
        }

        // [3] create new liquidity provider if it doesn't exist
        if (liquidityProviders[msg.sender].btcPayoutAddresses.length == 0) {
            liquidityProviders[msg.sender] = LiquidityProvider({
                depositVaultIndexes: new uint256[](0),
                btcPayoutAddresses: new bytes32[](0)
            });
            liquidityProviders[msg.sender].btcPayoutAddresses.push(btcPayoutAddress);
        }

        // [4] merge liquidity into vaults with the same exchange rate
        if (vaultIndexesWithSameExchangeRate.length > 0) {
            for (uint i = 0; i < vaultIndexesWithSameExchangeRate.length; i++) {
                uint256 vaultIndex = vaultIndexesWithSameExchangeRate[i];
                DepositVault storage vault = depositVaults[vaultIndex];
                LiquidityProvider storage lp = liquidityProviders[msg.sender];
                if (
                    vault.btcExchangeRate == btcExchangeRate &&
                    (lp.btcPayoutAddresses[vault.btcPayoutAddressIndex] == btcPayoutAddress)
                ) {
                    vault.unreservedBalance += depositAmount;
                } else {
                    revert InvaidSameExchangeRatevaultIndex();
                }
            }
        }
        // [5] overwrite empty deposit vault
        else if (vaultIndexToOverwrite != -1) {
            // [0] retrieve deposit vault to overwrite
            DepositVault storage emptyVault = depositVaults[uint256(vaultIndexToOverwrite)];

            // [1] validate vault is empty
            if (emptyVault.unreservedBalance != 0) {
                revert InvalidvaultIndex();
            }

            // [2] overwrite empty vault with new deposit
            emptyVault.initialBalance = depositAmount;
            emptyVault.unreservedBalance = depositAmount;
            emptyVault.btcExchangeRate = btcExchangeRate;
            emptyVault.btcPayoutAddressIndex = liquidityProviders[msg.sender].btcPayoutAddresses.length - 1;
        }
        // [6] otherwise, create a new deposit vault if none are empty
        else {
            depositVaults.push(
                DepositVault({
                    initialBalance: depositAmount,
                    unreservedBalance: depositAmount,
                    btcExchangeRate: btcExchangeRate,
                    btcPayoutAddressIndex: liquidityProviders[msg.sender].btcPayoutAddresses.length - 1
                })
            );
        }

        // [7] add deposit vault index to liquidity provider
        liquidityProviders[msg.sender].depositVaultIndexes.push(depositVaults.length - 1);
    }

    function updateExchangeRate(
        uint256 vaultIndex,
        uint256 newBtcExchangeRate,
        uint256[] memory expiredReservationIndexes
    ) public {
        // [0] validate new exchange rate
        if (newBtcExchangeRate == 0) {
            revert InvalidVaultUpdate();
        }

        // [1] retrieve deposit vault
        DepositVault storage vault = depositVaults[vaultIndex];

        // cleanup dead swap reservations
        cleanUpDeadSwapReservations(expiredReservationIndexes);

        // [3] ensure no reservations are active by checking if actual available balance is equal to initial balance
        if (vault.unreservedBalance != vault.initialBalance) {
            revert InvalidUpdateWithActiveReservations();
        }

        // [4] update exchange rate
        vault.btcExchangeRate = newBtcExchangeRate;
    }

    function withdrawLiquidity(uint256 vaultIndex, uint256 amountToWithdraw, uint256[] memory expiredReservationIndexes) public {
        // [0] validate vault index
        if (vaultIndex >= depositVaults.length) {
            revert InvalidvaultIndex();
        }

        // [1] retrieve the vault
        DepositVault storage vault = depositVaults[vaultIndex];

        // clean up dead swap reservations
        cleanUpDeadSwapReservations(expiredReservationIndexes);

        // [2] validate amount to withdraw
        if (amountToWithdraw == 0 || amountToWithdraw > vault.unreservedBalance) {
            revert WithdrawalAmountError();
        }

        // [3] withdraw funds
        vault.unreservedBalance -= amountToWithdraw;
        (bool success, ) = payable(msg.sender).call{ value: amountToWithdraw }('');
        require(success, 'Failed to transfer ETH');
    }

    function reserveLiquidity(
        uint256[] memory vaultIndexesToReserve,
        uint256[] memory amountsToReserve,
        address ethPayoutAddress,
        string memory btcSenderAddress,
        uint256[] memory expiredSwapReservationIndexes
    ) public payable {
        // [0] calculate total amount of ETH the user is attempting to reserve
        uint256 totalSwapAmount = 0;
        for (uint i = 0; i < amountsToReserve.length; i++) {
            totalSwapAmount += amountsToReserve[i];
        }

        // [1] verify reservation amount is greater than minimum swap size
        // todo: get historical priority fee and potentially add it
        if (totalSwapAmount < ((PROOF_GAS_COST * block.basefee) * MIN_ORDER_GAS_MULTIPLIER) + proverGasReward) {
            revert ReservationAmountTooLow();
        }

        // [2] transfer protocol fee to protocol address
        uint protocol_fee_in_eth = (totalSwapAmount * (protocolFee / 10_000));
        (bool success, ) = protocolAddress.call{ value: protocol_fee_in_eth }('');
        if (!success) {
            revert ReservationFeeTooLow();
        }

        // verify proposed expired swap reservation indexes
        verifyExpiredReservations(expiredSwapReservationIndexes);

        // clean up dead swap reservations
        cleanUpDeadSwapReservations(expiredSwapReservationIndexes);

        // [4] check if there is enough liquidity in each deposit vaults to reserve
        for (uint i = 0; i < vaultIndexesToReserve.length; i++) {
            // [0] retrieve deposit vault
            uint256 amountToReserve = amountsToReserve[i];
            DepositVault storage vault = depositVaults[vaultIndexesToReserve[i]];

            // [1] ensure there is enough liquidity in this vault to reserve
            if (amountToReserve > vault.unreservedBalance) {
                revert NotEnoughLiquidity();
            }
        }

        // [2] overwrite expired reservations if any slots are available
        if (expiredSwapReservationIndexes.length > 0) {
            // [1] retrieve expired reservation
            SwapReservation storage swapReservationToOverwrite = swapReservations[expiredSwapReservationIndexes[0]];

            // [2] overwrite expired reservation
            swapReservationToOverwrite.isCompleted = false;
            swapReservationToOverwrite.isDead = false;
            swapReservationToOverwrite.ethPayoutAddress = ethPayoutAddress;
            swapReservationToOverwrite.btcSenderAddress = btcSenderAddress;
            swapReservationToOverwrite.reservationTimestamp = block.timestamp;
            swapReservationToOverwrite.nonce = keccak256(
                abi.encode(ethPayoutAddress, btcSenderAddress, block.timestamp, block.chainid)
            );
            swapReservationToOverwrite.reservationStateHash = keccak256(
                abi.encode(
                    swapReservationToOverwrite.vaultIndexes,
                    swapReservationToOverwrite.amountsToReserve,
                    swapReservationToOverwrite.reservationStateHash,
                    swapReservationToOverwrite.ethPayoutAddress,
                    swapReservationToOverwrite.btcSenderAddress,
                    swapReservationToOverwrite.reservationTimestamp,
                    swapReservationToOverwrite.nonce
                )
            );
            swapReservationToOverwrite.vaultIndexes = vaultIndexesToReserve;
            swapReservationToOverwrite.amountsToReserve = amountsToReserve;
        }
        // otherwise push new reservation if no expired reservations slots are available
        else {
            swapReservations.push(
                SwapReservation({
                    isCompleted: false,
                    isDead: false,
                    ethPayoutAddress: ethPayoutAddress,
                    btcSenderAddress: btcSenderAddress,
                    reservationTimestamp: block.timestamp,
                    nonce: keccak256(abi.encode(ethPayoutAddress, btcSenderAddress, block.timestamp, block.chainid)),
                    reservationStateHash: keccak256(
                        abi.encode(
                            vaultIndexesToReserve,
                            amountsToReserve,
                            ethPayoutAddress,
                            btcSenderAddress,
                            block.timestamp,
                            keccak256(abi.encode(ethPayoutAddress, btcSenderAddress, block.timestamp, block.chainid))
                        )
                    ),
                    vaultIndexes: vaultIndexesToReserve,
                    amountsToReserve: amountsToReserve
                })
            );
        }

        // [5] refund user if overpaid
        if (msg.value - protocol_fee_in_eth > 0) {
            (bool refundSuccess, ) = msg.sender.call{ value: msg.value - protocol_fee_in_eth }('');
            if (!refundSuccess) {
                revert DepositFailed();
            }
        }
    }

    function unlockLiquidity(
        uint256 swapReservationIndex,
        bytes32 btcBlockHash,
        uint256 blockCheckpointHeight,
        bytes32 confirmationBlockHash, // 5 blocks ahead of blockCheckpointHeight + block delta
        uint256 blockHeightDelta,
        bytes memory proof
    ) public {
        // [0] retrieve swap order
        SwapReservation storage swapReservation = swapReservations[swapReservationIndex];

        // [2] calculate total swap amount
        uint256 totalSwapAmount = 0;
        for (uint256 i = 0; i < swapReservation.amountsToReserve.length; i++) {
            totalSwapAmount += swapReservation.amountsToReserve[i];
        }

        // TODO: create publicInputs

        // verify proof (will revert if invalid)
        // verifierContract.verify(proof, publicInputs, ...);

        // [x] mark swap order as completed
        swapReservation.isCompleted = true;

        // [x] subtract amounts from deposit vaults
        for (uint i = 0; i < swapReservations[swapReservationIndex].vaultIndexes.length; i++) {
            // [x] retrieve deposit vault
            DepositVault storage vault = depositVaults[swapReservation.vaultIndexes[i]];
            vault.unreservedBalance -= swapReservation.amountsToReserve[i];
        }

        // Refund the proving cost + proving reward to the prover
        uint256 provingCostInWei = PROOF_GAS_COST * block.basefee;
        uint fees = provingCostInWei + proverGasReward;
        (bool success, ) = msg.sender.call{ value: fees }('');
        if (!success) {
            revert WithdrawFailed();
        }

        // Release the remaining funds to the ETH payout address
        (success, ) = swapReservation.ethPayoutAddress.call{ value: totalSwapAmount - fees }('');
        require(success, 'ETH payout failed');
        if (!success) {
            revert WithdrawFailed();
        }
    }

    //--------- READ FUNCTIONS ---------//

    function getDepositVault(address lpAddress, uint256 index) public view returns (DepositVault memory) {
        return depositVaults[index];
    }

    function getDepositVaultsLength(address lpAddress) public view returns (uint256) {
        return depositVaults.length;
    }

    function getReservation(address ethPayoutAddress, uint256 index) public view returns (SwapReservation memory) {
        return swapReservations[index];
    }

    function getReservationLength(address ethPayoutAddress) public view returns (uint256) {
        return swapReservations.length;
    }

    //--------- INTERNAL FUNCTIONS ---------//

    // unreserved balance + expired reservations
    function cleanUpDeadSwapReservations(uint256[] memory expiredReservationIndexes) internal {
        for (uint i = 0; i < expiredReservationIndexes.length; i++) {
            verifyExpiredReservations(expiredReservationIndexes);
            console.log('expiredReservationIndexes[i]: ', expiredReservationIndexes[i]);

            SwapReservation storage expiredSwapReservation = swapReservations[expiredReservationIndexes[i]];

            expiredSwapReservation.isDead = true;

            // add expired reservation amounts to deposit vaults
            for (uint j = 0; j < expiredSwapReservation.vaultIndexes.length; j++) {
                DepositVault storage expiredVault = depositVaults[expiredSwapReservation.vaultIndexes[j]];
                expiredVault.unreservedBalance += expiredSwapReservation.amountsToReserve[j];
            }
        }
    }

    function verifyExpiredReservations(uint256[] memory expiredReservationIndexes) internal view {
        for (uint i = 0; i < expiredReservationIndexes.length; i++) {
            if (
                block.timestamp - swapReservations[expiredReservationIndexes[i]].reservationTimestamp < RESERVATION_LOCKUP_PERIOD
            ) {
                revert ReservationNotExpired();
            }
        }
    }

    // --------- TESTING FUNCTIONS (DELETE) --------- //

    function emptyDepositVault(uint256 vaultIndex) public {
        DepositVault storage vault = depositVaults[vaultIndex];
        vault.initialBalance = 0;
        vault.unreservedBalance = 0;
        vault.btcExchangeRate = 0;
        vault.btcPayoutAddressIndex = 0;
    }
}
