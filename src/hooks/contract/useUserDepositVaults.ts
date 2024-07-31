import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { getLiquidityProvider, getDepositVaultByIndex } from '../../utils/contractReadFunctions';
import { calculateFillPercentage } from '../../utils/dappHelper';
import { DepositVault } from '../../types';
import { useStore } from '../../store';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { riftExchangeContractAddress } from '../../utils/constants';

export const useUserDepositVaults = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const myActiveDepositVaults = useStore((state) => state.myActiveDepositVaults);
    const setMyActiveDepositVaults = useStore((state) => state.setMyActiveDepositVaults);
    const myCompletedDepositVaults = useStore((state) => state.myCompletedDepositVaults);
    const setMyCompletedDepositVaults = useStore((state) => state.setMyCompletedDepositVaults);

    const { address, isConnected } = useAccount();
    const ethersProvider = useStore((state) => state.ethersProvider);

    const fetchUserVaults = useCallback(async () => {
        if (!isConnected || !address || !ethersProvider) {
            setMyActiveDepositVaults([]);
            setMyCompletedDepositVaults([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await getLiquidityProvider(ethersProvider, riftExchangeABI.abi, riftExchangeContractAddress, address);
            console.log('Liquidity provider result:', result);
            const vaultIndexes = result.depositVaultIndexes;
            console.log('Vault indexes:', vaultIndexes);

            const vaultPromises = vaultIndexes.map((index) =>
                getDepositVaultByIndex(ethersProvider, riftExchangeABI.abi, riftExchangeContractAddress, index),
            );

            const myVaults = (await Promise.all(vaultPromises)).filter((vault): vault is DepositVault => vault !== null);
            console.log('Fetched vaults:', myVaults);

            const active: DepositVault[] = [];
            const completed: DepositVault[] = [];

            myVaults.forEach((vault) => {
                const fillPercentage = calculateFillPercentage(vault);
                console.log(`Vault ${vault.index} details:`, {
                    initialBalance: vault.initialBalance.toString(),
                    unreservedBalance: vault.unreservedBalance.toString(),
                    btcExchangeRate: vault.btcExchangeRate.toString(),
                    btcPayoutLockingScript: vault.btcPayoutLockingScript,
                    fillPercentage,
                });
                if (fillPercentage < 100) {
                    active.push(vault);
                } else {
                    completed.push(vault);
                }
            });

            console.log('Active vaults:', active);
            console.log('Completed vaults:', completed);

            setMyActiveDepositVaults(active);
            setMyCompletedDepositVaults(completed);
        } catch (err) {
            console.error('Failed to fetch user deposit vaults:', err);
            setError('Failed to fetch deposit vaults. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, address, ethersProvider, setMyActiveDepositVaults, setMyCompletedDepositVaults]);

    useEffect(() => {
        fetchUserVaults();
    }, [fetchUserVaults]);

    const refreshUserDepositData = useCallback(() => {
        fetchUserVaults();
    }, [fetchUserVaults]);

    return { myActiveDepositVaults, myCompletedDepositVaults, isLoading, error, refreshUserDepositData };
};
