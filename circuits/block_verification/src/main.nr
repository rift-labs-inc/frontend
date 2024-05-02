use dep::std;

global TARGET_PERIOD: u32 = 2016; // blocks between difficulty retargets
global TARGET_TIMESPAN: u32 = 1209600; // goal time of 10 minutes per block * 2016 blocks

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

fn main(
    previous_block_hash: pub [u8; 32], // from contract
    previous_block_height: pub u32, // from contract
    retarget_block: pub RetargetBlock, // from contract
    proposed_block: pub ProposedBlock // from indexer
) {
    //------------------ MAIN CIRCUIT ------------------

    // [1] verify proposed target is equal to real target
    let proposed_target = bits_to_target(proposed_block.bits);
    let real_target = calculate_real_target(retarget_block, proposed_block);
    assert(proposed_target == real_target);

    // [2] verify the proposed block height is one greater than previous_block_height
    assert(proposed_block.height as u32 == previous_block_height + 1);

    // [3] verify the proposed prev_block_hash matches real previous_block_hash
    for i in 0..32 {
        assert(proposed_block.prev_block_hash[i] == previous_block_hash[i]);
    }

    // [4] verify PoW (double sha256(block_hash) <= target)
    verify_PoW(proposed_block, real_target);
}

fn bits_to_target(bits: Field) -> Field {
    // [0] convert the given bits to target
    let exponent = (bits as u32) >> 24;
    let coefficient = (bits as u32) & 0xffffff;
    let mut target = (coefficient as Field) * 2.pow_32(8 * ((exponent as Field) - 3));

    // [1] convert new target to byte array
    let mut target_array: [u8; 32] = [0; 32];
    let target_bytes = target.to_be_bytes(32);
    for i in 0..32 {
        target_array[i] = target_bytes[i];
    }

    // [2] convert maximum possible target to byte array
    let max_target = 0xFFFF0000000000000000000000000000000000000000000000000000;
    let mut max_target_array: [u8; 32] = [0; 32];
    let max_target_bytes = max_target.to_be_bytes(32);
    for i in 0..32 {
        max_target_array[i] = max_target_bytes[i];
    }

    // [3] clamp target if above max 
    let comparison = larger_byte_array(target_array, max_target_array);
    if (comparison == 1) { // target > max_target
        println("\nProposed target > max, clamping...");
        target = max_target;
    }
    target
}

fn calculate_real_target(retarget_block: RetargetBlock, proposed_block: ProposedBlock) -> Field {
    // [0] calculate the actual time between blocks
    let mut actual_time = proposed_block.timestamp as u64 - retarget_block.timestamp as u64;
    if actual_time < (TARGET_TIMESPAN / 4) as u64 {
        actual_time = (TARGET_TIMESPAN / 4) as u64;
    } else if actual_time > (TARGET_TIMESPAN * 4) as u64 {
        actual_time = (TARGET_TIMESPAN * 4) as u64;
    }

    // [1] decode old bits
    let old_exponent = retarget_block.bits as u32 >> 24;
    let old_coefficient = retarget_block.bits as u32 & 0x00ffffff;

    // [2] calculate new coefficient based on time ratio 
    let scale = 1_000_000;
    let mut new_coefficient = old_coefficient as u64 * (actual_time as u64 * scale) / (TARGET_TIMESPAN as u64 * scale);
    if new_coefficient > 0x00ffffff {
        new_coefficient = 0x00ffffff; // clamp to max if overflow
    }

    // [3] calculate new bits
    let new_bits = (old_exponent << 24) | new_coefficient as u32; // combine exponent and coefficient
    let new_target = bits_to_target(new_bits as Field);
    let old_target = bits_to_target(retarget_block.bits) as Field;

    // [4] return new target if 2016 blocks have passed since last retarget
    if (proposed_block.height as u32 >= retarget_block.height as u32 + TARGET_PERIOD) {
        new_target
    } else {
        old_target
    }
}

fn verify_PoW(proposed_block: ProposedBlock, proposed_target: Field) {
    println("\nVerifying PoW...");

    // [0] build serialized header from proposed block data
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

    // [1] double sha256 the serialized block header
    let first_hash = std::hash::sha256(serialized_header_array);
    let second_hash = std::hash::sha256(first_hash);

    // convert block hash to little-endian
    let mut block_hash: [Field; 32] = [0; 32];
    for i in 0..32 {
        block_hash[i] = (second_hash[len - 1 - i] as u8) as Field;
    }

    // [2] verify proposed block hash matches calculated block hash
    for i in 0..32 {
        assert(block_hash[i] == proposed_block.block_hash[i] as Field);
    }

    // convert proposed target to array of bytes
    let mut proposed_target_array: [u8; 32] = [0; 32];
    let proposed_target_bytes = proposed_target.to_be_bytes(32);
    for i in 0..32 {
        proposed_target_array[i] = proposed_target_bytes[i];
    }

    // convert block hash to array of bytes
    let mut block_hash_bytes: [u8; 32] = [0; 32];
    for i in 0..32 {
        block_hash_bytes[i] = block_hash[i] as u8;
    }

    // [3] verify PoW if block hash <= proposed target
    let PoW = larger_byte_array(block_hash_bytes, proposed_target_array);
    assert(PoW != 1);
    println("\nPoW verified!\n");
}

fn larger_byte_array(a: [u8; 32], b: [u8; 32]) -> u32 {
    // returns larger byte array (1: a > b, 2: a < b, 0: a == b)
    let mut result = 0;
    for i in 0..32 {
        if (a[i] != b[i]) {
            if (result == 0) {
                if a[i] > b[i] {
                    result = 1; // a > b
                } else {
                    result = 2; // a < b
                }
            }
        }
    }
    result // a == b
}
