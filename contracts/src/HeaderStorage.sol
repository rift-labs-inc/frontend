// SPDX-License-Identifier: Unlicensed
pragma solidity =0.8.25;

import { HeaderLib } from './HeaderLib.sol';
import { UltraVerifier as HeaderStoragePlonkVerifier } from './verifiers/HeaderStoragePlonkVerification.sol';
import 'forge-std/console.sol';

error InvalidTarget(uint256 provided, uint256 expected);
error BlockDoesntExist(uint256 height);
error InvalidBlockList();
error NotLongestChain();
error ProofVerificationFailed();
error BlockIsNotRetarget(uint256 invalid_height);

abstract contract HeaderStorage {
    HeaderStoragePlonkVerifier public verifier;

    // height => block
    mapping(uint256 => HeaderLib.Block) blockchain;

    uint256 public immutable first_block;
    uint256 public btc_checkpoint_height;
    uint256 public current_height;

    uint32 constant TARGET_PERIOD = 2016; // Number of blocks expected in TARGET_TIMESPAN
    uint32 constant TARGET_TIMESPAN = TARGET_PERIOD * 600; // ~ 2 weeks at 1 block per 10 minutes
    uint8 public constant SAFE_BLOCKS = 6;

    constructor(
        uint256 checkpoint_height,
        bytes32 block_hash,
        uint32 version,
        bytes32 prev_block_hash,
        bytes32 merkle_root,
        uint32 timestamp,
        uint32 bits,
        uint32 nonce
    ) {
        if (!(checkpoint_height % TARGET_PERIOD == 0)) {
            revert BlockIsNotRetarget(checkpoint_height);
        }

        first_block = checkpoint_height;

        verifier = new HeaderStoragePlonkVerifier();
        btc_checkpoint_height = checkpoint_height;
        current_height = checkpoint_height;
        blockchain[checkpoint_height] = HeaderLib.Block({
            block_hash: block_hash,
            version: version,
            prev_block_hash: prev_block_hash,
            merkle_root: merkle_root,
            timestamp: timestamp,
            bits: bits,
            nonce: nonce
        });
    }

    function proposeBlocksToLongestChain(
        // Checkpoint block that is VALID between the divergent chains
        uint256 checkpoint_height,
        bytes32[] memory _block_hashes,
        uint32[] memory _versions,
        bytes32[] memory _prev_block_hashes,
        bytes32[] memory _merkle_roots,
        uint32[] memory _timestamps,
        uint32[] memory _bits,
        uint32[] memory _nonces,
        bytes[] memory proof
    ) public {
        if (
            _block_hashes.length != _versions.length ||
            _block_hashes.length != _prev_block_hashes.length ||
            _block_hashes.length != _merkle_roots.length ||
            _block_hashes.length != _timestamps.length ||
            _block_hashes.length != _bits.length ||
            _block_hashes.length != _nonces.length ||
            _block_hashes.length != proof.length
        ) {
            revert InvalidBlockList();
        }

        if (checkpoint_height + _block_hashes.length <= current_height) {
            // What was proposed isn't the longest chain
            revert NotLongestChain();
        }

        for (uint256 i = 0; i < _block_hashes.length; i++) {
            setBlock(
                HeaderLib.ProposedBlock({
                    _current_height: checkpoint_height + i,
                    _block_hash: _block_hashes[i],
                    _version: _versions[i],
                    _prev_block_hash: _prev_block_hashes[i],
                    _merkle_root: _merkle_roots[i],
                    _timestamp: _timestamps[i],
                    _bits: _bits[i],
                    _nonce: _nonces[i],
                    proof: proof[i]
                })
            );
        }

        current_height = checkpoint_height + _block_hashes.length;
    }

    function proposeNewBlock(
        bytes32 block_hash,
        uint32 version,
        bytes32 prev_block_hash,
        bytes32 merkle_root,
        uint32 timestamp,
        uint32 bits,
        uint32 nonce,
        bytes memory proof
    ) public {
        setBlock(
            HeaderLib.ProposedBlock({
                _current_height: current_height,
                _block_hash: block_hash,
                _version: version,
                _prev_block_hash: prev_block_hash,
                _merkle_root: merkle_root,
                _timestamp: timestamp,
                _bits: bits,
                _nonce: nonce,
                proof: proof
            })
        );
        current_height++;
    }

    function setBlock(HeaderLib.ProposedBlock memory data) internal {
        // validate block data before setting
        HeaderLib.Block memory last_block = blockchain[data._current_height];
        HeaderLib.Block memory retarget_block = blockchain[data._current_height - (data._current_height % TARGET_PERIOD)];

        // reverts on proof failure
        verifier.verify(
            data.proof,
            HeaderLib.generatePublicInput(
                HeaderLib.PublicInput({
                    previous_block_hash: last_block.block_hash,
                    last_block_height: data._current_height,
                    retarget_block_bits: retarget_block.bits,
                    retarget_block_height: data._current_height - (data._current_height % TARGET_PERIOD),
                    retarget_block_timestamp: retarget_block.timestamp,
                    proposed_block_hash: data._block_hash,
                    proposed_block_height: data._current_height + 1,
                    proposed_block_version: data._version,
                    proposed_block_prev_hash: data._prev_block_hash,
                    proposed_block_merkle_root: data._merkle_root,
                    proposed_block_timestamp: data._timestamp,
                    proposed_block_bits: data._bits,
                    proposed_block_nonce: data._nonce
                })
            )
        );

        // add newly proposed block to blockchain
        blockchain[data._current_height + 1] = HeaderLib.Block({
            block_hash: data._block_hash,
            version: data._version,
            prev_block_hash: data._prev_block_hash,
            merkle_root: data._merkle_root,
            timestamp: data._timestamp,
            bits: data._bits,
            nonce: data._nonce
        });
    }

    function assertSafeHeight(uint256 height) internal view {
        if ((height != first_block) && (height > current_height || height < btc_checkpoint_height || height > current_height - SAFE_BLOCKS)) {
            revert BlockDoesntExist(height);
        }
    }

    function getBlockUnsafe(uint256 height) public view returns (HeaderLib.Block memory) {
        return blockchain[height];
    }

    function getBlockSafe(uint256 height) public view returns (HeaderLib.Block memory) {
        assertSafeHeight(height);
        return blockchain[height];
    }

    // Get a part of a block (saves gas by not doing unneccessary sloads)
    function getMerkleRootSafe(uint256 height) public view returns (bytes32) {
        assertSafeHeight(height);
        return blockchain[height].merkle_root;
    }
}
