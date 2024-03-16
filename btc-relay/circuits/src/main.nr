use dep::std;

// convert bits to target
fn bits_to_target(bits: u32) -> Field {
    let exponent = (bits as u32) >> 24;
    let coefficient = (bits as u32) & 0xffffff;
    let target = (coefficient as Field) * 2.pow_32(8 * ((exponent as Field) - 3));
    target
}

fn calculate_retarget(start_block_height: u32, end_block_height: u32, bits: u32) -> Field {
    // calculate the actual target based on the proposed block height and last retarget block height
    println(start_block_height);
    start_block_height as Field
}

fn main() {
    // PUBLIC WITNESS INPUTS (TESTING)
    let bits_proposed = 386095705;
    let current_block_height_proposed = 4032;

    let TARGET_PERIOD = 2016;
    let TARGET_TIMESPAN = TARGET_PERIOD * 600; // 2 weeks

    let real_target_from_contract = 0x35a590000000000000000000000000000000000000000;
    let last_retarget_block_height_from_contract = 2016;

    // CIRCUIT BEGINS
    let proposed_target = bits_to_target(bits_proposed);
    if (current_block_height_proposed == last_retarget_block_height_from_contract + TARGET_PERIOD) {
        // time to retarget
        let updated_target = calculate_retarget(
            last_retarget_block_height_from_contract,
            current_block_height_proposed - 1,
            bits_proposed
        );
        println(proposed_target);
        println(updated_target);

        // verify that the proposed target matches the real target
        assert(proposed_target == updated_target);
    }
    // assert that input bits matches the true target based on the last retarget block height
}
