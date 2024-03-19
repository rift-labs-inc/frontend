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

fn calculate_retarget(retarget_block: RetargetBlock, proposed_block: ProposedBlock) -> FixedPoint {
    // calculate the new target based on the retarget block and the proposed block

    let mut actual_time = proposed_block.timestamp as u32 - retarget_block.timestamp as u32;

    if actual_time < TARGET_TIMESPAN / 4 {
        actual_time = TARGET_TIMESPAN / 4;
    } else if actual_time > TARGET_TIMESPAN * 4 {
        actual_time = TARGET_TIMESPAN * 4;
    }

    let old_target = bits_to_target(retarget_block.bits) as Field;
    let old_target_fixed = FixedPoint::new(old_target, 4);
    let actual_time_fixed = FixedPoint::new(actual_time as Field, 1);
    let expected_time_fixed = FixedPoint::new(TARGET_TIMESPAN as Field, 1);
    let ratio = FixedPoint::divide(actual_time_fixed, expected_time_fixed);
    // let real_target = FixedPoint::multiply(old_target_fixed, ratio);

    println("actual_time: ");
    println(actual_time);
    println("actual_time fixed: ");
    println(actual_time_fixed);
    println("expected_time: ");
    println(TARGET_TIMESPAN);
    println("Expected time fixed: ");
    println(expected_time_fixed);
    println("Ratio: ");
    println(ratio);
    println("expected target: ");
    println(old_target);
    println("Real target: ");
    // println(real_target);

    // real_target
    old_target_fixed
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

    println("Proposed bits: ");
    println(proposed_block.bits as u32);
    println("Proposed target: ");
    println(proposed_target);
    println("Real target: ");
    println(real_target);

    if (proposed_block.height as u32 == retarget_block.height as u32 + TARGET_PERIOD) {
        println("\nRetargeting...");
    }

    // verify that the proposed target matches the real target
    // assert(proposed_target == real_target);

    // [2] verify the proposed block height is one greater than previous_block_height
    assert(proposed_block.height as u32 == previous_block_height + 1);

    // [3] verify the proposed prev_block_hash matches real previous_block_hash
    for i in 0..32 {
        assert(proposed_block.prev_block_hash[i] == previous_block_hash[i]);
    }

    // [4] verify PoW (double sha256 + block_hash <= target)
    verify_PoW(proposed_block, proposed_target);
}

// LIBRARIES

struct FixedPoint {
    value: Field,
    scale: Field,
}

impl FixedPoint {
    pub fn new(value: Field, scale: Field) -> Self {
        FixedPoint { value, scale }
    }

    pub fn add(fixed1: FixedPoint, fixed2: FixedPoint) -> FixedPoint {
        assert(fixed1.scale == fixed2.scale, "Scale mismatch");
        FixedPoint {
            value: fixed1.value + fixed2.value,
            scale: fixed1.scale,
        }
    }

    pub fn subtract(fixed1: FixedPoint, fixed2: FixedPoint) -> FixedPoint {
        assert(fixed1.scale == fixed2.scale, "Scale mismatch");
        FixedPoint {
            value: fixed1.value - fixed2.value,
            scale: fixed1.scale,
        }
    }

    pub fn multiply(fixed1: FixedPoint, fixed2: FixedPoint) -> FixedPoint {
        assert(fixed1.scale == fixed2.scale, "Scale mismatch");
        // let scaled_value2 = scale_value(fixed2.value as u64, fixed2.scale as u64, fixed1.scale as u64);
        let product = fixed1.value * fixed2.value;

        FixedPoint {
            value: product,
            scale: fixed1.scale,
        }
    }


    pub fn divide(fixed1: FixedPoint, fixed2: FixedPoint) -> FixedPoint {
        assert(fixed1.scale == fixed2.scale, "Scale mismatch");
        assert(fixed2.value != 0, "Division by zero");
        let mut scaling_factor = 1;
        for _ in 0..fixed1.scale {
            scaling_factor *= 1;
        }
        FixedPoint {
            value: (fixed1.value * scaling_factor) / fixed2.value,
            scale: fixed1.scale,
        }
    }

    pub fn is_greater_than(fixed1: FixedPoint, fixed2: FixedPoint) -> bool {
        assert(fixed1.scale == fixed2.scale, "Scale mismatch");
        fixed1.value as u64 > fixed2.value as u64
    }
    pub fn is_lesser_than(fixed1: FixedPoint, fixed2: FixedPoint) -> bool {
        assert(fixed1.scale == fixed2.scale, "Scale mismatch");
        fixed1.value as u64 < fixed2.value as u64
    }
    pub fn power(base: FixedPoint, exponent: u32) -> FixedPoint {
        let mut result = base;

        // If exponent is 0, return 1 
        if exponent == 0 {
            result.value = 1;
            result.scale = base.scale;
        }

        // Starting the loop from 1 
        for _ in 1..exponent {
            result.value = result.value * base.value;
            result.scale = base.scale;
        }

        result
    }
}

// Helper function to scale the value
fn scale_value(value: u64, original_scale: u64, target_scale: u64) -> u64 {
    if target_scale > original_scale {
        let scale_increase = target_scale - original_scale;
        let mut scaling_factor = 1 as u64;
        for _ in 0..scale_increase {
            scaling_factor *= 10;
        }
        value * scaling_factor
    } else {
        value
    }
}
