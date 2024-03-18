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
        println("\nRETARGETING!");
        let new_target = calculate_retarget(retarget_block, proposed_block);
        // verify that the proposed target matches the real target
        // assert(proposed_target == new_target);
    }
    // verify PoW with double sha256 
}
