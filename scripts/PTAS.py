import time

def ptas_lps_detailed(LPs, ETH_needed, epsilon, LP_output_eth_cost):
    # Scaling factor based on epsilon
    K = 1 / epsilon

    # Rearrange LPs data and scale down the ETH amounts
    scaled_LPs = [(lp_id, int(amount * K), fee) for lp_id, amount, fee in LPs]
    scaled_ETH_needed = int(ETH_needed * K)

    # Using a simplified dynamic programming approach on scaled values
    N = len(scaled_LPs)
    dp = [[(float('inf'), [])] * (scaled_ETH_needed + 1) for _ in range(N + 1)]
    dp[0][0] = (0, [])  # (cost, list of LPs used)

    for i in range(1, N + 1):
        lp_id, amount, fee = scaled_LPs[i-1]
        for j in range(scaled_ETH_needed + 1):
            # Not using LP i
            dp[i][j] = dp[i-1][j]
            
            # Using LP i
            for k in range(1, min(amount, j) + 1):
                fee_cost = (k / K) * fee / 100  # Correcting the scaling of fee calculation
                gas_cost = 0.0001 if lp_id not in [lp[0] for lp in dp[i-1][j-k][1]] else 0  # Only add gas if LP wasn't used before
                new_cost = dp[i-1][j-k][0] + fee_cost + gas_cost
                if new_cost < dp[i][j][0]:
                    dp[i][j] = (new_cost, dp[i-1][j-k][1] + [(lp_id, k / K, fee, fee_cost)])

    # Finding the minimum cost to get at least scaled_ETH_needed
    min_cost, used_LPs_details = min((dp[N][j] for j in range(scaled_ETH_needed, scaled_ETH_needed + 1)), key=lambda x: x[0])
    if min_cost == float('inf'):
        return "Cannot fulfill the order", 0, 0, 0

    # Calculate total fees and gas separately, and weighted average fee
    total_fees = sum(lp[3] for lp in used_LPs_details)
    total_gas = len(used_LPs_details) * LP_output_eth_cost  # Gas cost per LP used
    total_ETH_used = sum(lp[1] for lp in used_LPs_details)
    weighted_avg_fee = sum(lp[1] * lp[2] for lp in used_LPs_details) / total_ETH_used if total_ETH_used > 0 else 0

    return min_cost, used_LPs_details, total_fees, total_gas, len(used_LPs_details), weighted_avg_fee

