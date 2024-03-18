use dep::std;

struct ProposedBlock {
    block_hash: [u8; 32],
    height: u32,
    version: u32,
    prev_block_hash: [u8; 32],
    merkle_root: [u8; 32],
    timestamp: u32,
    bits: u32,
    nonce: u32,
}

struct RetargetBlock {
    bits: u32,
    height: u32,
    timestamp: u32
}

struct Txn {
    hash: [u8; 32]
}

fn bits_to_target(bits: u32) -> Field {
    let exponent = (bits as u32) >> 24;
    let coefficient = (bits as u32) & 0xffffff;
    let target = (coefficient as Field) * 2.pow_32(8 * ((exponent as Field) - 3));
    target
}

fn calculate_retarget(start_block_height: u32, end_block_height: u32, bits: u32) -> Field {
    let old_target = bits_to_target(bits);

    // let actual_timespan = end_block_height - start_block_height;

    // if actual_timespan < TARGET_TIMESPAN / 4 {
    //     actual_timespan = TARGET_TIMESPAN / 4;
    // } else if actual_timespan > TARGET_TIMESPAN * 4 {
    //     actual_timespan = TARGET_TIMESPAN * 4;
    // }

    // let new_target = (old_target * adjusted_timespan) / target_timespan;

    old_target
}

fn main(
    // From contract, must be passed by indexer when creating proof. However, in contract verify: // contract passes this data directly:
    previous_block_hash: pub [u8; 32],
    previous_block_height: pub u32,
    retarget_block: pub RetargetBlock,
    // Passed straight from indexer (indexer → sol contract → verification contract)
    proposed_block: pub ProposedBlock,
    // Passed by indexer but NOT as public witness:
    txns: [Txn; 4000]
) {
    let TARGET_PERIOD = 2016;
    let TARGET_TIMESPAN = TARGET_PERIOD * 600; // 2 weeks

    println(retarget_block.bits);
    // CIRCUIT BEGINS
    // let proposed_target = bits_to_target(proposed_block.bits);
    // if (proposed_block.height == retarget_block.height + TARGET_PERIOD) {
    //     // time to retarget
    //     let updated_target = calculate_retarget(
    //         retarget_block.height,
    //         proposed_block.height - 1,
    //         retarget_block.bits
    //     );
    //     println(proposed_target);
    //     println(updated_target);
    //     // verify that the proposed target matches the real target
    //     assert(proposed_target == updated_target);
    // }
    // assert that input bits matches the true target based on the last retarget block height
}
