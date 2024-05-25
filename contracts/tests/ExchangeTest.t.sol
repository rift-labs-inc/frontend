// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import { Test } from 'forge-std/Test.sol';
import { console } from 'forge-std/console.sol';
import { RiftExchange } from '../src/RiftExchange.sol';

contract RiftExchangeTest is Test {
    RiftExchange riftExchange;
    address testAddress = address(0x123);
    address lp1 = address(0x69);
    address lp2 = address(0x69420);
    address lp3 = address(0x6969);
    address buyer1 = address(0x111111);
    address buyer2 = address(0x222222);
    address buyer3 = address(0x333333);

    bytes4 constant DEPOSIT_TOO_LOW = bytes4(keccak256('DepositTooLow()'));
    bytes4 constant DEPOSIT_TOO_HIGH = bytes4(keccak256('DepositTooHigh()'));
    bytes4 constant INVALID_BTC_PAYOUT_ADDRESS = bytes4(keccak256('InvalidBitcoinAddress()'));
    bytes4 constant RESERVATION_FEE_TOO_LOW = bytes4(keccak256('ReservationFeeTooLow()'));
    bytes4 constant NOT_ENOUGH_LIQUIDITY = bytes4(keccak256('NotEnoughLiquidity()'));
    bytes4 constant RESERVATION_AMOUNT_TOO_LOW = bytes4(keccak256('ReservationAmountTooLow()'));
    bytes4 constant RESERVATION_EXPIRED = bytes4(keccak256('ReservationExpired()'));

    function setUp() public {
        riftExchange = new RiftExchange(address(0x456));
    }

    //--------- DEPOSIT TESTS ---------//

    function testDepositLiquidity() public {
        vm.deal(testAddress, 10 ether);
        vm.startPrank(testAddress);

        // [0] deposit 1.2 eth
        string memory btcPayoutAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
        uint64 btcExchangeRate = 69;
        uint256 depositAmount = 1.2 ether;

        riftExchange.depositLiquidity{ value: depositAmount }(btcPayoutAddress, btcExchangeRate);

        // [1] assert deposit is correct
        assertEq(address(riftExchange).balance, depositAmount, 'Contract balance should match deposit amount');
        uint256 depositsLength = riftExchange.getDepositVaultsLength(testAddress);
        assertEq(depositsLength, 1, 'Should have exactly one deposit entry');

        RiftExchange.DepositVault memory deposit = riftExchange.getDepositVault(testAddress, 0);

        assertEq(deposit.ethDepositAmount, depositAmount, 'Deposit amount mismatch');
        assertEq(deposit.btcExchangeRate, btcExchangeRate, 'BTC riftExchange rate mismatch');
        assertEq(deposit.btcPayoutAddress, btcPayoutAddress, 'BTC payout address mismatch');

        vm.stopPrank();
    }

    function testDepositTooLow() public {
        vm.deal(testAddress, 10 ether);
        vm.startPrank(testAddress);

        // Deposit amount below minimum (0.05 ether)
        uint256 lowDepositAmount = 0.01 ether; // Deliberately below the 0.05 ether minimum
        string memory btcPayoutAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
        uint64 btcExchangeRate = 69;

        vm.expectRevert(DEPOSIT_TOO_LOW);
        riftExchange.depositLiquidity{ value: lowDepositAmount }(btcPayoutAddress, btcExchangeRate);

        vm.stopPrank();
    }

    function testDepositTooHigh() public {
        vm.deal(testAddress, 300_000 ether);
        vm.startPrank(testAddress);

        // Deposit amount above maximum (200,000 ether)
        uint256 highDepositAmount = 300_000 ether; // Deliberately above the 200,000 ether maximum
        string memory btcPayoutAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
        uint64 btcExchangeRate = 69;

        vm.expectRevert(DEPOSIT_TOO_HIGH);
        riftExchange.depositLiquidity{ value: highDepositAmount }(btcPayoutAddress, btcExchangeRate);

        vm.stopPrank();
    }

    function testDepositOverwrite() public {
        vm.deal(testAddress, 10 ether);
        vm.startPrank(testAddress);

        // [0] Deposit initial liquidity
        string memory initialBtcPayoutAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
        uint64 initialBtcExchangeRate = 50; // Initial BTC riftExchange rate
        uint256 initialDepositAmount = 1 ether;

        riftExchange.depositLiquidity{ value: initialDepositAmount }(initialBtcPayoutAddress, initialBtcExchangeRate);
        assertEq(riftExchange.getDepositVaultsLength(testAddress), 1, 'Initial deposit should be recorded.');

        // [1] mark deposit as overwriteable (testing only funciton)
        riftExchange.markDepositOverwritableTesting(0);

        // [2] overwrite the deposit with new liquidity
        string memory newBtcPayoutAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
        uint64 newBtcExchangeRate = 75; // New BTC riftExchange rate
        uint256 newDepositAmount = 2 ether;

        riftExchange.depositLiquidity{ value: newDepositAmount }(newBtcPayoutAddress, newBtcExchangeRate);

        // [3] verify old deposit was overwritten
        RiftExchange.DepositVault memory overwrittenDeposit = riftExchange.getDepositVault(testAddress, 0);
        assertEq(overwrittenDeposit.ethDepositAmount, newDepositAmount, 'Overwritten deposit amount should match new deposit amount.');
        assertEq(overwrittenDeposit.btcExchangeRate, newBtcExchangeRate, 'Overwritten BTC riftExchange rate should match new rate.');
        assertEq(overwrittenDeposit.btcPayoutAddress, newBtcPayoutAddress, 'Overwritten BTC payout address should match new payout address.');
        assertEq(riftExchange.getDepositVaultsLength(testAddress), 1, 'Should have exactly one deposit entry');
        vm.stopPrank();
    }

    //--------- UPDATE DEPOSIT TESTS ---------//

    function testDepositUpdateExchangeRate() public {
        vm.deal(testAddress, 10 ether);
        vm.startPrank(testAddress);

        // Initial deposit
        uint256 depositAmount = 5 ether;
        riftExchange.depositLiquidity{ value: depositAmount }('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', 50);

        // Update exchange rate
        uint64 newExchangeRate = 100;
        riftExchange.updateExchangeRate(0, newExchangeRate);

        // Check if the exchange rate has been updated
        RiftExchange.DepositVault memory updatedDeposit = riftExchange.getDepositVault(testAddress, 0);
        assertEq(updatedDeposit.btcExchangeRate, newExchangeRate, 'Exchange rate should be updated');

        vm.stopPrank();
    }

    //--------- RESERVATION TESTS ---------//

    function testReserveSingleLP() public {
        vm.deal(lp1, 10 ether);

        // Deposit initial liquidity
        vm.startPrank(lp1);
        string memory btcPayoutAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
        uint64 btcExchangeRate = 69;
        uint256 depositAmount = 5 ether;
        riftExchange.depositLiquidity{ value: depositAmount }(btcPayoutAddress, btcExchangeRate);
        vm.stopPrank();

        // Reserve liquidity
        address[] memory lpAddresses = new address[](1);
        lpAddresses[0] = lp1;
        uint32[] memory vaultIDs = new uint32[](1);
        vaultIDs[0] = 0;
        uint256[] memory amountsToReserve = new uint256[](1);
        amountsToReserve[0] = 1 ether;
        string memory btcSenderAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';

        vm.deal(buyer1, 10 ether);
        vm.startPrank(buyer1);
        // TODO: check for exact amount of ETH sent for fee
        riftExchange.reserveLiquidity{ value: 5 ether }(lpAddresses, vaultIDs, amountsToReserve, buyer1, btcSenderAddress);
        vm.stopPrank();

        // Check reservation
        RiftExchange.SwapReservation memory reservation = riftExchange.getReservation(buyer1, 0);
        assertEq(reservation.amountsToReserve[0], amountsToReserve[0], 'Reservation amount mismatch');
        assertEq(reservation.ethPayoutAddress, buyer1, 'ETH payout address mismatch');

        vm.stopPrank();
    }

    function testReservationOverwriting() public {
        vm.deal(testAddress, 10 ether);
        vm.startPrank(testAddress);

        uint256 depositAmount = 10 ether;
        riftExchange.depositLiquidity{ value: depositAmount }('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', 50);
        address[] memory lpAddresses = new address[](1);
        lpAddresses[0] = testAddress;
        uint32[] memory depositIds = new uint32[](1);
        depositIds[0] = 0;
        uint256[] memory amountsToReserve = new uint256[](1);
        amountsToReserve[0] = 5 ether;

        // Make reservation
        riftExchange.reserveLiquidity(lpAddresses, depositIds, amountsToReserve, testAddress, 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq');

        // make another reservation 4 hours later (should push new reservation)
        vm.warp(block.timestamp + 4 hours);
        riftExchange.reserveLiquidity(lpAddresses, depositIds, amountsToReserve, testAddress, 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq');
        assertEq(riftExchange.getReservationLength(testAddress), 2, 'Should have exactly two reservation entries');

        // simulate reservation expiring
        vm.warp(block.timestamp + 4 hours);

        // make another reservation (should overwrite)
        riftExchange.reserveLiquidity(lpAddresses, depositIds, amountsToReserve, testAddress, 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq');
        assertEq(riftExchange.getReservationLength(testAddress), 2, 'Should still have only two reservation entries');
        vm.stopPrank();
    }

    //--------- WITHDRAW TESTS ---------//

    function testWithdrawLiquidity() public {
        vm.deal(testAddress, 5 ether);
        vm.startPrank(testAddress);

        // [0] initial deposit
        uint256 depositAmount = 5 ether;
        riftExchange.depositLiquidity{ value: depositAmount }('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', 50);

        // [1] withdraw some of the liquidity
        uint256 withdrawAmount = 2 ether;
        riftExchange.withdrawLiquidity(0, withdrawAmount);

        // [2] check if the balance has decreased correctly
        RiftExchange.DepositVault memory depositAfterWithdrawal = riftExchange.getDepositVault(testAddress, 0);
        uint256 expectedRemaining = depositAmount - withdrawAmount;
        assertEq(depositAfterWithdrawal.ethDepositAmount, expectedRemaining, 'Remaining deposit should match expected amount after withdrawal');

        // [3] check if the funds reached the LP's address
        assertEq(testAddress.balance, withdrawAmount, "LP's balance should match the withdrawn amount");

        vm.stopPrank();
    }

    //--------- INPUT VALIDATION TESTS ---------//

    function testDepositInvalidBtcAddress() public {
        vm.deal(testAddress, 10 ether);
        vm.startPrank(testAddress);

        // [0] deposit with invalid BTC payout address
        uint256 depositAmount = 1 ether;
        string memory invalidBtcPayoutAddress = '0xInvalidAddress';

        // [1] expect revert
        vm.expectRevert(INVALID_BTC_PAYOUT_ADDRESS);
        riftExchange.depositLiquidity{ value: depositAmount }(invalidBtcPayoutAddress, 50);
        vm.stopPrank();
    }

    function testReserveInvalidBtcAddress() public {
        vm.deal(testAddress, 10 ether);
        vm.startPrank(testAddress);

        // [0] deposit initial liquidity
        uint256 depositAmount = 1 ether;
        riftExchange.depositLiquidity{ value: depositAmount }('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', 50);

        // [1] reserve liquidity with invalid BTC payout address
        address[] memory lpAddresses = new address[](1);
        lpAddresses[0] = testAddress;
        uint32[] memory depositIds = new uint32[](1);
        depositIds[0] = 0;
        uint256[] memory amountsToReserve = new uint256[](1);
        amountsToReserve[0] = 1 ether;
        string memory invalidBtcPayoutAddress = '0xInvalidAddress';

        // [2] expect revert
        vm.expectRevert(INVALID_BTC_PAYOUT_ADDRESS);
        riftExchange.reserveLiquidity{ value: 1 ether }(lpAddresses, depositIds, amountsToReserve, testAddress, invalidBtcPayoutAddress);
        vm.stopPrank();
    }
}
