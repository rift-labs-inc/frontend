import { useState, useEffect, useCallback } from 'react';
import { ethers, BigNumber } from 'ethers';
import { useAccount } from 'wagmi';
import depositVaultAggregatorABI from '../../abis/DepositVaultsAggregator.json';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { getDepositVaults, getDepositVaultsLength, getLiquidityProvider, getDepositVaultByIndex } from '../../utils/contractReadFunctions';
import { useStore } from '../../store';
import { useSwapReservations } from './useSwapReservations';
import { DepositVault, SwapReservation, ReservationState } from '../../types';
import { calculateFillPercentage } from '../../utils/dappHelper';
import { formatUnits } from 'ethers/lib/utils';
import { FRONTEND_RESERVATION_EXPIRY_TIME } from '../../utils/constants';

type UseDepositVaultsResult = {
    allFetchedDepositVaults: DepositVault[];
    userActiveDepositVaults: DepositVault[];
    userCompletedDepositVaults: DepositVault[];
    allFetchedSwapReservations: SwapReservation[];
    loading: boolean;
    error: Error | null;
    refreshAllDepositData: () => Promise<void>;
};

export function useDepositVaults(): UseDepositVaultsResult {
    const { address, isConnected } = useAccount();
    const {
        allDepositVaults,
        ethersRpcProvider,
        setUserActiveDepositVaults,
        setUserCompletedDepositVaults,
        updateTotalAvailableLiquidity,
        setAllDepositVaults,
        setTotalExpiredReservations,
        setTotalUnlockedReservations,
        setTotalCompletedReservations,
        selectedInputAsset,
    } = useStore();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const { allSwapReservations: allFetchedSwapReservations, loading: swapReservationsLoading, error: swapReservationsError } = useSwapReservations();

    const calculateTrueUnreservedLiquidity = useCallback(
        (depositVaults: DepositVault[], swapReservations: SwapReservation[]): DepositVault[] => {
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const additionalBalances = new Map<number, BigNumber>();
            const expiredAmountsPerVault = new Map<number, BigNumber>();
            const completedAmountsPerVault = new Map<number, BigNumber>();
            const unlockedAmountsPerVault = new Map<number, BigNumber>();

            let expiredReservationsCount = 0;
            let completedReservationsCount = 0;
            let unlockedReservationsCount = 0;

            // Process all reservations first
            swapReservations.forEach((reservation, reservationIndex) => {
                const isCompleted = reservation.state === ReservationState.Completed;
                const isCreated = reservation.state === ReservationState.Created;
                const isExpired = currentTimestamp - reservation.reservationTimestamp > FRONTEND_RESERVATION_EXPIRY_TIME;
                const isUnlocked = reservation.unlockTimestamp && currentTimestamp > reservation.unlockTimestamp;

                if (isCompleted) {
                    completedReservationsCount++;

                    // Update per-vault completed amounts
                    reservation.vaultIndexes.forEach((vaultIndex, i) => {
                        const vaultIndexNumber = vaultIndex;
                        const amountToAdd = reservation.amountsToReserve[i];
                        const currentCompleted = completedAmountsPerVault.get(vaultIndexNumber) || BigNumber.from(0);
                        completedAmountsPerVault.set(vaultIndexNumber, currentCompleted.add(amountToAdd));
                    });
                } else if (isUnlocked) {
                    unlockedReservationsCount++;

                    // Update per-vault unlocked amounts
                    reservation.vaultIndexes.forEach((vaultIndex, i) => {
                        const vaultIndexNumber = vaultIndex;
                        const amountToAdd = reservation.amountsToReserve[i];
                        const currentUnlocked = unlockedAmountsPerVault.get(vaultIndexNumber) || BigNumber.from(0);
                        unlockedAmountsPerVault.set(vaultIndexNumber, currentUnlocked.add(amountToAdd));
                    });
                } else if (isCreated && isExpired) {
                    expiredReservationsCount++;
                    reservation.state = ReservationState.Expired;

                    // Update per-vault expired amounts
                    reservation.vaultIndexes.forEach((vaultIndex, i) => {
                        const vaultIndexNumber = vaultIndex;
                        const amountToAdd = reservation.amountsToReserve[i];

                        // Update additionalBalances (existing logic)
                        const currentAdditional = additionalBalances.get(vaultIndexNumber) || BigNumber.from(0);
                        additionalBalances.set(vaultIndexNumber, currentAdditional.add(amountToAdd));

                        // Update expiredAmountsPerVault
                        const currentExpired = expiredAmountsPerVault.get(vaultIndexNumber) || BigNumber.from(0);
                        expiredAmountsPerVault.set(vaultIndexNumber, currentExpired.add(amountToAdd));
                    });
                }
            });

            setTotalExpiredReservations(expiredReservationsCount);
            setTotalCompletedReservations(completedReservationsCount);
            setTotalUnlockedReservations(unlockedReservationsCount);

            let totalAvailableLiquidity = BigNumber.from(0);

            // Now update the deposit vaults with the additional balances
            const updatedVaults = depositVaults.map((vault, vaultIndex) => {
                const additionalBalance = additionalBalances.get(vaultIndex) || BigNumber.from(0);
                const newCalculatedUnreservedBalance = BigNumber.from(vault.unreservedBalanceFromContract).add(additionalBalance);

                // Get expired and completed amounts
                const expiredAmount = expiredAmountsPerVault.get(vaultIndex) || BigNumber.from(0);
                const completedAmount = completedAmountsPerVault.get(vaultIndex) || BigNumber.from(0);
                const unlockedAmount = unlockedAmountsPerVault.get(vaultIndex) || BigNumber.from(0);

                totalAvailableLiquidity = totalAvailableLiquidity.add(newCalculatedUnreservedBalance);

                if (!additionalBalance.isZero()) {
                    console.log(`Updating vault ${vaultIndex}:`, {
                        originalUnreservedBalance: vault.unreservedBalanceFromContract.toString(),
                        additionalBalance: additionalBalance.toString(),
                        newCalculatedUnreservedBalance: newCalculatedUnreservedBalance.toString(),
                        btcExchangeRate: vault.btcExchangeRate.toString(),
                    });
                }

                return {
                    ...vault,
                    trueUnreservedBalance: newCalculatedUnreservedBalance || vault.unreservedBalanceFromContract,
                    reservedBalance: BigNumber.from(vault.initialBalance).sub(newCalculatedUnreservedBalance).sub(vault.withdrawnAmount),
                    depositAsset: selectedInputAsset,
                    index: vaultIndex,
                    expiredAmount,
                    completedAmount,
                    unlockedAmount,
                };
            });

            updateTotalAvailableLiquidity(selectedInputAsset.name, totalAvailableLiquidity);

            return updatedVaults;
        },
        [selectedInputAsset.name],
    );

    const fetchDepositVaultsReservationsData = useCallback(async () => {
        if (!ethersRpcProvider || !selectedInputAsset.riftExchangeContractAddress) {
            setUserActiveDepositVaults([]);
            setUserCompletedDepositVaults([]);
            return;
        }

        try {
            // [0] fetch all deposit vaults
            const depositVaultsLength = await getDepositVaultsLength(ethersRpcProvider, riftExchangeABI.abi, selectedInputAsset.riftExchangeContractAddress);

            const bytecode = depositVaultAggregatorABI.bytecode;
            const abi = depositVaultAggregatorABI.abi;
            const depositVaults = await getDepositVaults(
                ethersRpcProvider,
                bytecode.object,
                abi,
                selectedInputAsset.riftExchangeContractAddress,
                Array.from({ length: depositVaultsLength }).map((_, i) => i),
            );

            // console.log('All Deposit Vaults:', depositVaults);

            const updatedDepositVaults = calculateTrueUnreservedLiquidity(depositVaults, allFetchedSwapReservations);
            // console.log('Updated Deposit Vaults:', updatedDepositVaults);
            setAllDepositVaults(updatedDepositVaults);

            // [1] fetch user-specific vaults (if connected)
            if (isConnected && address) {
                const result = await getLiquidityProvider(ethersRpcProvider, riftExchangeABI.abi, selectedInputAsset.riftExchangeContractAddress, address);

                const vaultIndexes = result.depositVaultIndexes.map((index) => BigNumber.from(index).toNumber());

                const userVaults = updatedDepositVaults.filter((_, index) => vaultIndexes.includes(BigNumber.from(index).toNumber()));

                const active: DepositVault[] = [];
                const completed: DepositVault[] = [];

                userVaults.forEach((vault) => {
                    const fillPercentage = calculateFillPercentage(vault);
                    if (fillPercentage < 100) {
                        active.push(vault);
                    } else {
                        completed.push(vault);
                    }
                });

                setUserActiveDepositVaults(active);
                setUserCompletedDepositVaults(completed);
            } else {
                setUserActiveDepositVaults([]);
                setUserCompletedDepositVaults([]);
            }
        } catch (err) {
            console.error('Error fetching deposit vaults data:', err);
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
    }, [ethersRpcProvider, selectedInputAsset.riftExchangeContractAddress, allFetchedSwapReservations, isConnected, address]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (isMounted) setLoading(true);
            if (isMounted) setError(null);

            try {
                // fetch all deposit vaults
                await fetchDepositVaultsReservationsData();
            } catch (err) {
                console.error('Error fetching data:', err);
                if (isMounted) setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (!swapReservationsLoading) {
            fetchData();
        }

        return () => {
            isMounted = false;
        };
    }, [swapReservationsLoading]);

    useEffect(() => {
        if (swapReservationsError) {
            setError(swapReservationsError);
        }
    }, [swapReservationsError]);

    const refreshAllDepositData = useCallback(async () => {
        try {
            await fetchDepositVaultsReservationsData();
        } catch (error) {
            console.error('Error refreshing user deposit data:', error);
            throw error;
        }
    }, []);

    return {
        allFetchedDepositVaults: Array.isArray(allDepositVaults) ? allDepositVaults : [],
        userActiveDepositVaults: Array.isArray(useStore.getState().userActiveDepositVaults) ? useStore.getState().userActiveDepositVaults : [],
        userCompletedDepositVaults: Array.isArray(useStore.getState().userCompletedDepositVaults) ? useStore.getState().userCompletedDepositVaults : [],
        allFetchedSwapReservations,
        loading: loading || swapReservationsLoading,
        error,
        refreshAllDepositData,
    };
}
