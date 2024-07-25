import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import depositVaultAggregatorABI from '../abis/DepositVaultsAggregator.json';
import riftExchangeABI from '../abis/RiftExchange.json';
import { getDepositVaults, getDepositVaultsLength } from '../utils/dataAggregation';
import { useStore } from '../store';

type DepositVault = {
    address: string;
    balance: ethers.BigNumber;
};

type UseDepositVaultsResult = {
    allUserDepositVaults: DepositVault[];
    loading: boolean;
    error: Error | null;
};

export function useDepositVaults(
    ethersProvider: ethers.providers.Provider,
    riftExchangeContractAddress: string,
): UseDepositVaultsResult {
    const allUserDepositVaults = useStore((state) => state.allUserDepositVaults);
    const setAllUserDepositVaults = useStore((state) => state.setAllUserDepositVaults);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    async function fetchDepositVaults(depositVaultsLength: number) {
        try {
            const bytecode = depositVaultAggregatorABI.bytecode;
            const abi = depositVaultAggregatorABI.abi;
            const depositVaults = await getDepositVaults(
                ethersProvider,
                bytecode.object,
                abi,
                riftExchangeContractAddress,
                Array.from({ length: depositVaultsLength }).map((_, i) => i),
            );

            setAllUserDepositVaults(depositVaults);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching deposit vaults:', err);
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            setLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            if (!ethersProvider) return;

            const depositVaultsLength = await getDepositVaultsLength(
                ethersProvider,
                riftExchangeABI.abi,
                riftExchangeContractAddress,
            );
            console.log('depositVaultsLength:', depositVaultsLength);

            await fetchDepositVaults(depositVaultsLength);
        })();
    }, [ethersProvider, riftExchangeContractAddress]);

    return { allUserDepositVaults, loading, error };
}
