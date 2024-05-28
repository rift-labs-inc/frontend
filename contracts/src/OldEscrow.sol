// // SPDX-License-Identifier: Unlicensed
// pragma solidity ^0.8.25;
// import { UltraVerifier as TransactionInclusionPlonkVerification } from './verifiers/TransactionInclusionPlonkVerification.sol';
// import { HeaderStorage } from './HeaderStorage.sol';
// import { ERC20 } from 'token-types/ERC20.sol';

// error DepositTooLow();
// error DepositFailed();
// error WithdrawFailed();
// error LpDoesntExist();
// error TooManyLps();
// error NotEnoughLiquidity();
// error InvalidOrder();
// error NotEnoughLiquidityConsumed();
// error LiquidityReserved();
// error LiquidityNotReserved();
// error InvalidLpIndex();
// error NoLiquidityToReserve();
// error OrderComplete();

// contract Escrow {
//     // TODO: Make this non-constant, recalculable targeting ~150 USD
//     uint64 public constant MIN_DEPOSIT = 0.002 * 10 ** 8; // Min deposit: 0.002 BTC
//     uint64 public constant RESERVATION_LOCKUP = 12 hours; // Lockup period: 12 hours
//     uint16 public constant MAX_LIQUIDITY_PROVIDERS_PER_SWAP = 50; // Max output: 50 LPs

//     struct LiquidityProvider {
//         // Slot #1
//         // (-100%, 1000%)
//         int16 lpFee; // 2 bytes
//         uint64 amountDeposited; // 8 bytes
//         // index into order array, offset by +1 b/c 0 is a sentinel value for unused
//         uint176 lastReservationPointer; // 22 bytes, maximizes the amount of space left in this slot
//         // Slot #2+
//         // len is always <= 25
//         bytes32 payoutBTCAddress;
//         // This is a hash of an LP's current state aka a hash of all the above fields (besides reservation pointer)
//         // this is beneficial because we can just cleanly load this single variable from storage instead of
//         // loading an lp's entire state and then hashing it
//         bytes32 stateRoot;
//     }

//     struct Order {
//         // max length == MAX_LIQUIDITY_PROVIDERS_PER_SWAP
//         // TODO: Ensure solidity is packing at least  8 of these per slot
//         uint32[] lpIndexes;
//         // user's evm address
//         address payoutAddress;
//         // TODO: Would it be better to encode this as a bytes32?, len is always <= 25
//         string senderBtcAddress;
//         uint256 reservationTimestamp;
//         bytes32 nonce;
//         bytes32 lpHash;
//         bool complete;
//     }

//     struct LPBalanceChange {
//         uint32 lpIndex;
//         uint64 value;
//     }

//     ERC20 public immutable wrapped_bitcoin;
//     TransactionInclusionPlonkVerification public immutable verifier;
//     HeaderStorage public immutable header_storage;

//     uint32 totalLpCount;
//     // TODO: if we could somehow pack more than 1 LP bal into a single slot that would make
//     // unlocking liquidity much cheaper gas wise
//     mapping(uint32 => LiquidityProvider) public lps;
//     mapping(address => uint32) public lpIndex;
//     // note that the max amount of swap orders is 2**176
//     Order[] public swapOrders;

//     constructor(address _wrapped_bitcoin, address _header_storage) {
//         verifier = new TransactionInclusionPlonkVerification();
//         wrapped_bitcoin = ERC20.wrap(_wrapped_bitcoin);
//         header_storage = HeaderStorage(_header_storage);
//     }

//     //TODO: Ensure this uses 1 sload
//     function getLiquidity(uint32 _lpIndex) internal returns (int16 _lpFee, uint64 _amountDeposited, uint176 _lastReservationPointer) {
//         _lpFee = lps[_lpIndex].lpFee;
//         _amountDeposited = lps[_lpIndex].amountDeposited;
//         _lastReservationPointer = lps[_lpIndex].lastReservationPointer;
//     }

