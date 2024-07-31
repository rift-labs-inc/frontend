import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import swapReservationsAggregatorABI from '../../abis/SwapReservationsAggregator.json';

import riftExchangeABI from '../../abis/RiftExchange.json';
import {
    getDepositVaults,
    getDepositVaultsLength,
    getSwapReservations,
    getSwapReservationsLength,
} from '../../utils/contractReadFunctions';
import { useStore } from '../../store';
import { DepositVault, SwapReservation } from '../../types';

type UseSwapReservationsResult = {
    allSwapReservations: SwapReservation[];
    loading: boolean;
    error: Error | null;
};

export function useSwapReservations(
    ethersProvider: ethers.providers.Provider,
    riftExchangeContractAddress: string,
): UseSwapReservationsResult {
    const allSwapReservations = useStore((state) => state.allSwapReservations);
    const setAllSwapReservations = useStore((state) => state.setAllSwapReservations);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    async function fetchSwapReservations(swapReservationsLength: number) {
        try {
            const bytecode = swapReservationsAggregatorABI.bytecode;
            const abi = swapReservationsAggregatorABI.abi;
            const swapReservations = await getSwapReservations(
                ethersProvider,
                bytecode.object,
                abi,
                riftExchangeContractAddress,
                Array.from({ length: swapReservationsLength }).map((_, i) => i),
            );

            setAllSwapReservations(swapReservations);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching swap reservations:', err);
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            setLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            if (!ethersProvider) return;

            const swapReservationsLength = await getSwapReservationsLength(
                ethersProvider,
                riftExchangeABI.abi,
                riftExchangeContractAddress,
            );
            console.log('swapReservationsLength:', swapReservationsLength);

            await fetchSwapReservations(swapReservationsLength);
        })();
    }, [ethersProvider, riftExchangeContractAddress]);

    return { allSwapReservations, loading, error };
}
