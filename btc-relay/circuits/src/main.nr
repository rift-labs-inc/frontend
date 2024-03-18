use dep::std;

struct ProposedBlock {
    block_hash: [u8; 32],
    height: Field,
    version: Field,
    prev_block_hash: [u8; 32],
    merkle_root: [u8; 32],
    timestamp: Field,
    bits: Field,
    nonce: Field,
}

struct RetargetBlock {
    bits: Field,
    height: Field,
    timestamp: Field
}

struct Txn {
    hash: [u8; 32]
}

fn bits_to_target(bits: Field) -> Field {
    let exponent = (bits as u32) >> 24;
    let coefficient = (bits as u32) & 0xffffff;
    let target = (coefficient as Field) * 2.pow_32(8 * ((exponent as Field) - 3));
    target
}

fn calculate_retarget(retarget_block: RetargetBlock, proposed_block: ProposedBlock) -> Field {
    println("Retarget block bits: ");
    println(retarget_block.bits as u32);

    let old_target = bits_to_target(retarget_block.bits) as Field;

    let mut actual_timespan = if proposed_block.timestamp as u32 > retarget_block.timestamp as u32 {
        (proposed_block.timestamp - retarget_block.timestamp) as u32
    } else {
        (retarget_block.timestamp - proposed_block.timestamp) as u32
    };

    if actual_timespan < TARGET_TIMESPAN / 4 {
        actual_timespan = TARGET_TIMESPAN / 4;
    } else if actual_timespan > TARGET_TIMESPAN * 4 {
        actual_timespan = TARGET_TIMESPAN * 4;
    }

    println("Actual timespan: ");
    println(actual_timespan);
    println("Old target: ");
    println(old_target);

    // TODO: multiply by inverse modulo instead of division 
    let new_target = (old_target as u32) * ((actual_timespan) / (TARGET_TIMESPAN));

    println("New target: ");
    println(new_target);

    new_target as Field
}

global TARGET_PERIOD: u32 = 2016;
global TARGET_TIMESPAN: u32 = 1209600; // 2 weeks

fn main(
    // From contract, must be passed by indexer when creating proof. However, in contract verify: // contract passes this data directly:
    previous_block_hash: pub [u8; 32],
    previous_block_height: pub u32,
    retarget_block: pub RetargetBlock,
    // Passed straight from indexer (indexer → sol contract → verification contract)
    proposed_block: pub ProposedBlock// Passed by indexer but NOT as public witness:
    // txns: [Txn; 4000]
) {
    // CIRCUIT BEGINS
    let proposed_target = bits_to_target(proposed_block.bits);
    println("Proposed bits: ");
    println(proposed_block.bits as u32);
    println("Proposed target: ");
    println(proposed_target);

    // check if we need to retarget
    if (proposed_block.height as u32 >= retarget_block.height as u32 + TARGET_PERIOD) {
        println("\nRetargeting...");
        let new_target = calculate_retarget(retarget_block, proposed_block);
        // verify that the proposed target matches the real target
        // assert(proposed_target == new_target);
    }

    // verify PoW with double sha256 
    verify_PoW(proposed_block);
}

fn verify_PoW(proposed_block: ProposedBlock) {
    println("\nVerifying PoW...");

    // generate serialized header array from proposed block data
    let mut serialized_header_array: [u8; 80] = [0; 80];
    let mut i = 0;

    // version
    let version_bytes = proposed_block.version.to_le_bytes(4);
    for j in 0..4 {
        serialized_header_array[i] = version_bytes[j];
        i += 1;
    }

    // previous block hash
    let len = proposed_block.prev_block_hash.len();
    for j in 0..len {
        serialized_header_array[i] = proposed_block.prev_block_hash[len - 1 - j];
        i += 1;
    }

    // merkle root
    let len = proposed_block.merkle_root.len();
    for j in 0..len {
        serialized_header_array[i] = proposed_block.merkle_root[len - 1 - j];
        i += 1;
    }

    // timestamp
    let timestamp_bytes = proposed_block.timestamp.to_le_bytes(4);
    for j in 0..4 {
        serialized_header_array[i] = timestamp_bytes[j];
        i += 1;
    }

    // bits
    let bits_bytes = proposed_block.bits.to_le_bytes(4);
    for j in 0..4 {
        serialized_header_array[i] = bits_bytes[j];
        i += 1;
    }

    // nonce
    let nonce_bytes = proposed_block.nonce.to_le_bytes(4);
    for j in 0..4 {
        serialized_header_array[i] = nonce_bytes[j];
        i += 1;
    }

    println(" ");
    let pre_hash = std::hash::sha256(serialized_header_array);
    let block_hash_big_endian = std::hash::sha256(pre_hash);
    let mut block_hash: [Field; 32] = [0; 32];

    // convert to little-endian
    let len = block_hash_big_endian.len();
    for i in 0..len {
        block_hash[i] = (block_hash_big_endian[len - 1 - i] as u8) as Field;
    }
    // print block hash
    for i in 0..32 {
        println(block_hash[i]);
    }
    // verify PoW
    for i in 0..32 {
        assert(block_hash[i] == proposed_block.block_hash[i] as Field);
    }
    println("\nPoW verified!");
}
