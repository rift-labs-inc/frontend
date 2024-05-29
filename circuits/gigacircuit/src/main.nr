use dep::std;
use dep::rift_lib::byte_lib;
use dep::rift_lib::constants;
// mod sha256_vkhash_list;
// mod sha256_merkle;
// mod sha256_verify;
// mod txn_encoder;

fn main(
    //------- BLOCK VERIFICATION INPUTS -------
    proposed_block_hash_encoded: pub [Field; 2],
    safe_block_hash_encoded: pub [Field; 2],
    safe_block_height: pub u64,
    block_height_delta: pub u64,
    //------- PAYMENT VERIFICATION INPUTS -------
    merkle_root: pub [Field; 2]
) {
    //------------------ MAIN CIRCUIT ------------------
    // [0] verify block data
    // [1] verify payment data
}

