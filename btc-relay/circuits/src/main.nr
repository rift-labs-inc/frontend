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

fn bits_to_target(bits: Field) -> Field {
    // convert the given bits to target
    let exponent = (bits as u32) >> 24;
    let coefficient = (bits as u32) & 0xffffff;
    let target = (coefficient as Field) * 2.pow_32(8 * ((exponent as Field) - 3));
    target
}

fn calculate_retarget(retarget_block: RetargetBlock, proposed_block: ProposedBlock) -> Field {
    // calculate the new target based on the retarget block and the proposed block
    let mut actual_time = proposed_block.timestamp as u32 - retarget_block.timestamp as u32;
    println("\nActual time before clamping: ");
    println(actual_time as u64);

    if actual_time < TARGET_TIMESPAN / 4 {
        actual_time = TARGET_TIMESPAN / 4;
    } else if actual_time > TARGET_TIMESPAN * 4 {
        actual_time = TARGET_TIMESPAN * 4;
    }

    let ratio_mantissa = actual_time as u64 * 1_000_000;

    // decode the old bits
    let old_exponent = retarget_block.bits as u32 >> 24;
    let old_coefficient = retarget_block.bits as u32 & 0x00ffffff;

    // adjust the coefficient based on the ratio 
    let new_coefficient_temp = old_coefficient as u64 * ratio_mantissa / (TARGET_TIMESPAN as u64 * 1_000_000);
    let new_coefficient = if new_coefficient_temp > 0x00ffffff {
        0x00ffffff // clamp to max if overflow
    } else {
        new_coefficient_temp as u32
    };

    let new_bits = (old_exponent << 24) | new_coefficient;
    let new_target = bits_to_target(new_bits as Field);
    let old_target = bits_to_target(retarget_block.bits) as Field;

    println("Proposed bits: ");
    println(proposed_block.bits as u32);
    println("Proposed target: ");
    println(old_target);
    println("Actual_time: ");
    println(actual_time as u64);
    println("New target: ");
    println(new_target);

    if (proposed_block.height as u32 == retarget_block.height as u32 + TARGET_PERIOD) {
        println("\nRetargeting...");
        new_target
    } else {
        println("\nNo retargeting...");
        old_target
    }
}

fn verify_PoW(proposed_block: ProposedBlock, proposed_target: Field) {
    println("\nVerifying PoW...");

    // [0] SETUP - build serialized header from proposed block data
    let mut serialized_header_array: [u8; 80] = [0; 80];
    let mut i = 0;

    // version setup
    let version_bytes = proposed_block.version.to_le_bytes(4);
    for j in 0..4 {
        serialized_header_array[i] = version_bytes[j];
        i += 1;
    }

    // previous block hash setup
    let len = proposed_block.prev_block_hash.len();
    for j in 0..len {
        serialized_header_array[i] = proposed_block.prev_block_hash[len - 1 - j];
        i += 1;
    }

    // merkle root setup
    let len = proposed_block.merkle_root.len();
    for j in 0..len {
        serialized_header_array[i] = proposed_block.merkle_root[len - 1 - j];
        i += 1;
    }

    // timestamp setup
    let timestamp_bytes = proposed_block.timestamp.to_le_bytes(4);
    for j in 0..4 {
        serialized_header_array[i] = timestamp_bytes[j];
        i += 1;
    }

    // bits setup
    let bits_bytes = proposed_block.bits.to_le_bytes(4);
    for j in 0..4 {
        serialized_header_array[i] = bits_bytes[j];
        i += 1;
    }

    // nonce setup
    let nonce_bytes = proposed_block.nonce.to_le_bytes(4);
    for j in 0..4 {
        serialized_header_array[i] = nonce_bytes[j];
        i += 1;
    }

    // [1] double sha256
    let first_hash = std::hash::sha256(serialized_header_array);
    let block_hash_big_endian = std::hash::sha256(first_hash);
    let mut block_hash: [Field; 32] = [0; 32];

    // convert block hash to little-endian
    let len = block_hash_big_endian.len();
    for i in 0..len {
        block_hash[i] = (block_hash_big_endian[len - 1 - i] as u8) as Field;
    }

    // [2] verify proposed block hash matches calculated block hash
    for i in 0..32 {
        assert(block_hash[i] == proposed_block.block_hash[i] as Field);
    }

    // convert proposed target to an array
    let mut proposed_target_array: [u8; 32] = [0; 32];
    let proposed_target_bytes = proposed_target.to_be_bytes(32);
    for i in 0..32 {
        proposed_target_array[i] = proposed_target_bytes[i];
    }

    // extract the first byte that differs between the block hash and proposed target
    let mut first_block_hash_different_byte = -1;
    let mut first_proposed_target_different_byte = -1;
    for i in 0..32 {
        if block_hash[i] != (proposed_target_array[i] as Field) {
            if first_block_hash_different_byte == -1 {
                if first_proposed_target_different_byte == -1 {
                    // exit if byte differs
                    first_block_hash_different_byte = block_hash[i];
                    first_proposed_target_different_byte = proposed_target_array[i] as Field;
                }
            }
        }
    }

    // [3] verify PoW if block hash <= proposed target
    assert(first_block_hash_different_byte as u8 <= first_proposed_target_different_byte as u8);
    println("\nPoW verified!\n");
}

global TARGET_PERIOD: u32 = 2016;
global TARGET_TIMESPAN: u32 = 1209600; // 2 weeks

fn main(
    // from contract, passed by indexer when creating proof:
    previous_block_hash: pub [u8; 32],
    previous_block_height: pub u32,
    retarget_block: pub RetargetBlock,
    // from indexer (indexer → sol contract → verification contract):
    proposed_block: pub ProposedBlock
) {
    // CIRCUIT BEGINS

    // [1] verify proposed target is equal to real target
    let proposed_target = bits_to_target(proposed_block.bits);
    let real_target = calculate_retarget(retarget_block, proposed_block);

    // verify that the proposed target matches the real target
    assert(proposed_target == real_target);
    println("\nTarget verified!");

    // [2] verify the proposed block height is one greater than previous_block_height
    assert(proposed_block.height as u32 == previous_block_height + 1);

    // [3] verify the proposed prev_block_hash matches real previous_block_hash
    for i in 0..32 {
        assert(proposed_block.prev_block_hash[i] == previous_block_hash[i]);
    }

    // [4] verify PoW (double sha256 + block_hash <= target)
    verify_PoW(proposed_block, proposed_target);
}
