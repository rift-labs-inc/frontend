class DepositVault:
    def __init__(self, balance, rate):
        self.calculatedTrueUnreservedBalance = balance
        self.btcExchangeRate = rate

def find_optimal_vaults_improved(vaults, eth_swap_output, max_outputs):
    # Sort vaults by btcExchangeRate in descending order
    vaults_sorted = sorted(vaults, key=lambda x: x.btcExchangeRate, reverse=True)
    
    # Check feasibility: sum the maximum possible from the top max_outputs vaults
    feasible_sum = sum(min(v.calculatedTrueUnreservedBalance, eth_swap_output) 
                       for v in vaults_sorted[:max_outputs])
    if feasible_sum < eth_swap_output:
        return "Impossible", [], []

    # Initialize variables for tracking the best solution
    best_value = 0
    best_vaults = []
    best_amounts = []
    
    # Check combinations of vaults up to max_outputs
    from itertools import combinations
    for r in range(1, max_outputs + 1):
        for combo in combinations(vaults_sorted, r):
            current_value = 0
            current_amounts = []
            remaining_output = eth_swap_output
            
            # Calculate the maximum possible value with the current combination
            for vault in combo:
                if remaining_output <= 0:
                    break
                
                max_possible = min(vault.calculatedTrueUnreservedBalance, remaining_output)
                current_amounts.append(max_possible)
                current_value += max_possible * vault.btcExchangeRate
                remaining_output -= max_possible
            
            # Update the best solution found so far
            if current_value > best_value:
                best_value = current_value
                best_vaults = combo
                best_amounts = current_amounts
    
    # Create output format
    if best_value == 0:  # If no combination could approach the eth_swap_output
        return "Impossible", [], []

    vault_indices = [vaults.index(v) + 1 for v in best_vaults]  # Convert to 1-based index
    return vault_indices, best_amounts, best_value



# Example data and function call
vaults = [
    DepositVault(1200, 2143024),
    DepositVault(3000, 2803024),
    DepositVault(300, 2903024),
    DepositVault(2400, 2133024)
]
eth_swap_output = 30000
max_outputs = 2

print(find_optimal_vaults_improved(vaults, eth_swap_output, max_outputs))