//     function validateLiquidityFree(uint176 _lastReservationPointer) internal {
//         // lp exists and has been used before
//         if (_lastReservationPointer != 0) {
//             uint unlock_timestamp = swapOrders[_lastReservationPointer - 1].reservationTimestamp + RESERVATION_LOCKUP;

//             // we could potentially allow depositing more liquidity if we modify the way
//             // we handle order hashes, at the moment protocol expects liquidity to be fixed for lifetime of order
//             if (block.timestamp <= unlock_timestamp) {
//                 revert LiquidityReserved();
//             }
//         }
//     }

//     /*
//     function computeLPStateRoot(bytes lpHash) internal pure returns (bytes32) {
//         return
//             keccak256(
//                 abi.encode(lp.lpFee, lp.amountDeposited, lp.payoutBTCAddress)
//             );
//     }
//     */

//     function depositLiquidity(bytes32 payoutBTCAddress, uint64 depositAmount, int16 lpFee) public {
//         if (depositAmount < MIN_DEPOSIT) {
//             revert DepositTooLow();
//         }

//         uint32 _lpIndex = lpIndex[msg.sender];
//         if (_lpIndex != 0) {
//             (, uint64 amountDeposited, uint176 lastReservationPointer) = getLiquidity(_lpIndex);
//             validateLiquidityFree(lastReservationPointer);

//             // happy path add monee + update _lpFee
//             // TODO: Is it possible to set both of these values in a single SSTORE?
//             lps[_lpIndex].amountDeposited = depositAmount + amountDeposited;
//             lps[_lpIndex].lpFee = lpFee;
//             lps[_lpIndex].stateRoot = keccak256(abi.encode(payoutBTCAddress, depositAmount + amountDeposited, lpFee));
//         } else {
//             uint32 _totalLpCount = totalLpCount;
//             totalLpCount = _totalLpCount + 1;
//             lpIndex[msg.sender] = _totalLpCount;
//             lps[_totalLpCount] = LiquidityProvider({
//                 amountDeposited: depositAmount,
//                 lpFee: lpFee,
//                 lastReservationPointer: 0,
//                 payoutBTCAddress: payoutBTCAddress,
//                 stateRoot: keccak256(abi.encode(payoutBTCAddress, depositAmount, lpFee))
//             });
//         }
//         wrapped_bitcoin.transferFrom(msg.sender, address(this), uint256(depositAmount));
//     }

//     function withdrawLiquidity(uint64 amount) public {
//         uint32 _lpIndex = lpIndex[msg.sender];
//         if (_lpIndex == 0) {
//             revert LpDoesntExist();
//         }

//         (, uint64 amountDeposited, uint176 lastReservationPointer) = getLiquidity(_lpIndex);

//         if (amountDeposited < amount) {
//             revert NotEnoughLiquidity();
//         }

//         validateLiquidityFree(lastReservationPointer);

//         lps[_lpIndex].amountDeposited -= amount;

//         wrapped_bitcoin.transfer(msg.sender, uint256(amount));
//     }

//     function reserveLiquidity(uint32[] memory _lpIndexes, address _payoutAddress, string memory _senderBTCAddress) public {
//         if (_lpIndexes.length > MAX_LIQUIDITY_PROVIDERS_PER_SWAP) {
//             revert TooManyLps();
//         }
//         bytes32 lpHash;
//         for (uint16 i = 0; i < _lpIndexes.length; i++) {
//             if (_lpIndexes[i] > totalLpCount) {
//                 revert InvalidLpIndex();
//             }

//             //TODO: this should strictly use two SLOADS'
//             LiquidityProvider memory lp = lps[_lpIndexes[i]];

//             if (lp.amountDeposited == 0) {
//                 revert NoLiquidityToReserve();
//             }

//             uint unlock_timestamp = lp.lastReservationTimestamp + RESERVATION_LOCKUP;

//             if (block.timestamp <= unlock_timestamp) {
//                 revert LiquidityReserved(unlock_timestamp);
//             }

