import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import swapReservationsAggregatorABI from '../../abis/SwapReservationsAggregator.json';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { getSwapReservations, getSwapReservationsLength } from '../../utils/contractReadFunctions';
import { useStore } from '../../store';
import { SwapReservation } from '../../types';
import { useAccount } from 'wagmi';

type UseSwapReservationsResult = {
    allSwapReservations: SwapReservation[];
    loading: boolean;
    error: Error | null;
    refreshSwapReservations: () => Promise<void>;
};

export function useSwapReservations(): UseSwapReservationsResult {
    const [allSwapReservations, setAllSwapReservations] = useState<SwapReservation[]>([]);
    const { address, isConnected } = useAccount();
    const ethersRpcProvider = useStore.getState().ethersRpcProvider;
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const store = useStore();
    const storeSwapReservations = store ? store.allSwapReservations : [];
    const storeSetSwapReservations = store ? store.setAllSwapReservations : null;
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);
    const [refreshReservationData, setRefreshReservationData] = useState<boolean>(false);
    async function fetchSwapReservations() {
        if (!ethersRpcProvider) {
            return;
        }

        try {
            // Fetch the length of swap reservations
            const swapReservationsLength = await getSwapReservationsLength(ethersRpcProvider, riftExchangeABI.abi, selectedInputAsset.riftExchangeContractAddress);

            // Generate indices based on the length
            const indices = Array.from({ length: swapReservationsLength }).map((_, i) => i);

            // Fetch the swap reservations
            const bytecode = swapReservationsAggregatorABI.bytecode;
            const abi = swapReservationsAggregatorABI.abi;
            const swapReservations = await getSwapReservations(ethersRpcProvider, bytecode.object, abi, selectedInputAsset.riftExchangeContractAddress, indices);

            // Add index to each reservation
            const swapReservationsWithIndex = swapReservations.map((reservation, i) => ({
                ...reservation,
                indexInContract: indices[i],
            }));

            console.log('All Swap Reservations:', swapReservationsWithIndex);

            setAllSwapReservations(swapReservationsWithIndex);

            if (storeSetSwapReservations) {
                storeSetSwapReservations(swapReservationsWithIndex);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching swap reservations:', err);
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            setLoading(false);
        }
    }

    useEffect(() => {
        refreshData();
    }, [refreshReservationData]);

    const refreshData = async () => {
        try {
            await fetchSwapReservations();
        } catch (error) {
            console.error('Error refreshing user deposit data:', error);
        }
    };

    const refreshSwapReservations = async () => {
        setRefreshReservationData((prev) => !prev);
    };

    return {
        allSwapReservations: allSwapReservations.length > 0 ? allSwapReservations : storeSwapReservations,
        loading,
        error,
        refreshSwapReservations,
    };
}
