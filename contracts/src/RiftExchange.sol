// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.2;

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
    uint64 public constant MIN_DEPOSIT = 0.05 ether;
    uint256 public constant MAX_DEPOSIT = 200_000 ether; // TODO: find out what the real max deposit is
    uint64 public constant RESERVATION_LOCKUP_PERIOD = 6 hours; // TODO: get longest 6 block confirmation time
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
        uint32 vaultIndex;
        uint64 value;
    }

    struct LiquidityProvider {
        uint256[] depositVaultIndexes;
        bytes32[] btcPayoutAddresses; // TODO: change to locking script
    }

    struct DepositVault {
        // true balance = unreservedBalance + expired, !completed SwapReservations
        uint184 initialBalance;
        int184 unreservedBalance;
        uint64 btcExchangeRate; // amount of btc per 1 eth, in sats
        uint8 btcPayoutAddressIndex;
        uint256[] reservationIndexes;
    }

    struct SwapReservation {
        bool completed;
        address ethPayoutAddress;
        string btcSenderAddress;
        uint256 reservationTimestamp;
        bytes32 nonce; // sent in bitcoin tx calldata from buyer -> lps to prevent replay attacks
        bytes32 reservationStateHash; // keccak256 of all deposit state hashes in the swap
        address[] lpAddresses;
        uint32[] vaultIndexes;
        uint256[] amountsToReserve;
    }

    // Liquidity Providers
    mapping(address => LiquidityProvider) public liquidityProviders; // lpAddress => LiquidityProvider

    // Swap Reservations
    SwapReservation[] public swapReservations;
    DepositVault[] public depositVaults;

    TransactionInclusionPlonkVerification public immutable VerifierContract;
    HeaderStorage public immutable HeaderStorageContract;
    address payable protocolAddress = payable(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);

    //--------- CONSTRUCTOR ---------//

    constructor(address headerStorageContractAddress) {
        VerifierContract = new TransactionInclusionPlonkVerification();
        HeaderStorageContract = HeaderStorage(headerStorageContractAddress);
    }

    //--------- WRITE FUNCTIONS ---------//
    // TODO: merge liquidity into existing vault if it has the same exchange rate
    function depositLiquidity(
        string memory btcPayoutAddress,
        uint64 btcExchangeRate,
        int256 vaultIndexToOverwrite,
        uint256[] vaultIndexesWithSameExchangeRate
    ) public payable {
        // [0] validate deposit amount
        uint256 depositAmount = msg.value;
        if (depositAmount <= MIN_DEPOSIT) {
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
                btcPayoutAddresses: btcPayoutAddress
            });
        }

        // [4] merge liquidity into vaults with the same exchange rate
        if (vaultIndexesWithSameExchangeRate.length > 0) {
            for (uint i = 0; i < vaultIndexesWithSameExchangeRate.length; i++) {
                uint256 vaultIndex = vaultIndexesWithSameExchangeRate[i];
                DepositVault storage vault = depositVaults[msg.sender][vaultIndex];
                if (vault.btcExchangeRate == btcExchangeRate && vault.btcPayoutAddress == btcPayoutAddress) {
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
            emptyVault.unreservedBalance = uint256(depositAmount);
            emptyVault.btcExchangeRate = btcExchangeRate;
            emptyVault.btcPayoutAddressIndex = liquidityProviders[msg.sender].btcPayoutAddresses.length - 1;
            emptyVault.reservationIndexes = new uint256[](0);
        }
        // [6] otherwise, create a new deposit vault if none are empty
        else {
            depositVaults[msg.sender].push(
                DepositVault({
                    unreservedBalance: uint256(depositAmount),
                    btcExchangeRate: btcExchangeRate,
                    btcPayoutAddressIndex: liquidityProviders[msg.sender].btcPayoutAddresses.length - 1,
                    reservationIndexes: new uint256[](0)
                })
            );
        }

        // [7] add deposit vault index to liquidity provider
        liquidityProviders[msg.sender].depositVaultIndexes.push(depositVaults[msg.sender].length - 1);
    }

    function updateVaultExchangeRate(uint256 vaultIndex, uint256 newBtcExchangeRate, uint256[] expiredReservationIndexes) public {
        // [0] validate new exchange rate
        if (newBtcExchangeRate == 0) {
            revert InvalidVaultUpdate();
        }

        // [1] retrieve deposit vault
        DepositVault storage vault = depositVaults[msg.sender][vaultIndex];

        // [3] ensure no reservations are active by checking if actual available balance is equal to initial balance
        if (getAvailableBalance(vault, expiredReservationIndexes) != vault.initialBalance) {
            revert InvalidUpdateWithActiveReservations();
        }

        // [4] update exchange rate
        vault.btcExchangeRate = newBtcExchangeRate;
    }

    function withdrawLiquidity(uint256 vaultIndex, uint256 amountToWithdraw, uint256[] expiredReservationIndexes) public {
        // [0] validate vault index
        if (vaultIndex >= depositVaults[msg.sender].length) {
            revert InvalidvaultIndex();
        }

        // [1] retrieve the vault
        DepositVault storage vault = depositVaults[msg.sender][vaultIndex];

        // [2] validate amount to withdraw
        if (amountToWithdraw == 0 || amountToWithdraw > getAvailableBalance(vault, expiredReservationIndexes)) {
            revert WithdrawalAmountError();
        }

        // [3] withdraw funds
        vault.unreservedBalance -= amountToWithdraw;
        (bool success, ) = payable(msg.sender).call{ value: amountToWithdraw }('');
        require(success, 'Failed to transfer ETH');
    }

    function reserveLiquidity(
        address[] memory lpAddressesToReserve,
        uint32[] memory lpvaultIndexesToReserve,
        uint256[] memory amountsToReserve,
        address ethPayoutAddress,
        string memory btcSenderAddress,
        int256 vaultIndexToOverwrite
    ) public payable {
        // [1] calculate total amount of ETH the user is attempting to reserve
        uint256 totalSwapAmount = 0;
        for (uint i = 0; i < amountsToReserve.length; i++) {
            totalSwapAmount += amountsToReserve[i];
        }

        // [3] verify reservation amount is greater than minimum swap size
        // TODO: use base fee instead of gas price
        // todo: get historical priority fee
        if (totalSwapAmount < ((PROOF_GAS_COST * tx.gasprice) * MIN_ORDER_GAS_MULTIPLIER) + proverGasReward) {
            revert ReservationAmountTooLow();
        }

        // [4] transfer protocol fee to protocol address
        uint protocol_fee_in_eth = (totalSwapAmount * (protocolFee / 10_000));
        (bool success, ) = protocolAddress.call{ value: protocol_fee_in_eth }('');
        if (!success) {
            revert ReservationFeeTooLow();
        }

        // [5] refund user if overpaid
        if (msg.value - protocol_fee_in_eth > 0) {
            (bool refundSuccess, ) = msg.sender.call{ value: msg.value - protocol_fee_in_eth }('');
            if (!refundSuccess) {
                revert DepositFailed();
            }
        }

        // add reservations to deposit vaults
        for (uint i = 0; i < lpvaultIndexesToReserve.length; i++) {
            // retrieve deposit vault
            address lpAddress = lpAddressesToReserve[i];
            uint32 vaultIndex = lpvaultIndexesToReserve[i];
            uint256 amountToReserve = amountsToReserve[i];
            DepositVault storage vault = depositVaults[lpAddress][vaultIndex];

            // ensure there is enough liquidity in this vault to reserve
            uint256 ethAvailableToReserve = getAmountAvailableInVault(lpAddress, vaultIndex);
            if (amountToReserve > ethAvailableToReserve) {
                revert NotEnoughLiquidity();
            }

            // check for expired reservations to overwrite
            bool expiredReservationFound = false;
            uint256 vaultReservationsCount = vault.reservationTimestamps.length;

            // if there are more than SAMPLING_SIZE reservations, sample for expired reservations
            if (SAMPLING_SIZE < vaultReservationsCount) {
                for (uint j = 0; j < SAMPLING_SIZE; j++) {
                    uint256 randomIndex = sampleRandomIndex(vaultReservationsCount, j);
                    // if reservation is expired, overwrite it
                    if (block.timestamp - vault.reservationTimestamps[randomIndex] > RESERVATION_LOCKUP_PERIOD) {
                        vault.ethReservedAmounts[randomIndex] = amountToReserve;
                        vault.reservationTimestamps[randomIndex] = block.timestamp;
                        expiredReservationFound = true;
                        break;
                    }
                }
            }
            // if there are less than SAMPLING_SIZE reservations, check all for expiration
            else {
                for (uint j = 0; j < vaultReservationsCount; j++) {
                    if (block.timestamp - vault.reservationTimestamps[uint256(j)] > RESERVATION_LOCKUP_PERIOD) {
                        vault.ethReservedAmounts[j] = amountToReserve;
                        vault.reservationTimestamps[j] = block.timestamp;
                        expiredReservationFound = true;
                        break;
                    }
                }
            }

            // if no expired reservations, add a new reservation to the vault
            if (!expiredReservationFound) {
                vault.ethReservedAmounts.push(amountToReserve);
                vault.reservationTimestamps.push(block.timestamp);
            }

            // add deposit state hash to reservationStateHash
        }

        // create a new swap reservation
        if (vaultIndexToOverwrite == -1) {
            // if there are no completed swaps to overwrite push a new reservation
            bytes32 nonce = keccak256(abi.encode(ethPayoutAddress, btcSenderAddress, block.timestamp, block.chainid));
            swapReservations[ethPayoutAddress].push(
                SwapReservation({
                    lpAddresses: lpAddressesToReserve,
                    vaultIndexes: lpvaultIndexesToReserve,
                    amountsToReserve: amountsToReserve,
                    ethPayoutAddress: ethPayoutAddress,
                    btcSenderAddress: btcSenderAddress,
                    reservationTimestamp: block.timestamp,
                    nonce: nonce,
                    reservationStateHash: keccak256(
                        abi.encode(
                            lpAddressesToReserve,
                            lpvaultIndexesToReserve,
                            amountsToReserve,
                            ethPayoutAddress,
                            btcSenderAddress,
                            block.timestamp,
                            nonce
                        )
                    ),
                    completed: false
                })
            );

            // push new reservation if no expired swaps can be found
        } else {
            // retrieve swap order to overwrite
            SwapReservation storage swapReservation = swapReservations[ethPayoutAddress][uint256(vaultIndexToOverwrite)];

            // overwrite old swap order
            swapReservation.lpAddresses = lpAddressesToReserve;
            swapReservation.vaultIndexes = lpvaultIndexesToReserve;
            swapReservation.amountsToReserve = amountsToReserve;
            swapReservation.ethPayoutAddress = ethPayoutAddress;
            swapReservation.btcSenderAddress = btcSenderAddress;
            swapReservation.reservationTimestamp = block.timestamp;
            swapReservation.nonce = keccak256(abi.encode(ethPayoutAddress, btcSenderAddress, block.timestamp, block.chainid));
            swapReservation.reservationStateHash = keccak256(
                abi.encode(
                    swapReservation.lpAddresses,
                    swapReservation.vaultIndexes,
                    swapReservation.amountsToReserve,
                    swapReservation.reservationStateHash,
                    swapReservation.ethPayoutAddress,
                    swapReservation.btcSenderAddress,
                    swapReservation.reservationTimestamp,
                    swapReservation.nonce
                )
            );
            swapReservation.completed = false;
        }
    }

    function unlockLiquidity(
        address ethPayoutAddress,
        uint256 swapReservationIndex,
        bytes memory proof,
        bytes32 publicInputsHash
    ) public {
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
                uint32 vaultIndex = swapReservation.vaultIndexes[i];
                DepositVault storage deposit = depositVaults[lpAddress][vaultIndex];
                deposit.unreservedBalance -= swapReservation.amountsToReserve[i];
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

    function getReservation(address ethPayoutAddress, uint256 index) public view returns (SwapReservation memory) {
        return swapReservations[ethPayoutAddress][index];
    }

    function getReservationLength(address ethPayoutAddress) public view returns (uint256) {
        return swapReservations[ethPayoutAddress].length;
    }

    //--------- INTERNAL FUNCTIONS ---------//

    // unreserved balance + expired reservations
    function getAvailableBalance(
        DepositVault storage vault,
        uint256[] expiredReservationIndexes
    ) internal view returns (uint256) {
        uint256 availableBalance = vault.unreservedBalance;
        for (uint i = 0; i < expiredReservationIndexes.length; i++) {
            if (block.timestamp - vault.reservationTimestamps[expiredReservationIndexes[i]] < RESERVATION_LOCKUP_PERIOD) {
                revert ReservationNotExpired();
            }
            uint256 reservationAmount = vault.ethReservedAmounts[expiredReservationIndexes[i]];
            availableBalance += reservationAmount;
        }
        return availableBalance;
    }
}
