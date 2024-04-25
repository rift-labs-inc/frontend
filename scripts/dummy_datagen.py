import json
import random
from datetime import datetime, timedelta
from bit import Key
from eth_account import Account
import pyperclip

def generate_random_timestamp():
    """Generate a random timestamp from the last month."""
    end_time = datetime.now()
    start_time = end_time - timedelta(days=1)
    random_date = start_time + (end_time - start_time) * random.random()
    return int(random_date.timestamp())

def generate_ethereum_transaction(amount_min, amount_max):
    """Generate an Ethereum transaction object with a random amount in the specified range."""
    account = Account.create()
    to_account = Account.create()
    if random.choice([True, False]):  # 50% chance to choose between integer or floating-point
        amount = random.randint(int(amount_min), int(amount_max))
    else:
        amount = random.uniform(amount_min, amount_max)
    transaction = {
        'nonce': 0,
        'gasPrice': 20000000000,  # Standard gas price in wei
        'gas': 21000,             # Standard gas limit for a simple transaction
        'to': to_account.address,
        'value': int(amount * 1e18),  # Convert ETH to wei
        'data': b''
    }
    signed_txn = Account.sign_transaction(transaction, account._private_key)
    return {
        "timestamp": generate_random_timestamp(),
        "from_address": account.address,
        "to_address": to_account.address,
        "txn_hash": signed_txn.hash.hex(),
        "lp_fee": str(round(random.uniform(0.01, 1), 2)),
        "amount": str(amount),
        "asset": "ETH",
        "status": random.choice(["Swapping", "Completed"])
    }

def generate_bitcoin_transaction(amount_min, amount_max):
    """Generate a Bitcoin transaction object with a random amount in the specified range."""
    key = Key()
    to_key = Key()
    if random.choice([True, False]):  # 50% chance to choose between integer or floating-point
        amount = random.randint(int(amount_min), int(amount_max))
    else:
        amount = random.uniform(amount_min, amount_max)
    return {
        "timestamp": generate_random_timestamp(),
        "from_address": key.address,
        "to_address": to_key.address,
        "txn_hash": key.sign(b"").hex(),
        "lp_fee": str(round(random.uniform(0.01, 1), 10)),
        "amount": str(amount),
        "asset": "BTC",
        "status": random.choice(["Swapping", "Completed"])
    }

def create_activity(eth_amount_range, btc_amount_range, num_entries):
    """Create the activity object with random amounts and specified number of entries, sorted by timestamp."""
    activity = []
    for _ in range(num_entries):
        activity.append(generate_ethereum_transaction(*eth_amount_range))
        activity.append(generate_bitcoin_transaction(*btc_amount_range))
    
    # Sort activity list by timestamp in descending order (most recent first)
    sorted_activity = sorted(activity, key=lambda x: x["timestamp"], reverse=True)

    json_data = json.dumps(sorted_activity, indent=4)
    # Remove surrounding brackets and add a comma at the end
    formatted_data = '"activity": [' + json_data[1:-1] + '],'
    pyperclip.copy(formatted_data)
    print("Activity JSON has been copied to your clipboard!")
    return formatted_data

# Example usage
eth_amount_range = (0.01, 1000)  # Ethereum amounts will vary from 0.01 to 1000 ETH
btc_amount_range = (0.01, 200)  # Bitcoin amounts will vary from 0.01 to 200 BTC
num_entries = 200  # You can change this value to generate more or fewer transactions
create_activity(eth_amount_range, btc_amount_range, num_entries)
