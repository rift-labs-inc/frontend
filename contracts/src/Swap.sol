// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.25;
import { UltraVerifier as TransactionInclusionPlonkVerification } from "./verifiers/TransactionInclusionPlonkVerification.sol";
import { ERC20 as WrappedBitcoin } from "./WrappedBitcoinInterface.sol";


contract Swap {
    error DepositTooLow();
    error LpDoesntExist();
	error TooManyLps();
    error NotEnoughLiquidity();
    error InvalidOrder();
    error NotEnoughLiquidityConsumed();
    error LiquidityReserved(uint until);
    error LiquidityNotReserved();
    error InvalidLpIndex();
    error NoLiquidityToReserve();

    struct LiquidityProvider {
        uint64 amountDeposited;
		// lp (-10000, 10000
        int16 lpFee;
        uint256 lastReservationTimestamp;
        string payoutBTCAddress;
        address ethAddress;
    }

    struct SwapOrder {
		// max length 
        uint32[] lpIndexes;
        // user:
        address payoutAddress;
		// 25 chars
        string senderBtcAddress;
        uint256 reservationTimestamp;
        bytes32 nonce;
		bytes32 lpHash;
    }

    uint256 constant public MIN_DEPOSIT = 0.002 * 10**8;
    uint256 constant public RESERVATION_LOCKUP = 12 hours;
	uint256 constant public MAX_LIQUIDITY_PROVIDERS_PER_SWAP = 50;

	WrappedBitcoin public wrapped_bitcoin;
	TransactionInclusionPlonkVerification public verifier;
    uint32 totalLpCount;
	// TODO: Make this non-constant, recalculable targeting ~150 USD
    mapping(uint32 => LiquidityProvider) public lps;
    mapping(address => uint32) public lpIndex;
    SwapOrder[] public activeSwapOrders; 


	constructor (WrappedBitcoin _wrapped_bitcoin) {
        verifier = new TransactionInclusionPlonkVerification();
		wrapped_bitcoin = _wrapped_bitcoin;
	}


	// TODO: Change this to use Wrapped Bitcoin as base layer
    function provideLiquidity(string memory _payoutBTCAddress, int16 _lpFee) public {
        if(msg.value < MIN_DEPOSIT) {
            revert DepositTooLow();
        }

        uint32 _lpIndex = lpIndex[msg.sender];
        if(_lpIndex != 0) {
            // happy path add monee + update _lpFee
            lps[_lpIndex].amountDeposited += msg.value;
            lps[_lpIndex].lpFee = _lpFee;
        } else {
            totalLpCount += 1;
            uint32 _totalLpCount = totalLpCount;
            lpIndex[msg.sender] = _totalLpCount;
            lps[_totalLpCount] = LiquidityProvider({
                amountDeposited: msg.value,
                lpFee: _lpFee,
                lastReservationTimestamp: 0,
                ethAddress: msg.sender,
                payoutBTCAddress: _payoutBTCAddress
            });
        }
    }

	// TODO: Change this to use Wrapped Bitcoin as base layer
    function withdrawLiquidity(uint256 amount ) public {
		// TODO: Change this to use Wrapped Bitcoin as base layer
        uint32 _lpIndex = lpIndex[msg.sender];
        if(_lpIndex == 0) {
            revert LpDoesntExist();
        }
        if (lps[_lpIndex].amountDeposited < amount) {
            revert NotEnoughLiquidity();
        }
        uint unlock_timestamp = lps[_lpIndex].lastReservationTimestamp + RESERVATION_LOCKUP;

		
        if(unlock_timestamp > block.timestamp) {
            revert LiquidityReserved(unlock_timestamp);
        }

        lps[_lpIndex].amountDeposited -= amount;
        payable(msg.sender).transfer(amount);
    }


    function reserveLiquidity(uint32[] memory _lpIndexes, address _payoutAddress, string memory _senderBtcAddress) public {
		if(_lpIndexes.length > MAX_LIQUIDITY_PROVIDERS_PER_SWAP) {
			revert TooManyLps();
		}
		bytes32 lpHash;
		for(uint8 i = 0; i < _lpIndexes.length; i++) {
			if(_lpIndexes[i] > totalLpCount){
				revert InvalidLpIndex();
			}
			
			LiquidityProvider memory lp = lps[_lpIndexes[i]];

			if(lp.amountDeposited <= 0){
				revert NoLiquidityToReserve();
			}

			uint unlock_timestamp = lp.lastReservationTimestamp + RESERVATION_LOCKUP;

			if(block.timestamp <= unlock_timestamp) {
				revert LiquidityReserved(unlock_timestamp);
			}

			lpHash = keccak256(abi.encode(
				lpHash,
				lp.payoutBTCAddress,
				lp.amountDeposited,
				lp.lpFee
			));


			lps[_lpIndexes[i]].lastReservationTimestamp = block.timestamp;
		}


        SwapOrder memory newSwapOrder = SwapOrder({
            lpIndexes: _lpIndexes,
            payoutAddress: _payoutAddress,
            senderBtcAddress: _senderBtcAddress,
            reservationTimestamp: block.timestamp,
			nonce: keccak256(abi.encodePacked(_payoutAddress, _senderBtcAddress, block.timestamp, activeSwapOrders.length)),
			lpHash: lpHash 
        });

        activeSwapOrders.push(newSwapOrder);
    }

	struct LpUtxo {
		uint32 lpIndex;
		uint64 value;
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

	function createOrderHash(
		SwapOrder memory swap_order,
		LpUtxo[] memory lp_payments
	) public pure {
		
	}

	// order_id is an index into activeSwapOrders
    function unlockLiquidity(uint256 order_id, LpUtxo[] memory lp_payments, bytes calldata payment_proof) public {
		SwapOrder memory swap_order = activeSwapOrders[order_id];
		// lp_payments should be the same length as the swap_order
		if (swap_order.lpIndexes.length != lp_payments.length){
			revert NotEnoughLiquidityConsumed();
		}
		if (swap_order.reservationTimestamp + RESERVATION_LOCKUP > block.timestamp) {
			revert LiquidityNotReserved();
		}
		createOrderHash(swap_order, lp_payments);
    }

}