LPs = [('LP1', 639.43, 0.13), ('LP2', 275.04, 1.12), ('LP3', 736.47, 3.39), ('LP4', 892.18, 0.44), ('LP5', 421.93, 0.16), ('LP6', 218.65, 2.53), ('LP7', 26.55, 1.0), ('LP8', 649.89, 2.73), ('LP9', 220.45, 2.95), ('LP10', 809.43, 0.04), ('LP11', 805.82, 3.49), ('LP12', 340.26, 0.79), ('LP13', 957.21, 1.69), ('LP14', 92.75, 0.49), ('LP15', 847.5, 3.02), ('LP16', 807.13, 3.65), ('LP17', 536.23, 4.87), ('LP18', 378.54, 2.76), ('LP19', 829.41, 3.1), ('LP20', 861.71, 2.89), ('LP21', 704.57, 0.24), ('LP22', 227.91, 1.45), ('LP23', 79.8, 1.17), ('LP24', 101.01, 1.4), ('LP25', 635.69, 1.83), ('LP26', 370.19, 1.06), ('LP27', 266.99, 4.68), ('LP28', 648.04, 3.05), ('LP29', 171.15, 3.65), ('LP30', 163.41, 1.9), ('LP31', 989.52, 3.2), ('LP32', 556.95, 3.43), ('LP33', 842.85, 3.88), ('LP34', 229.06, 0.17), ('LP35', 315.46, 1.35), ('LP36', 210.99, 4.72), ('LP37', 876.37, 1.58), ('LP38', 655.44, 1.98), ('LP39', 914.55, 2.3), ('LP40', 264.89, 1.24), ('LP41', 561.37, 1.32), ('LP42', 584.59, 4.49), ('LP43', 399.41, 1.1), ('LP44', 997.54, 2.55), ('LP45', 90.92, 0.25), ('LP46', 109.66, 3.14), ('LP47', 792.08, 2.12), ('LP48', 63.54, 1.91), ('LP49', 996.12, 2.65), ('LP50', 971.08, 4.31), ('LP51', 11.49, 3.61), ('LP52', 681.71, 2.69), ('LP53', 266.83, 3.21), ('LP54', 111.56, 2.18), ('LP55', 453.73, 4.77), ('LP56', 875.85, 1.32), ('LP57', 500.59, 0.9), ('LP58', 912.63, 4.35), ('LP59', 298.45, 3.2), ('LP60', 608.97, 0.77), ('LP61', 762.51, 2.7), ('LP62', 778.63, 2.66), ('LP63', 0.58, 1.63), ('LP64', 19.49, 4.65), ('LP65', 878.72, 4.16), ('LP66', 307.52, 0.3), ('LP67', 878.01, 4.74), ('LP68', 85.66, 2.44), ('LP69', 69.22, 3.81), ('LP70', 765.84, 0.65), ('LP71', 475.29, 2.75), ('LP72', 265.06, 4.36), ('LP73', 423.14, 1.07), ('LP74', 539.3, 3.65), ('LP75', 201.16, 1.57), ('LP76', 995.15, 3.25), ('LP77', 438.11, 2.59), ('LP78', 121.01, 1.13), ('LP79', 338.09, 2.95), ('LP80', 230.12, 1.11), ('LP81', 71.0, 3.16), ('LP82', 228.95, 4.53), ('LP83', 859.64, 0.36), ('LP84', 238.01, 3.35), ('LP85', 214.24, 0.67), ('LP86', 935.51, 2.86), ('LP87', 472.68, 3.93), ('LP88', 807.5, 0.96), ('LP89', 96.94, 2.16), ('LP90', 423.58, 2.34), ('LP91', 729.08, 3.37), ('LP92', 984.17, 0.5), ('LP93', 402.63, 1.7), ('LP94', 861.67, 1.25), ('LP95', 190.22, 2.25), ('LP96', 421.89, 1.4), ('LP97', 249.81, 4.62), ('LP98', 443.14, 4.31), ('LP99', 550.33, 0.26), ('LP100', 999.28, 4.18), ('LP101', 969.0, 4.63), ('LP102', 848.7, 0.84), ('LP103', 485.65, 1.08), ('LP104', 401.05, 0.3), ('LP105', 378.98, 4.93), ('LP106', 265.21, 3.92), ('LP107', 455.01, 2.12), ('LP108', 957.32, 4.98), ('LP109', 555.77, 3.59), ('LP110', 154.81, 1.49), ('LP111', 968.71, 2.9), ('LP112', 542.2, 3.74), ('LP113', 57.17, 2.93), ('LP114', 502.86, 4.27), ('LP115', 157.44, 4.8), ('LP116', 80.12, 0.94), ('LP117', 595.04, 3.38), ('LP118', 235.21, 0.61), ('LP119', 890.29, 1.24), ('LP120', 594.52, 3.1), ('LP121', 419.23, 2.92), ('LP122', 522.79, 4.67), ('LP123', 204.27, 3.58), ('LP124', 238.69, 1.98), ('LP125', 671.69, 1.51), ('LP126', 316.18, 3.76), ('LP127', 72.55, 2.3), ('LP128', 998.45, 4.98), ('LP129', 73.27, 1.07), ('LP130', 265.21, 4.67), ('LP131', 880.87, 4.4), ('LP132', 369.53, 0.8), ('LP133', 833.75, 3.52), ('LP134', 611.68, 4.94), ('LP135', 653.98, 0.05), ('LP136', 817.11, 1.5), ('LP137', 663.39, 4.7), ('LP138', 134.3, 0.59), ('LP139', 107.04, 2.77), ('LP140', 272.36, 3.03), ('LP141', 717.62, 1.03), ('LP142', 634.24, 1.33), ('LP143', 488.54, 4.53), ('LP144', 846.11, 0.47), ('LP145', 423.58, 1.39), ('LP146', 3.56, 3.86), ('LP147', 637.12, 1.32), ('LP148', 741.23, 2.76), ('LP149', 427.69, 0.06), ('LP150', 75.25, 4.42), ('LP151', 903.93, 2.73), ('LP152', 834.6, 2.92), ('LP153', 148.1, 0.65), ('LP154', 308.27, 4.5), ('LP155', 796.12, 4.3), ('LP156', 898.93, 1.06), ('LP157', 249.54, 0.52), ('LP158', 780.12, 4.42), ('LP159', 406.38, 3.11), ('LP160', 154.56, 4.65), ('LP161', 864.61, 4.88), ('LP162', 810.77, 4.41), ('LP163', 24.8, 3.69), ('LP164', 332.19, 4.65), ('LP165', 802.24, 4.32), ('LP166', 810.75, 1.34), ('LP167', 787.38, 0.55), ('LP168', 872.17, 4.29), ('LP169', 222.44, 4.08), ('LP170', 460.31, 1.53), ('LP171', 795.35, 1.15), ('LP172', 23.67, 0.97), ('LP173', 328.27, 4.32), ('LP174', 966.89, 1.4), ('LP175', 641.49, 2.0), ('LP176', 981.15, 2.69), ('LP177', 939.24, 0.59), ('LP178', 970.4, 0.9), ('LP179', 962.53, 1.33), ('LP180', 108.41, 2.18), ('LP181', 728.55, 1.58), ('LP182', 606.21, 2.56), ('LP183', 385.2, 2.89), ('LP184', 254.73, 3.55), ('LP185', 1.7, 4.63), ('LP186', 538.46, 3.6), ('LP187', 741.95, 3.36), ('LP188', 364.23, 0.36), ('LP189', 664.24, 1.66), ('LP190', 313.92, 4.24), ('LP191', 719.76, 1.51), ('LP192', 309.29, 2.05), ('LP193', 402.41, 1.49), ('LP194', 127.3, 2.11), ('LP195', 940.36, 3.39), ('LP196', 902.81, 3.08), ('LP197', 300.96, 2.74), ('LP198', 0.42, 1.44), ('LP199', 429.89, 2.9), ('LP200', 654.71, 2.33)]
ETH_needed = 6
epsilon = 0.01 
LP_output_eth_cost = 0.0000084

start_time = time.time()
result = ptas_lps_detailed(LPs, ETH_needed, epsilon, LP_output_eth_cost)
end_time = time.time()

# total initial lps
print("\nInitial LP count:", len(LPs))
print("Minimum total fees:", result[0], "ETH")
print("ETH needed:", ETH_needed)
print("Used LPs:")
for lp in result[1]:
    print(f"{lp[0]}, {lp[1]:.4f} ETH used, Fee Rate: {lp[2]:.2f}%, Fee in ETH: {lp[3]:.6f}")
print("Total fees in ETH:", result[2])
print("Total gas in ETH:", result[3])
print("Total LPs used:", result[4])
print("Weighted average fee rate: {:.2f}%".format(result[5]))
print("Time taken:", end_time - start_time, "seconds\n")
