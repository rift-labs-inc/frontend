import requests
import hashlib
import os

import requests
import os

def hex_to_u8_array(hex_str):
    """Convert a hex string to a Rust-like [u8; 32] array representation."""
    bytes_array = bytes.fromhex(hex_str)
    return '[' + ', '.join(f'0x{byte:02x}' for byte in bytes_array) + ']'

def fetch_block_data(block_hash, proposed_txn_hash):
    """Fetch the transaction hashes and Merkle root for a given block hash from blockchain.info,
    including a proposed transaction hash."""
    url = f"https://blockchain.info/rawblock/{block_hash}"
    response = requests.get(url)
    block_data = response.json()
    
    # Extract the list of transaction hashes and convert them
    txn_hashes = [hex_to_u8_array(txn['hash']) for txn in block_data['tx']]
    
    # Pad the list to 10,000 transactions with '0' * 64 converted
    padded_txn_hashes = txn_hashes + [hex_to_u8_array('0' * 64)] * (5000 - len(txn_hashes))
    
    # Extract and convert the Merkle root
    merkle_root = hex_to_u8_array(block_data['mrkl_root'])
    
    # Convert the proposed transaction hash
    proposed_txn = hex_to_u8_array(proposed_txn_hash)
    
    # Locate local directory and save to txns.txt
    output_location = os.path.dirname(os.path.realpath(__file__))
    with open(f"{output_location}/../circuits/txn_verification/Prover.toml", "w") as f:
        # Write Merkle root and proposed transaction in the specified format
        f.write(f"merkle_root = {merkle_root}\n")
        f.write(f"proposed_txn = {proposed_txn}\n")
        # Write transaction hashes in the specified format
        for i, txn_hash in enumerate(padded_txn_hashes):
            f.write(f"[[txn_hashes]] # TXN[{i}]\nhash = {txn_hash}\n")
        
    txn_hashes = [txn['hash'] for txn in block_data['tx']]
    merkle_root = (block_data['mrkl_root'])


    return txn_hashes, merkle_root

def hash_pairs(hex_str1, hex_str2):
    """Hash two hex strings together using double SHA-256 and return the hex result."""
    # Convert hex strings to binary, in little-endian format
    bin1 = bytes.fromhex(hex_str1)[::-1]
    bin2 = bytes.fromhex(hex_str2)[::-1]
    
    # Combine the binary data
    combined = bin1 + bin2
    
    # Double SHA-256 hashing
    hash_once = hashlib.sha256(combined).digest()
    hash_twice = hashlib.sha256(hash_once).digest()
    
    # Return the result as a hex string, in little-endian format
    return hash_twice[::-1].hex()


def generate_merkle_proof(txn_hashes, target_hash):
    """Generate a Merkle proof for the target hash."""
    proof = []
    target_index = txn_hashes.index(target_hash)
    while len(txn_hashes) > 1:
        new_level = []
        if len(txn_hashes) % 2 == 1:
            txn_hashes.append(txn_hashes[-1])
        for i in range(0, len(txn_hashes), 2):
            left, right = txn_hashes[i], txn_hashes[i+1]
            if i <= target_index < i+2:
                if target_index == i:
                    proof.append((right, 'right'))
                else:
                    proof.append((left, 'left'))
                target_hash = hash_pairs(left, right)
            new_level.append(hash_pairs(left, right))
        txn_hashes = new_level
        target_index //= 2
    print(f"Proof: {proof}")
    return proof

def verify_merkle_proof(target_hash, proof, merkle_root):
    """Verify the Merkle proof for the target hash."""
    current_hash = target_hash
    for sibling_hash, direction in proof:
        if direction == 'left':
            current_hash = hash_pairs(sibling_hash, current_hash)
        else:
            current_hash = hash_pairs(current_hash, sibling_hash)
    return current_hash == merkle_root

# Example usage
block_hash = "0000000000000bae09a7a393a8acded75aa67e46cb81f7acaa5ad94f9eacd103"
proposed_txn_hash = "a9300383c7b0f5fc03d495844420f25035c34c4c1abb0bdb43fed1d491bbb5e2"

# Fetch data
txn_hashes, merkle_root = fetch_block_data(block_hash, proposed_txn_hash)

# [0] generate merkle proof from txn_hashes
proof = generate_merkle_proof(txn_hashes, proposed_txn_hash)

# [1] verify the merkle proof
is_valid = verify_merkle_proof(proposed_txn_hash, proof, merkle_root)
print(f"\nIs the Merkle proof valid? {is_valid}")

# test what hash_pairs returns
print(f"merkle root: {merkle_root}")
print(f"proposed txn hash: {proposed_txn_hash}")
print(f"\nHash pairs of merkle root + proposed txn hash:\n{hash_pairs(merkle_root, proposed_txn_hash)}")