//             lpHash = keccak256(abi.encode(lpHash, lp.lpFee, lp.amountDeposited, lp.payoutBTCAddress));

//             lps[_lpIndexes[i]].lastReservationTimestamp = block.timestamp;
//         }

//         Order memory newOrder = Order({
//             lpIndexes: _lpIndexes,
//             payoutAddress: _payoutAddress,
//             senderBtcAddress: _senderBTCAddress,
//             reservationTimestamp: block.timestamp,
//             // Doesn't need to be truly random,
//             // just enough so that the chance the hash has been
//             // put in an inscription is effectively 0.
//             // may be overkill
//             nonce: keccak256(abi.encode(_payoutAddress, _senderBTCAddress, block.timestamp, block.chainid, swapOrders.length)),
//             lpHash: lpHash,
//             complete: false
//         });

//         swapOrders.push(newOrder);
//     }

//     // // This needs to be in noir (╯°□°)╯︵ ┻━┻
//     // /*
//     // function validateLpUtxos(Order memory swap_order, LpUtxo[] memory lp_payments) public view returns (bytes32) {
//     // 	uint64 sats_output;
//     // 	for (uint i = 0; i < lp_payments.length; i++){
//     //         if(swap_order.lpIndexes[i] != lp_payments[i].lpIndex) {
//     //             revert InvalidOrder();
//     //         }
//     //         if(lp_payments[i].value == 0){
//     //             revert InvalidOrder();
//     //         }

//     //         LiquidityProvider storage _lp = lps[lp_payments[i].lpIndex];

//     //         // Calculate the fee
//     //         uint64 fee = uint64(uint16(_lp.lpFee) * lp_payments[i].value / 1000000);  // Assumes lpFee is in basis points
//     //         if (fee > lp_payments[i].value) {
//     //             revert InvalidOrder(); // Guard against fee being more than the sent value
//     //         }

//     //         // Subtract fee from the transaction value
//     //         uint64 netValue = lp_payments[i].value - fee;

//     //         // Update total fees and values
//     //         totalFee += fee;
//     //         totalValue += netValue;

//     //         // Update the liquidity provider's deposited amount
//     //         _lp.amountDeposited += netValue;  // Assuming you want to add the net value

//     //         // Potentially other state updates
//     //     }	}
//     //     */
//     // function proposeTransactionProof(
//     //     uint256 orderId,
//     //     uint256 TXNBlockHeight,
//     //     LPBalanceChange[] memory updatedBalances,
//     //     uint256 swapOutput,
//     //     bytes calldata paymentProof
//     // ) public {
//     //     Order memory swap_order = swapOrders[orderId];
//     //     // lp_payments should be the same length as the swap_order
//     //     if (swap_order.lpIndexes.length != updated_balances.length) {
//     //         revert NotEnoughLiquidityConsumed();
//     //     }
//     //     if (swap_order.complete) {
//     //         revert OrderComplete();
//     //     }
//     //     if (
//     //         swap_order.reservationTimestamp + RESERVATION_LOCKUP >
//     //         block.timestamp
//     //     ) {
//     //         revert LiquidityNotReserved();
//     //     }
//     //     bytes32 merkle_root = header_storage.getMerkleRootSafe(
//     //         payment_btc_block_height
//     //     );

//     //     swap_order.complete = true;
//     //     for (uint16 i = 0; i < updated_balances.length; i++) {
//     //         lps[updated_balances[i].lpIndex].amountDeposited = updated_balances[
//     //             i
//     //         ].value;

//     //         lps[updated_balances[i].lpIndex].l = updated_balances[i].value;
//     //     }

//     //     //TODO: CHECK PROOF HERE pub input:
//     //     // 1. lpHash of order
//     //     // 2. order nonce
//     //     // 3. updated_lp_balances hash
//     //     // 4. output amt
//     //     // 5. merkle_root
//     //     verifier.verify(
//     //         paymentProof,

//     //     );
//     //     wrapped_bitcoin.transfer(msg.sender, uint256(output));
//     // }
// }
