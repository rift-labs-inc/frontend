import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import swapReservationsAggregatorABI from '../../abis/SwapReservationsAggregator.json';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { getSwapReservations, getSwapReservationsLength } from '../../utils/contractReadFunctions';
import { useStore } from '../../store';
import { SwapReservation } from '../../types';

type UseSwapReservationsResult = {
    allSwapReservations: SwapReservation[];
    loading: boolean;
    error: Error | null;
};

export function useSwapReservations(
    ethersProvider: ethers.providers.Provider,
    riftExchangeContractAddress: string,
): UseSwapReservationsResult {
    const [allSwapReservations, setAllSwapReservations] = useState<SwapReservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const store = useStore();
    const storeSwapReservations = store ? store.allSwapReservations : [];
    const storeSetSwapReservations = store ? store.setAllSwapReservations : null;

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

            // console.log('ALL swapReservations:', swapReservations);

            setAllSwapReservations(swapReservations);
            if (storeSetSwapReservations) {
                storeSetSwapReservations(swapReservations);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching swap reservations:', err);
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!ethersProvider) return;

        (async () => {
            try {
                const swapReservationsLength = await getSwapReservationsLength(
                    ethersProvider,
                    riftExchangeABI.abi,
                    riftExchangeContractAddress,
                );
                console.log('swapReservationsLength:', swapReservationsLength);

                await fetchSwapReservations(swapReservationsLength);
            } catch (err) {
                console.error('Error in useSwapReservations effect:', err);
                setError(err instanceof Error ? err : new Error('An unknown error occurred'));
                setLoading(false);
            }
        })();
    }, [ethersProvider, riftExchangeContractAddress]);

    return {
        allSwapReservations: allSwapReservations.length > 0 ? allSwapReservations : storeSwapReservations,
        loading,
        error,
    };
}
