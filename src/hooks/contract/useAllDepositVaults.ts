import { useState, useEffect } from 'react';
import { ethers, BigNumber, BigNumberish } from 'ethers';
import depositVaultAggregatorABI from '../../abis/DepositVaultsAggregator.json';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { getDepositVaults, getDepositVaultsLength } from '../../utils/contractReadFunctions';
import { useStore } from '../../store';
import { useSwapReservations } from './useSwapReservations';
import { DepositVault, SwapReservation, ReservationState } from '../../types';

type UseDepositVaultsResult = {
    allDepositVaults: DepositVault[];
    loading: boolean;
    error: Error | null;
};

const EIGHT_HOURS_IN_SECONDS = 8 * 60 * 60;

export function useAllDepositVaults(
    ethersProvider: ethers.providers.Provider,
    riftExchangeContractAddress: string,
): UseDepositVaultsResult {
    const allDepositVaults = useStore((state) => state.allDepositVaults);
    const setAllDepositVaults = useStore((state) => state.setAllDepositVaults);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const {
        allSwapReservations,
        loading: swapReservationsLoading,
        error: swapReservationsError,
    } = useSwapReservations(ethersProvider, riftExchangeContractAddress);

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

            const updatedDepositVaults = calculateTrueUnreservedLiquidity(depositVaults, allSwapReservations);
            setAllDepositVaults(updatedDepositVaults);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching deposit vaults:', err);
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            setLoading(false);
        }
    }

    function calculateTrueUnreservedLiquidity(
        depositVaults: DepositVault[],
        swapReservations: SwapReservation[],
    ): DepositVault[] {
        const currentTimestamp = Math.floor(Date.now() / 1000);

        return depositVaults.map((vault, index) => {
            const expiredCreatedReservations = swapReservations.filter(
                (reservation) =>
                    reservation.state === 'Created' &&
                    reservation.vaultIndexes.includes(index) &&
                    currentTimestamp - reservation.reservationTimestamp > EIGHT_HOURS_IN_SECONDS,
            );

            const additionalUnreservedBalance = expiredCreatedReservations.reduce((sum, reservation) => {
                const reservationIndex = reservation.vaultIndexes.indexOf(index);
                return BigNumber.from(sum).add(BigNumber.from(reservation.amountsToReserve[reservationIndex]));
            }, BigNumber.from(0));

            return {
                ...vault,
                calculatedUnreservedBalance: BigNumber.from(vault.unreservedBalance).add(additionalUnreservedBalance),
            };
        });
    }

    useEffect(() => {
        (async () => {
            if (!ethersProvider || swapReservationsLoading) return;

            if (swapReservationsError) {
                setError(swapReservationsError);
                setLoading(false);
                return;
            }

            const depositVaultsLength = await getDepositVaultsLength(
                ethersProvider,
                riftExchangeABI.abi,
                riftExchangeContractAddress,
            );
            console.log('depositVaultsLength:', depositVaultsLength);

            await fetchDepositVaults(depositVaultsLength);
        })();
    }, [ethersProvider, riftExchangeContractAddress, swapReservationsLoading, allSwapReservations]);

    return { allDepositVaults, loading: loading || swapReservationsLoading, error };
}
