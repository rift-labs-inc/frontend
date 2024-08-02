import { useState, useCallback, useEffect } from 'react';
import { ethers, BigNumber, BigNumberish } from 'ethers';

export enum ReserveStatus {
    Idle = 'idle',
    WaitingForWalletConfirmation = 'waitingForWalletConfirmation',
    ReservingLiquidity = 'reservingLiquidity',
    Confirmed = 'confirmed',
    Error = 'error',
}

interface ReserveLiquidityParams {
    signer: ethers.Signer;
    riftExchangeAbi: ethers.ContractInterface;
    riftExchangeContract: string;
    vaultIndexesToReserve: number[];
    amountsToReserve: BigNumberish[];
    ethPayoutAddress: string;
    expiredSwapReservationIndexes: number[];
}

function useIsClient() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);
    return isClient;
}

export function useReserveLiquidity() {
    const isClient = useIsClient();

    const [status, setStatus] = useState<ReserveStatus>(ReserveStatus.Idle);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const resetReserveState = useCallback(() => {
        if (isClient) {
            setStatus(ReserveStatus.Idle);
            setError(null);
            setTxHash(null);
        }
    }, [isClient]);

    const reserveLiquidity = useCallback(
        async (params: ReserveLiquidityParams) => {
            if (!isClient) return;

            setStatus(ReserveStatus.WaitingForWalletConfirmation);
            setError(null);
            setTxHash(null);

            try {
                const riftExchangeContractInstance = new ethers.Contract(
                    params.riftExchangeContract,
                    params.riftExchangeAbi,
                    params.signer,
                );

                setStatus(ReserveStatus.ReservingLiquidity);
                const reserveTx = await riftExchangeContractInstance.reserveLiquidity(
                    params.vaultIndexesToReserve,
                    params.amountsToReserve,
                    params.ethPayoutAddress,
                    params.expiredSwapReservationIndexes,
                );

                setTxHash(reserveTx.hash);
                await reserveTx.wait();
                setStatus(ReserveStatus.Confirmed);
            } catch (err) {
                console.error('Error in reserveLiquidity:', err);
                setError(err instanceof Error ? err.message : String(err));
                setStatus(ReserveStatus.Error);
            }
        },
        [isClient],
    );

    if (!isClient) {
        return {
            reserveLiquidity: () => Promise.resolve(),
            status: ReserveStatus.Idle,
            error: null,
            txHash: null,
            resetReserveState: () => {},
        };
    }

    return {
        reserveLiquidity,
        status,
        error,
        txHash,
        resetReserveState,
    };
}
