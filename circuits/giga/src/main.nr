use dep::std;
//  TODO: Make these real
global payment_key_hash: Field = 0x0;
// TODO: Generate list of possible 34? circuit key hashes
global block_key_hash: Field = 0x1;

// Aggregates Block Verification 
fn main(
    // Payment Verification (public inputs)
    lp_balances_hash: pub [Field; 2],
    swap_output: pub Field,
    // Block Verification (public inputs)
    safe_block_hash_encoded: pub [Field; 2],
    retarget_block_hash_encoded: pub [Field; 2],
    safe_block_height: pub Field,
    txn_block_height_delta: pub Field,
    // Shared (public inputs)
    txn_block_hash_encoded: pub [Field; 2],
    // Proof Data
    payment_verification_key: [Field; 114],
    payment_proof: [Field; 93],
    block_verification_key: [Field; 114],
    block_proof: [Field; 93]
) {
    // Payment Verification
    let mut payment_pub_input: [Field] = &[
        txn_block_hash_encoded[0],
        txn_block_hash_encoded[1],
        lp_balances_hash[0],
        lp_balances_hash[1],
        swap_output
    ];

    std::verify_proof(
        payment_verification_key.as_slice(),
        payment_proof.as_slice(),
        payment_pub_input,
        payment_key_hash
    );

    // Block Verification
    let mut block_pub_input: [Field] = &[
		txn_block_hash_encoded[0],
		txn_block_hash_encoded[1],
		safe_block_hash_encoded[0],
		safe_block_hash_encoded[1],
		retarget_block_hash_encoded[0],
		retarget_block_hash_encoded[1],
		safe_block_height,
		txn_block_height_delta
	];

    std::verify_proof(
        block_verification_key.as_slice(),
        block_proof.as_slice(),
        block_pub_input,
        block_key_hash
    );
}

