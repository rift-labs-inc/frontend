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

fn calculate_retarget(retarget_block: RetargetBlock, proposed_block: ProposedBlock) -> Float {
    // calculate the new target based on the retarget block and the proposed block

    let mut actual_time = proposed_block.timestamp as u32 - retarget_block.timestamp as u32;

    if actual_time < TARGET_TIMESPAN / 4 {
        actual_time = TARGET_TIMESPAN / 4;
    } else if actual_time > TARGET_TIMESPAN * 4 {
        actual_time = TARGET_TIMESPAN * 4;
    }

    let actual_time = 1343368;

    let old_target = bits_to_target(retarget_block.bits) as Field;
    let old_target_float = Float { sign: 0, mantissa: old_target, exponent: 100 };
    let actual_time_float = Float { sign: 0, mantissa: actual_time as Field, exponent: 100 };
    let expected_time_float = Float { sign: 0, mantissa: TARGET_TIMESPAN as Field, exponent: 100 };
    let ratio = divFloats(actual_time_float, expected_time_float);
    let real_target = mulFloats(old_target_float, ratio);

    println("actual_time: ");
    println(actual_time as u64);
    println("actual_time float: ");
    println(actual_time_float);
    println("expected_time: ");
    println(TARGET_TIMESPAN);
    println("Expected time float: ");
    println(expected_time_float);
    println("Ratio: ");
    println(ratio);
    println("expected target: ");
    println("0x3f07e0000000000000000000000000000000000000000");
    println("Real target: ");
    println(real_target);

    // real_target
    old_target_float
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

    // println("Proposed bits: ");
    // println(proposed_block.bits as u32);
    // println("Proposed target: ");
    // println(proposed_target);
    // println("Real target: ");
    // println(real_target);

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

// Struct representing float numbers using sign, mantissa and exponent.
// When Noir language gets the update to support signed integers, the sign field will be removed
struct Float {
    sign: Field,
    mantissa: Field,
    exponent: Field,
}

// Float number precision of mantissa
global precision : Field = 20;

// ReLU activation function used for neural network ML models
fn relu(x: Float) -> Float {
    let mut res = x;
    if x.sign as u64 == 1 {
        res = Float { sign: 0, mantissa: 0, exponent: 100 };
    }

    res
}

// Truncate Float to "precision" number of digits, 5 in the example
fn truncate(num: Float) -> Float {
    let lookup : [Field; 25] = [
        1,
        10,
        100,
        1000,
        10000,
        100000,
        1000000,
        10000000,
        100000000,
        1000000000,
        10000000000,
        100000000000,
        1000000000000,
        10000000000000,
        100000000000000,
        1000000000000000,
        10000000000000000,
        100000000000000000,
        1000000000000000000,
        10000000000000000000,
        100000000000000000000,
        1000000000000000000000,
        10000000000000000000000,
        100000000000000000000000,
        1000000000000000000000000
    ];

    let maxValue : Field = 10.pow_32(precision);
    let mut decValue : Field = 1;
    let mut logValue : Field = 0;

    for i in 0..25 {
        if num.mantissa as u64 >= lookup[i] as u64 {
            decValue = lookup[i];
            logValue = i;
        }
    }

    decValue *= 10;
    logValue += 1;

    let mut res : Float = Float { sign: num.sign, mantissa: num.mantissa, exponent: num.exponent };

    if logValue as u64 > precision as u64 {
        let diff = (decValue / maxValue) as u64;
        res = Float { sign: num.sign, mantissa: (num.mantissa as u64 / diff) as Field, exponent: num.exponent + (logValue - precision)}; // 
    }

    if res.mantissa == 0 {
        res = Float { sign: res.sign, mantissa: 0, exponent: 100 };
    }

    res
}

// Multiplication of Float numbers
fn mulFloats(x: Float, y: Float) -> Float {
    let mant = x.mantissa * y.mantissa;
    let exp = x.exponent + y.exponent - 100;
    let mut sign : Field = 0;

    if x.sign != y.sign {
        sign = 1;
    }

    truncate(Float { sign, mantissa: mant, exponent: exp })
}

// Dividing of Float numbers
fn divFloats(x: Float, y: Float) -> Float {
    assert(y.mantissa as u64 > 0);

    let mut exp1: Field = x.exponent;
    let mut mant1: u64 = x.mantissa as u64;

    let exp2: Field = y.exponent;
    let mant2: Field = y.mantissa;

    // Can't divide lower by higher number with same precision, result will be 0
    // The lower must be multiplied by 10, it means at the same time exponent must be reduced by 1
    if mant1 < mant2 as u64 {
        mant1 *= 10;
        exp1 -= 1;
    }

    let mut new_mant: u64 = 0;
    for i in 0..7 {
        let div = mant1 / mant2 as u64;
        mant1 = (mant1 - mant2 as u64 * div) * 10;

        // For precision N, the highest exponent is 10^(N-1)
        let exp = precision - i - 1;
        let pow = 10.pow_32(exp) as u64;
        new_mant += div * pow;
    }

    let new_exp = 100 + exp1 - exp2 - precision + 1;

    let mut new_sign : Field = 0;

    if x.sign as u64 != y.sign as u64 {
        new_sign = 1;
    }

    Float { sign: new_sign, mantissa: new_mant as Field, exponent: new_exp }
}

// Sumation of Float numbers
fn addFloats(x: Float, y: Float) -> Float {
    let mut mant_1 = x.mantissa;
    let mut mant_2 = y.mantissa;

    let mut exp_1 = x.exponent;
    let mut exp_2 = y.exponent;

    let mut diff : Field = 0;

    if exp_1 as u64 > exp_2 as u64 {
        diff = exp_1 - exp_2;
    } else {
        diff = exp_2 - exp_1;
    }

    let mut pow10 : Field = 10.pow_32(diff);

    if x.exponent as u64 < y.exponent as u64 {
        mant_2 *= pow10;
        exp_1 = x.exponent;
    } else {
        mant_1 *= pow10;
        exp_1 = y.exponent;
    }

    let mut sum_mant = mant_1 + mant_2;
    let mut sign = x.sign;

    if x.sign != y.sign {
        if mant_1 as u64 > mant_2 as u64 {
            sum_mant = mant_1 - mant_2;
        } else {
            sum_mant = mant_2 - mant_1;
            sign = y.sign;
        }
    }

    truncate(Float { sign, mantissa: sum_mant, exponent: exp_1 })
}

// Subtraction of float numbers
fn subFloats(x: Float, y: Float) -> Float {
    addFloats(
        x,
        Float { sign: 1 - y.sign, mantissa: y.mantissa, exponent: y.exponent }
    )
}
