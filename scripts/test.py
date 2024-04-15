import requests
import matplotlib.pyplot as plt

def get_block_data(block_hash):
    # API endpoint to get block data
    url = f"https://blockchain.info/rawblock/{block_hash}"
    
    # Sending request to the Blockchain API
    response = requests.get(url)
    
    # Checking if the request was successful
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to retrieve data for block {block_hash}: {response.status_code}")
        return None

def analyze_transactions(block_data):
    # Extract transaction sizes and hashes
    transactions = [{'size': tx['size'], 'hash': tx['hash']} for tx in block_data['tx']]
    return transactions

def main(block_hashes):
    all_transactions = []
    
    for block_hash in block_hashes:
        # Get block data using the block hash
        block_data = get_block_data(block_hash)
        
        if block_data:
            # Analyze transactions to collect all sizes
            transactions = analyze_transactions(block_data)
            all_transactions.extend(transactions)

            # Print a summary for the current block
            print(f"Block {block_hash} processed.")
        else:
            print(f"No data available for block {block_hash}.")

    # Plot the distribution of transaction sizes if data is available
    if all_transactions:
        sizes = [tx['size'] for tx in all_transactions]
        plt.figure(figsize=(10, 6))
        plt.hist(sizes, bins=30, color='blue', alpha=0.7)
        plt.title('Distribution of Transaction Sizes')
        plt.xlabel('Transaction Size (bytes)')
        plt.ylabel('Frequency')
        plt.grid(True)
        plt.show()
    else:
        print("No transaction data was processed.")



# List of block hashes (replace or extend this list with your own block hashes)
block_hashes = [
    '0000000000000000000013ac5df98cbfe2ab0c7a14972b7593f0f72066004cde',
    '00000000000000000002f1c7770955748d95969f83cba2a1cd36704306b6399f',
    '00000000000000000001b16c81841e93520cc0cbf663f1ed0315ba81b6997538',
    '0000000000000000000150325b352c0498bd6b75f56e03974697bc507bdece07',
    '00000000000000000000143e2b76547b5979e2c1f8626efc421dec7c4e655664',
    '00000000000000000001f8354b548396852d255d80e4ce3880e85a537a20fd4f',
    '0000000000000000000129a95cda0bcb6e656e7b4a045f853bf19291a6e17980',
    '00000000000000000001de12cd0a553134e5e83b29244ad09feb1496aa6b3f36',
    '0000000000000000000239e7c785f3b30bf19eafffba6313715cab4fa2c48e86',
    '00000000000000000000773eecd1cb6252aaaadad4ee95e00963f4414c12542a'
]
main(block_hashes)
