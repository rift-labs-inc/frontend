import { useState, useCallback } from 'react';
import { ethers, BigNumberish } from 'ethers';

export enum WithdrawStatus {
    Idle = 'idle',
    WaitingForWalletConfirmation = 'waitingForWalletConfirmation',
    WithdrawingLiquidity = 'withdrawingLiquidity',
    Confirmed = 'confirmed',
    Error = 'error',
}

interface WithdrawLiquidityParams {
    signer: ethers.Signer;
    riftExchangeAbi: ethers.ContractInterface;
    riftExchangeContract: string;
    globalVaultIndex: number;
    localVaultIndex: number;
    amountToWithdraw: BigNumberish;
    expiredReservationIndexes: number[];
}

export function useWithdrawLiquidity() {
    const [status, setStatus] = useState<WithdrawStatus>(WithdrawStatus.Idle);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const resetWithdrawState = useCallback(() => {
        setStatus(WithdrawStatus.Idle);
        setError(null);
        setTxHash(null);
    }, []);

    const withdrawLiquidity = useCallback(async (params: WithdrawLiquidityParams) => {
        setStatus(WithdrawStatus.WaitingForWalletConfirmation);
        setError(null);
        setTxHash(null);

        try {
            console.log('Withdrawing liquidity...');
            console.log('globalVaultIndex:', params.globalVaultIndex);
            console.log('localVaultIndex:', params.localVaultIndex);
            console.log('amountToWithdraw:', params.amountToWithdraw.toString());
            console.log('expiredReservationIndexes:', params.expiredReservationIndexes);

            const riftExchangeContractInstance = new ethers.Contract(
                params.riftExchangeContract,
                params.riftExchangeAbi,
                params.signer,
            );

            setStatus(WithdrawStatus.WithdrawingLiquidity);

            const withdrawTx = await riftExchangeContractInstance.withdrawLiquidity(
                params.globalVaultIndex,
                params.localVaultIndex,
                params.amountToWithdraw,
                params.expiredReservationIndexes,
            );

            setTxHash(withdrawTx.hash);
            await withdrawTx.wait();

            console.log('Liquidity withdrawn successfully');
            setStatus(WithdrawStatus.Confirmed);
        } catch (err) {
            console.error('Error in withdrawLiquidity:', err);
            setError(err instanceof Error ? err.message : String(err));
            setStatus(WithdrawStatus.Error);
        }
    }, []);

    return {
        withdrawLiquidity,
        status,
        error,
        txHash,
        resetWithdrawState,
    };
}
