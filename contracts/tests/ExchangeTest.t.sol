// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import { Test } from 'forge-std/Test.sol';
import { console } from 'forge-std/console.sol';
import { RiftExchange } from '../src/RiftExchange.sol';

contract RiftExchangeTest is Test {
    RiftExchange riftExchange;
    address testAddress = address(0x123);

    // define custom error types
    bytes4 constant DEPOSIT_TOO_LOW = bytes4(keccak256('DepositTooLow()'));
    bytes4 constant DEPOSIT_TOO_HIGH = bytes4(keccak256('DepositTooHigh()'));

    function setUp() public {
        riftExchange = new RiftExchange(address(0x456)); // Deploy with a dummy HeaderStorage address
    }

    function testDepositLiquidity() public {
        vm.deal(testAddress, 10 ether);
        vm.startPrank(testAddress);

        // [0] deposit 1.2 eth
        string memory btcPayoutAddress = '0x007ab3f410ceba1a111b100de2f76a8154b80126cda3f8cab47728d2f8cd0d6d';
        uint64 btcExchangeRate = 69;
        uint256 depositAmount = 1.2 ether;

        // console.log('contract balance before eth deposit:', address(riftExchange).balance);
        riftExchange.depositLiquidity{ value: depositAmount }(btcPayoutAddress, btcExchangeRate);
        // console.log('contract balance after eth deposit:', address(riftExchange).balance);

        // [1] assert deposit was recorded correctly
        assertEq(address(riftExchange).balance, depositAmount, 'Contract balance should match deposit amount');
        // console.log('Successfully deposited ', depositAmount, ' ETH');
        uint256 depositsLength = riftExchange.getDepositVaultsLength(testAddress);
        assertEq(depositsLength, 1, 'Should have exactly one deposit entry');

        RiftExchange.DepositVault memory deposit = riftExchange.getDepositVault(testAddress, 0);

        assertEq(deposit.ethDepositAmount, depositAmount, 'Deposit amount mismatch');
        assertEq(deposit.btcExchangeRate, btcExchangeRate, 'BTC riftExchange rate mismatch');
        assertEq(deposit.btcPayoutAddress, btcPayoutAddress, 'BTC payout address mismatch');

        vm.stopPrank();
    }

    function testOverwriteDeposit() public {
        vm.deal(testAddress, 10 ether);
        vm.startPrank(testAddress);

        // [0] Deposit initial liquidity
        string memory initialBtcPayoutAddress = '0x000initialBTCaddress';
        uint64 initialBtcExchangeRate = 50; // Initial BTC riftExchange rate
        uint256 initialDepositAmount = 1 ether;

        riftExchange.depositLiquidity{ value: initialDepositAmount }(initialBtcPayoutAddress, initialBtcExchangeRate);
        assertEq(riftExchange.getDepositVaultsLength(testAddress), 1, 'Initial deposit should be recorded.');

        // [1] mark deposit as overwriteable (testing only funciton)
        riftExchange.markDepositOverwritableTesting(0);

        // [2] overwrite the deposit with new liquidity
        string memory newBtcPayoutAddress = '0x000newBTCaddress';
        uint64 newBtcExchangeRate = 75; // New BTC riftExchange rate
        uint256 newDepositAmount = 2 ether;

        // console.log('num deposits before overwriting:', riftExchange.getDepositVaultsLength(testAddress));
        riftExchange.depositLiquidity{ value: newDepositAmount }(newBtcPayoutAddress, newBtcExchangeRate);
        // console.log('= num deposits after overwriting:', riftExchange.getDepositVaultsLength(testAddress));

        // [3] verify old deposit was overwritten
        RiftExchange.DepositVault memory overwrittenDeposit = riftExchange.getDepositVault(testAddress, 0);
        assertEq(overwrittenDeposit.ethDepositAmount, newDepositAmount, 'Overwritten deposit amount should match new deposit amount.');
        assertEq(overwrittenDeposit.btcExchangeRate, newBtcExchangeRate, 'Overwritten BTC riftExchange rate should match new rate.');
        assertEq(overwrittenDeposit.btcPayoutAddress, newBtcPayoutAddress, 'Overwritten BTC payout address should match new payout address.');
        assertEq(riftExchange.getDepositVaultsLength(testAddress), 1, 'Should have exactly one deposit entry');
        vm.stopPrank();
    }

    // Test for depositing an amount below the minimum limit
    function testDepositTooLow() public {
        vm.deal(testAddress, 10 ether);
        vm.startPrank(testAddress);

        // Deposit amount below minimum (0.05 ether)
        uint256 lowDepositAmount = 0.01 ether; // Deliberately below the 0.05 ether minimum
        string memory btcPayoutAddress = '0x007ab3f410ceba1a111b100de2f76a8154b80126cda3f8cab47728d2f8cd0d6d';
        uint64 btcExchangeRate = 69;

        vm.expectRevert(DEPOSIT_TOO_LOW);
        riftExchange.depositLiquidity{ value: lowDepositAmount }(btcPayoutAddress, btcExchangeRate);

        vm.stopPrank();
    }

    // Test for depositing an amount above the maximum limit
    function testDepositTooHigh() public {
        vm.deal(testAddress, 300_000 ether);
        vm.startPrank(testAddress);

        // Deposit amount above maximum (200,000 ether)
        uint256 highDepositAmount = 300_000 ether; // Deliberately above the 200,000 ether maximum
        string memory btcPayoutAddress = '0x007ab3f410ceba1a111b100de2f76a8154b80126cda3f8cab47728d2f8cd0d6d';
        uint64 btcExchangeRate = 69;

        vm.expectRevert(DEPOSIT_TOO_HIGH);
        riftExchange.depositLiquidity{ value: highDepositAmount }(btcPayoutAddress, btcExchangeRate);

        vm.stopPrank();
    }

    function testUpdateExchangeRate() public {
        vm.deal(testAddress, 10 ether);
        vm.startPrank(testAddress);

        // Initial deposit
        uint256 depositAmount = 5 ether;
        riftExchange.depositLiquidity{ value: depositAmount }('0xbtcPayoutAddress', 50);

        // Update exchange rate
        uint64 newExchangeRate = 100;
        riftExchange.updateExchangeRate(0, newExchangeRate);

        // Check if the exchange rate has been updated
        RiftExchange.DepositVault memory updatedDeposit = riftExchange.getDepositVault(testAddress, 0);
        assertEq(updatedDeposit.btcExchangeRate, newExchangeRate, 'Exchange rate should be updated');

        vm.stopPrank();
    }

    function testWithdrawLiquidity() public {
        vm.deal(testAddress, 5 ether);
        vm.startPrank(testAddress);

        // Initial deposit
        uint256 depositAmount = 5 ether;
        riftExchange.depositLiquidity{ value: depositAmount }('0xbtcPayoutAddress', 50);

        // Withdraw some of the liquidity
        uint256 withdrawAmount = 2 ether;
        // console.log('contract balance before eth withdraw:', address(riftExchange).balance);
        // console.log('testAddress balance before eth withdraw:', testAddress.balance);
        riftExchange.withdrawLiquidity(0, withdrawAmount);
        // console.log('contract balance after eth withdraw:', address(riftExchange).balance);
        // console.log('testAddress balance after eth withdraw:', testAddress.balance);

        // Check if the balance has decreased correctly
        RiftExchange.DepositVault memory depositAfterWithdrawal = riftExchange.getDepositVault(testAddress, 0);
        uint256 expectedRemaining = depositAmount - withdrawAmount;
        assertEq(depositAfterWithdrawal.ethDepositAmount, expectedRemaining, 'Remaining deposit should match expected amount after withdrawal');

        // Check if the funds reached the LP's address
        assertEq(testAddress.balance, withdrawAmount, "LP's balance should match the withdrawn amount");

        vm.stopPrank();
    }
}
