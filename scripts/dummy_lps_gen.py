import json
import random
from datetime import datetime, timedelta
from eth_account import Account
import pyperclip  # Library to copy text to clipboard

def generate_random_timestamp():
    """Generate a random timestamp from the last 30 days."""
    now = datetime.now()
    start = now - timedelta(days=30)
    random_time = start + (now - start) * random.random()
    return int(random_time.timestamp())

def generate_random_lp_data(num_records):
    assets = ["WBTC", "ETH"]
    statuses = ["available", "reserved"]
    data = []

    for _ in range(num_records):
        account = Account.create()
        data.append({
            "timestamp": generate_random_timestamp(),
            "lp": account.address,
            "lp_fee": str(round(random.uniform(-0.2, 5.0), 2)),
            "amount": str(round(random.uniform(0.01, 1000.0), 5)),
            "asset": random.choice(assets),
            "status": random.choice(statuses)
        })

    return data

def main():
    num_records = 100  # number of records to generate
    liquidity_data = generate_random_lp_data(num_records)
    json_output = json.dumps({"liquidity": liquidity_data}, indent=4)
    pyperclip.copy(json_output[1:-1])  # Copying data to the clipboard without the first and last character
    print("Liquidity provider data has been copied to your clipboard!")

if __name__ == "__main__":
    main()
