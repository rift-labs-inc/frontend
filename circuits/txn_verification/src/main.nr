use dep::std;

struct TXN {
    hash: [u8; 32],
}

fn main(
    merkle_root: [u8; 32], // from contract
    proposed_txn: [u8; 32], // from indexer
    txn_hashes: [TXN; 5000], // from indexer
) {
    //------------------ MAIN CIRCUIT ------------------
    println("Starting main circuit");

    // hash_pairs(merkle_root, proposed_txn);
    // [0] generate_merkle_proof with txn_hashes
    let proof = generate_merkle_proof(txn_hashes, proposed_txn);

    // [1] verify merkle root matches

}


fn generate_merkle_proof(txn_hashes: [TXN; 5000], target_hash: [u8; 32]) -> Vec<([Field; 32], [u8; 5])> {
    let mut proof: Vec<([Field; 32], [u8; 5])> = Vec::new();
    let zero_hash = [0; 32];
    let mut current_hashes: Vec<[Field; 32]> = Vec::new();

    for i in 0..5000 {
        let mut hash = [0; 32];
        for j in 0..32 {
            hash[j] = txn_hashes[i * 32 + j].hash as Field;
        }
        current_hashes.push(hash);
    }

    let mut target_index = -1;
    for i in 0..current_hashes.len() {
        if current_hashes.get(i) == target_hash {
            target_index = i as i32;
            break;
        }
    }

    if target_index != -1 {
        while current_hashes.len() > 1 {
            let mut new_level: Vec<[Field; 32]> = Vec::new();

            if current_hashes.len() % 2 == 1 {
                current_hashes.push(current_hashes.get(current_hashes.len() - 1));
            }

            let mut i = 0;
            while i < current_hashes.len() {
                let left = current_hashes.get(i);
                let right = current_hashes.get(i + 1);

                if left != zero_hash && right != zero_hash {
                    if i <= target_index as u32 && target_index < i as i32 + 2 {
                        if target_index == i as i32 {
                            proof.push((right, "right".to_owned().try_into().unwrap()));
                        } else {
                            proof.push((left, "left".to_owned().try_into().unwrap()));
                        }
                        target_hash = hash_pairs(left, right);
                    }

                    new_level.push(hash_pairs(left, right));
                }

                i += 2;
            }

            current_hashes = new_level;
            target_index /= 2;
        }
    }

    proof
}

fn hash_pairs(hash_1: [u8; 32], hash_2: [u8; 32]) -> [Field; 32] {
    // [0] convert hashes to little-endian
    let mut hash1: [u8; 32] = [0; 32];
    let mut hash2: [u8; 32] = [0; 32];
    for i in 0..32 {
        hash1[i] = (hash_1[31 - i] as u8);
        hash2[i] = (hash_2[31 - i] as u8);
    }
    
    // print input hashes
    println("\nhash1: ");
    for i in 0..32 {
        print(hash1[i] as Field);
        print(", ");
    }
    println("\nhash2: ");
    for i in 0..32 {
        print(hash2[i] as Field);
        print(", ");
    }
    
    // [1] combine hashes into one 64 byte array
    let mut combined_hashes: [u8; 64] = [0; 64];
    for i in 0..32 {
        combined_hashes[i] = hash1[i];
        combined_hashes[i+32] = hash2[i];
    }

    // [2] double sha256 combined hashes
    let first_hash = std::hash::sha256(combined_hashes);
    let new_hash_be = std::hash::sha256(first_hash);

    // [3] convert new hash to little-endian
    let mut new_hash: [Field; 32] = [0; 32];
    for i in 0..32 {
        new_hash[i] = (new_hash_be[31 - i] as u8) as Field;
    }

    // print new hash
    println("\nnew_hash: ");
    for i in 0..32 {
        print(new_hash[i] as Field);
        print(", ");
    }

    new_hash
}

