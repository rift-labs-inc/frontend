// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import { Test } from 'forge-std/Test.sol';
import { console } from 'forge-std/console.sol';
import { Escrow } from '../src/Escrow.sol';

contract EscrowTest is Test {
    Escrow escrow;
    address testAddress = address(0x123);

    function setUp() public {
        escrow = new Escrow(address(0x456)); // Deploy with a dummy HeaderStorage address
        console.log('Escrow contract deployed! - ', address(escrow));
    }

    function testDepositLiquidity() public {
        vm.deal(testAddress, 10 ether);
        vm.startPrank(testAddress);

        // Act: Deposit liquidity
        string memory btcPayoutAddress = '0x007ab3f410ceba1a111b100de2f76a8154b80126cda3f8cab47728d2f8cd0d6d';
        uint64 btcExchangeRate = 69; // Example BTC exchange rate
        uint256 depositAmount = 1.2 ether;

        console.log('address balance before 1.2 eth deposit:', testAddress.balance);
        escrow.depositLiquidity{ value: depositAmount }(btcPayoutAddress, btcExchangeRate);
        console.log('address balance after 1.2 eth deposit:', testAddress.balance);

        // Assert: Check that the deposit was recorded correctly
        uint256 depositsLength = escrow.getLiquidityDepositsLength(testAddress);
        assertEq(depositsLength, 1, 'Should have exactly one deposit entry');
        console.log('Deposit count for test address:', depositsLength);

        Escrow.LiquidityDeposit memory deposit = escrow.getLiquidityDeposit(testAddress, 0);
        console.log('Stored ETH amount:', deposit.ethDepositAmount);
        console.log('Stored BTC exchange rate:', deposit.btcExchangeRate);
        console.log('Stored BTC payout address:', deposit.btcPayoutAddress);

        assertEq(deposit.ethDepositAmount, depositAmount, 'Deposit amount mismatch');
        assertEq(deposit.btcExchangeRate, btcExchangeRate, 'BTC exchange rate mismatch');
        assertEq(deposit.btcPayoutAddress, btcPayoutAddress, 'BTC payout address mismatch');

        vm.stopPrank();
    }
}
