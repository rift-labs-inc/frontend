// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {HeaderStorage} from "../src/HeaderStorage.sol";
import "forge-std/console.sol";
import {HeaderLib} from "../src/HeaderLib.sol";
import {TestLib} from "./data/TestLib.sol";

contract TestBitcoinBlockData is Test {
    BitcoinBlockData public blockData;

    TestLib.ProposedBlock public first_block = TestLib.getTestBlocks()[0];

    function setUp() public {
        blockData = new BitcoinBlockData({
    checkpoint_height: first_block.proposed_height,
    block_hash: first_block.block_hash,
    version: first_block.version,
    prev_block_hash: first_block.prev_block_hash,
    merkle_root: first_block.merkle_root,
    timestamp: first_block.timestamp,
    bits: first_block.bits,
    nonce: first_block.nonce
    });
    }

    function testFirstBlockIsSet() public {
        assert(blockData.getBlockUnsafe(first_block.proposed_height).block_hash == first_block.block_hash);
    }

    function testAddBlockToGenesis() public {
        TestLib.ProposedBlock memory second_block = TestLib.getTestBlocks()[1];
        blockData.proposeNewBlock({
            block_hash: second_block.block_hash,
            version: second_block.version,
            prev_block_hash: second_block.prev_block_hash,
            merkle_root: second_block.merkle_root,
            timestamp: second_block.timestamp,
            bits: second_block.bits,
            nonce: second_block.nonce,
            proof: second_block.proof
        });
        // If this doesn't fail the proof succeeded
    }

    function testAddBlockToFirstBlock() public {
        TestLib.ProposedBlock memory second_block = TestLib.getTestBlocks()[1];
        blockData.proposeNewBlock({
            block_hash: second_block.block_hash,
            version: second_block.version,
            prev_block_hash: second_block.prev_block_hash,
            merkle_root: second_block.merkle_root,
            timestamp: second_block.timestamp,
            bits: second_block.bits,
            nonce: second_block.nonce,
            proof: second_block.proof
        });
        TestLib.ProposedBlock memory third_block = TestLib.getTestBlocks()[2];
        blockData.proposeNewBlock({
            block_hash: third_block.block_hash,
            version: third_block.version,
            prev_block_hash: third_block.prev_block_hash,
            merkle_root: third_block.merkle_root,
            timestamp: third_block.timestamp,
            bits: third_block.bits,
            nonce: third_block.nonce,
            proof: third_block.proof
        });
        // If this doesn't fail the proof succeeded
    }
}
