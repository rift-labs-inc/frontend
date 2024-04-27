// SPDX-License-Identifier: Unlicensed
pragma solidity =0.8.25;
import {UltraVerifier as TransactionInclusionPlonkVerification} from "./verifiers/TransactionInclusionPlonkVerification.sol";
import {HeaderStorage} from "./HeaderStorage.sol";
import {ERC20} from "token-types/ERC20.sol";

contract Swap {
    error DepositTooLow();
    error DepositFailed();
    error WithdrawFailed();
    error LpDoesntExist();
    error TooManyLps();
    error NotEnoughLiquidity();
    error InvalidOrder();
    error NotEnoughLiquidityConsumed();
    error LiquidityReserved(uint until);
    error LiquidityNotReserved();
    error InvalidLpIndex();
    error NoLiquidityToReserve();
    error OrderComplete();

    // TODO: Make this non-constant, recalculable targeting ~150 USD
    uint64 public constant MIN_DEPOSIT = 0.002 * 10 ** 8;
    uint64 public constant RESERVATION_LOCKUP = 12 hours;
    uint16 public constant MAX_LIQUIDITY_PROVIDERS_PER_SWAP = 50;

    struct LiquidityProvider {
        uint64 amountDeposited;
        // (-10000, 10000) basis points
        int16 lpFee;
        uint256 lastReservationTimestamp;
        // TODO: Would it be better to encode this as a bytes32?, len is always <= 25
        string payoutBTCAddress;
        address ethAddress;
    }

    struct SwapOrder {
        // max length == MAX_LIQUIDITY_PROVIDERS_PER_SWAP
        // TODO: Ensure solidity is packing at least  8 of these per sslot
        uint32[] lpIndexes;
        // user's evm address
        address payoutAddress;
        // TODO: Would it be better to encode this as a bytes32?, len is always <= 25
        string senderBtcAddress;
        uint256 reservationTimestamp;
        bytes32 nonce;
        bytes32 lpHash;
        bool complete;
    }

    struct LPBalanceChange {
        uint32 lpIndex;
        uint64 value;
    }

    ERC20 public immutable wrapped_bitcoin;
    TransactionInclusionPlonkVerification public immutable verifier;
    HeaderStorage public immutable header_storage;

    uint32 totalLpCount;
    // TODO: if we could somehow pack more than 1 LP bal into a single slot that would make
    // unlocking liquidity much cheaper gas wise
    mapping(uint32 => LiquidityProvider) public lps;
    mapping(address => uint32) public lpIndex;
    SwapOrder[] public activeSwapOrders;

    constructor(address _wrapped_bitcoin, address _header_storage) {
        verifier = new TransactionInclusionPlonkVerification();
        wrapped_bitcoin = ERC20.wrap(_wrapped_bitcoin);
        header_storage = HeaderStorage(_header_storage);
    }

    function provideLiquidity(
        string memory payoutBTCAddress,
        uint64 value,
        int16 lpFee
    ) public {
        if (value < MIN_DEPOSIT) {
            revert DepositTooLow();
        }

        uint32 _lpIndex = lpIndex[msg.sender];
        if (_lpIndex != 0) {
            uint unlock_timestamp = lps[_lpIndex].lastReservationTimestamp +
                RESERVATION_LOCKUP;

            // we could potentially allow depositing more liquidity if we modify the way
            // we handle order hashes, at the moment protocol expects liquidity to be fixed for lifetime of order
            if (block.timestamp <= unlock_timestamp) {
                revert LiquidityReserved(unlock_timestamp);
            }
            // happy path add monee + update _lpFee
            lps[_lpIndex].amountDeposited += value;
            lps[_lpIndex].lpFee = lpFee;
        } else {
            totalLpCount += 1;
            uint32 _totalLpCount = totalLpCount;
            lpIndex[msg.sender] = _totalLpCount;
            lps[_totalLpCount] = LiquidityProvider({
                amountDeposited: value,
                lpFee: lpFee,
                lastReservationTimestamp: 0,
                ethAddress: msg.sender,
                payoutBTCAddress: payoutBTCAddress
            });
        }
        wrapped_bitcoin.transferFrom(msg.sender, address(this), uint256(value));
    }

    function withdrawLiquidity(uint64 amount) public {
        uint32 _lpIndex = lpIndex[msg.sender];
        if (_lpIndex == 0) {
            revert LpDoesntExist();
        }
        if (lps[_lpIndex].amountDeposited < amount) {
            revert NotEnoughLiquidity();
        }
        uint unlock_timestamp = lps[_lpIndex].lastReservationTimestamp +
            RESERVATION_LOCKUP;

        if (unlock_timestamp > block.timestamp) {
            revert LiquidityReserved(unlock_timestamp);
        }

        lps[_lpIndex].amountDeposited -= amount;

        wrapped_bitcoin.transfer(msg.sender, uint256(amount));
    }

    function reserveLiquidity(
        uint32[] memory _lpIndexes,
        address _payoutAddress,
        string memory _senderBtcAddress
    ) public {
        if (_lpIndexes.length > MAX_LIQUIDITY_PROVIDERS_PER_SWAP) {
            revert TooManyLps();
        }
        bytes32 lpHash;
        for (uint16 i = 0; i < _lpIndexes.length; i++) {
            if (_lpIndexes[i] > totalLpCount) {
                revert InvalidLpIndex();
            }

            LiquidityProvider memory lp = lps[_lpIndexes[i]];

            if (lp.amountDeposited == 0) {
                revert NoLiquidityToReserve();
            }

            uint unlock_timestamp = lp.lastReservationTimestamp +
                RESERVATION_LOCKUP;

            if (block.timestamp <= unlock_timestamp) {
                revert LiquidityReserved(unlock_timestamp);
            }

            lpHash = keccak256(
                abi.encode(
                    lpHash,
                    lp.payoutBTCAddress,
                    lp.amountDeposited,
                    lp.lpFee
                )
            );

            lps[_lpIndexes[i]].lastReservationTimestamp = block.timestamp;
        }

        SwapOrder memory newSwapOrder = SwapOrder({
            lpIndexes: _lpIndexes,
            payoutAddress: _payoutAddress,
            senderBtcAddress: _senderBtcAddress,
            reservationTimestamp: block.timestamp,
            // Doesn't need to be truly random,
            // just enough so that the chance the hash has been
            // put in an inscription is effectively impossible.
            // may be overkill
            nonce: keccak256(
                abi.encode(
                    _payoutAddress,
                    _senderBtcAddress,
                    block.timestamp,
                    activeSwapOrders.length
                )
            ),
            lpHash: lpHash,
            complete: false
        });

        activeSwapOrders.push(newSwapOrder);
    }

    // This needs to be in noir (╯°□°)╯︵ ┻━┻
    /*
	function validateLpUtxos(SwapOrder memory swap_order, LpUtxo[] memory lp_payments) public view returns (bytes32) {
		uint64 sats_output;
		for (uint i = 0; i < lp_payments.length; i++){
            if(swap_order.lpIndexes[i] != lp_payments[i].lpIndex) {
                revert InvalidOrder();
            }
            if(lp_payments[i].value == 0){
                revert InvalidOrder();
            }
            
            LiquidityProvider storage _lp = lps[lp_payments[i].lpIndex];

            // Calculate the fee
            uint64 fee = uint64(uint16(_lp.lpFee) * lp_payments[i].value / 1000000);  // Assumes lpFee is in basis points
            if (fee > lp_payments[i].value) {
                revert InvalidOrder(); // Guard against fee being more than the sent value
            }
            
            // Subtract fee from the transaction value
            uint64 netValue = lp_payments[i].value - fee;
            
            // Update total fees and values
            totalFee += fee;
            totalValue += netValue;

            // Update the liquidity provider's deposited amount
            _lp.amountDeposited += netValue;  // Assuming you want to add the net value

            // Potentially other state updates
        }	}
	*/

    // order_id is an index into activeSwapOrders
    function unlockLiquidity(
        uint256 order_id,
        uint256 payment_btc_block_height,
        LPBalanceChange[] memory updated_balances,
        uint256 output,
        bytes calldata payment_proof
    ) public {
        SwapOrder memory swap_order = activeSwapOrders[order_id];
        // lp_payments should be the same length as the swap_order
        if (swap_order.lpIndexes.length != updated_balances.length) {
            revert NotEnoughLiquidityConsumed();
        }
        if (swap_order.complete) {
            revert OrderComplete();
        }
        if (
            swap_order.reservationTimestamp + RESERVATION_LOCKUP >
            block.timestamp
        ) {
            revert LiquidityNotReserved();
        }
        bytes32 merkle_root = header_storage.getMerkleRootSafe(
            payment_btc_block_height
        );
        //TODO: CHECK PROOF HERE, pass lpHash, order nonce, updated_bal hash, output amt, merkle_root
        /*
        verifier.verify(
            payment_proof,

        );
        */
        swap_order.complete = true;
        for (uint16 i = 0; i < updated_balances.length; i++) {
            lps[updated_balances[i].lpIndex].amountDeposited = updated_balances[
                i
            ].value;
        }
        wrapped_bitcoin.transfer(msg.sender, uint256(output));
    }
}
