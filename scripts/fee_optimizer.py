def ptas_lps(LPs, ETH_needed, epsilon):
    # Scaling factor based on epsilon
    K = 1 / epsilon

    # Scaling down the ETH amounts
    scaled_LPs = [(fee, int(amount // K), lp_id) for fee, amount, lp_id in LPs]
    scaled_ETH_needed = int(ETH_needed // K)

    # Using a simplified dynamic programming approach on scaled values
    N = len(scaled_LPs)
    dp = [[float('inf')] * (scaled_ETH_needed + 1) for _ in range(N + 1)]
    dp[0][0] = 0

    for i in range(1, N + 1):
        fee, amount, _ = scaled_LPs[i-1]
        for j in range(scaled_ETH_needed + 1):
            dp[i][j] = dp[i-1][j]  # Not using LP i
            for k in range(1, min(amount, j) + 1):
                fee_cost = (k * K) * fee / 100  # Scaling back up the transaction volume
                if j >= k:
                    dp[i][j] = min(dp[i][j], dp[i-1][j-k] + fee_cost + 0.0001 * K)

    # Finding the minimum cost to get at least scaled_ETH_needed
    min_cost = min(dp[N][j] for j in range(scaled_ETH_needed, scaled_ETH_needed + 1))
    final_cost = min_cost if min_cost != float('inf') else "Cannot fulfill the order"

    return final_cost * K  # Scaling the cost back up

# Example usage
LPs = [(0.05, 1.2, "LP1"), (0.2, 8, "LP2"), (0.01, 0.03, "LP3")]
epsilon = 0.1  # 10% approximation
result = ptas_lps(LPs, 5, epsilon)
print(result)
