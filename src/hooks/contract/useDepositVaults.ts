import { useState, useEffect, useCallback } from 'react';
import { ethers, BigNumber } from 'ethers';
import { useAccount } from 'wagmi';
import depositVaultAggregatorABI from '../../abis/DepositVaultsAggregator.json';
import riftExchangeABI from '../../abis/RiftExchange.json';
import {
    getDepositVaults,
    getDepositVaultsLength,
    getLiquidityProvider,
    getDepositVaultByIndex,
} from '../../utils/contractReadFunctions';
import { useStore } from '../../store';
import { useSwapReservations } from './useSwapReservations';
import { DepositVault, SwapReservation, ReservationState } from '../../types';
import { calculateFillPercentage } from '../../utils/dappHelper';

type UseDepositVaultsResult = {
    allFetchedDepositVaults: DepositVault[];
    userFetchedDepositVaults: {
        active: DepositVault[];
        completed: DepositVault[];
    };
    allFetchedSwapReservations: SwapReservation[];
    loading: boolean;
    error: Error | null;
    refreshUserDepositData: () => Promise<void>;
};
const EIGHT_HOURS_IN_SECONDS = 8 * 60 * 60; // 8 hours

export function useDepositVaults(): UseDepositVaultsResult {
    const { address, isConnected } = useAccount();
    const {
        allDepositVaults,
        setAllDepositVaults,
        ethersRpcProvider,
        setMyActiveDepositVaults,
        setMyCompletedDepositVaults,
        updateTotalAvailableLiquidity,
        setTotalExpiredReservations,
        selectedAsset,
    } = useStore();
    const [userFetchedDepositVaults, setUserFetchedDepositVaults] = useState<{
        active: DepositVault[];
        completed: DepositVault[];
    }>({
        active: [],
        completed: [],
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const {
        allSwapReservations: allFetchedSwapReservations,
        loading: swapReservationsLoading,
        error: swapReservationsError,
    } = useSwapReservations();

    const calculateTrueUnreservedLiquidity = useCallback(
        (depositVaults: DepositVault[], swapReservations: SwapReservation[]): DepositVault[] => {
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const additionalBalances = new Map<number, BigNumber>();
            let expiredReservationsCount = 0;

            // Process all reservations first
            swapReservations.forEach((reservation, reservationIndex) => {
                const isCreated = reservation.state === ReservationState.Created;
                const isExpired = currentTimestamp - reservation.reservationTimestamp > EIGHT_HOURS_IN_SECONDS;

                if (isCreated && isExpired) {
                    expiredReservationsCount++;
                    reservation.vaultIndexes.forEach((vaultIndex, i) => {
                        const vaultIndexNumber = vaultIndex.toNumber();
                        const amountToAdd = reservation.amountsToReserve[i];
                        const currentAdditional = additionalBalances.get(vaultIndexNumber) || BigNumber.from(0);
                        additionalBalances.set(vaultIndexNumber, currentAdditional.add(amountToAdd));
                    });
                }
            });

            console.log(`Total expired reservations found: ${expiredReservationsCount}`);
            setTotalExpiredReservations(expiredReservationsCount);

            let totalAvailableLiquidity = BigNumber.from(0);

            // Now update the deposit vaults with the additional balances
            const updatedVaults = depositVaults.map((vault, vaultIndex) => {
                const additionalBalance = additionalBalances.get(vaultIndex) || BigNumber.from(0);
                const newCalculatedUnreservedBalance = BigNumber.from(vault.unreservedBalance).add(additionalBalance);

                if (!additionalBalance.isZero()) {
                    console.log(`Updating vault ${vaultIndex}:`, {
                        originalUnreservedBalance: vault.unreservedBalance.toString(),
                        additionalBalance: additionalBalance.toString(),
                        newCalculatedUnreservedBalance: newCalculatedUnreservedBalance.toString(),
                        btcExchangeRate: vault.btcExchangeRate.toString(),
                    });
                }

                totalAvailableLiquidity = totalAvailableLiquidity.add(newCalculatedUnreservedBalance);

                return {
                    ...vault,
                    calculatedTrueUnreservedBalance: newCalculatedUnreservedBalance,
                };
            });

            console.log('Total Available Liquidity:', totalAvailableLiquidity.toString());

            // Update the store with the new total available liquidity
            updateTotalAvailableLiquidity(selectedAsset.name, totalAvailableLiquidity);

            return updatedVaults;
        },
        [updateTotalAvailableLiquidity, setTotalExpiredReservations, selectedAsset.name],
    );

    const fetchAllDepositVaults = useCallback(async () => {
        if (!ethersRpcProvider || !selectedAsset.riftExchangeContractAddress) return;

        try {
            const depositVaultsLength = await getDepositVaultsLength(
                ethersRpcProvider,
                riftExchangeABI.abi,
                selectedAsset.riftExchangeContractAddress,
            );

            const bytecode = depositVaultAggregatorABI.bytecode;
            const abi = depositVaultAggregatorABI.abi;
            const depositVaults = await getDepositVaults(
                ethersRpcProvider,
                bytecode.object,
                abi,
                selectedAsset.riftExchangeContractAddress,
                Array.from({ length: depositVaultsLength }).map((_, i) => i),
            );

            const updatedDepositVaults = calculateTrueUnreservedLiquidity(depositVaults, allFetchedSwapReservations);
            setAllDepositVaults(updatedDepositVaults);
        } catch (err) {
            console.error('Error fetching all deposit vaults:', err);
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
    }, [
        ethersRpcProvider,
        selectedAsset.riftExchangeContractAddress,
        allFetchedSwapReservations,
        calculateTrueUnreservedLiquidity,
        setAllDepositVaults,
    ]);

    const fetchUserDepositVaults = useCallback(async () => {
        if (!isConnected || !address || !ethersRpcProvider || !selectedAsset.riftExchangeContractAddress) {
            setUserFetchedDepositVaults({ active: [], completed: [] });
            setMyActiveDepositVaults([]);
            setMyCompletedDepositVaults([]);
            return;
        }

        try {
            const result = await getLiquidityProvider(
                ethersRpcProvider,
                riftExchangeABI.abi,
                selectedAsset.riftExchangeContractAddress,
                address,
            );
            const vaultIndexes = result.depositVaultIndexes;

            const vaultPromises = vaultIndexes.map((index) =>
                getDepositVaultByIndex(ethersRpcProvider, riftExchangeABI.abi, selectedAsset.riftExchangeContractAddress, index),
            );

            const myVaults = (await Promise.all(vaultPromises)).filter((vault): vault is DepositVault => vault !== null);

            const active: DepositVault[] = [];
            const completed: DepositVault[] = [];

            myVaults.forEach((vault) => {
                const fillPercentage = calculateFillPercentage(vault);
                if (fillPercentage < 100) {
                    active.push(vault);
                } else {
                    completed.push(vault);
                }
            });

            setUserFetchedDepositVaults({ active, completed });
            setMyActiveDepositVaults(active);
            setMyCompletedDepositVaults(completed);
        } catch (err) {
            console.error('Failed to fetch user deposit vaults:', err);
            setError(new Error('Failed to fetch deposit vaults. Please try again.'));
        }
    }, [
        isConnected,
        address,
        ethersRpcProvider,
        selectedAsset.riftExchangeContractAddress,
        setMyActiveDepositVaults,
        setMyCompletedDepositVaults,
    ]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (isMounted) setLoading(true);
            if (isMounted) setError(null);

            await Promise.all([fetchAllDepositVaults(), fetchUserDepositVaults()]);

            if (isMounted) setLoading(false);
        };

        if (!swapReservationsLoading) {
            fetchData();
        }

        return () => {
            isMounted = false;
        };
    }, [fetchAllDepositVaults, fetchUserDepositVaults, swapReservationsLoading]);
    useEffect(() => {
        if (swapReservationsError) {
            setError(swapReservationsError);
        }
    }, [swapReservationsError]);

    const refreshUserDepositData = useCallback(async () => {
        try {
            await fetchUserDepositVaults();
        } catch (error) {
            console.error('Error refreshing user deposit data:', error);
            throw error;
        }
    }, [fetchUserDepositVaults, userFetchedDepositVaults]);

    return {
        allFetchedDepositVaults: Array.isArray(allDepositVaults) ? allDepositVaults : [],
        userFetchedDepositVaults,
        allFetchedSwapReservations,
        loading: loading || swapReservationsLoading,
        error,
        refreshUserDepositData,
    };
}
