import { useState, useCallback, useEffect } from 'react';
import { ethers, BigNumber, BigNumberish } from 'ethers';
import { useStore } from '../../store';

export enum DepositStatus {
    Idle = 'idle',
    WaitingForWalletConfirmation = 'waitingForWalletConfirmation',
    ApprovingWETH = 'approvingWETH',
    DepositingLiquidity = 'depositingLiquidity',
    Confirmed = 'confirmed',
    Error = 'error',
}

interface DepositLiquidityParams {
    signer: ethers.Signer;
    riftExchangeAbi: ethers.ContractInterface;
    riftExchangeContract: string;
    tokenAddress: string;
    btcPayoutLockingScript: string;
    btcExchangeRate: BigNumberish;
    vaultIndexToOverwrite: number;
    depositAmount: BigNumberish;
    vaultIndexWithSameExchangeRate: number;
}

function useIsClient() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);
    return isClient;
}

export function useDepositLiquidity() {
    const isClient = useIsClient();

    const [status, setStatus] = useState<DepositStatus>(DepositStatus.Idle);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const selectedDepositAsset = useStore((state) => state.selectedDepositAsset);

    const resetDepositState = useCallback(() => {
        if (isClient) {
            setStatus(DepositStatus.Idle);
            setError(null);
            setTxHash(null);
        }
    }, [isClient]);

    const depositLiquidity = useCallback(
        async (params: DepositLiquidityParams) => {
            if (!isClient) return;

            setStatus(DepositStatus.WaitingForWalletConfirmation);
            setError(null);
            setTxHash(null);

            try {
                const tokenContract = new ethers.Contract(params.tokenAddress, selectedDepositAsset.abi, params.signer);
                const riftExchangeContractInstance = new ethers.Contract(
                    params.riftExchangeContract,
                    params.riftExchangeAbi,
                    params.signer,
                );

                const allowance = await tokenContract.allowance(await params.signer.getAddress(), params.riftExchangeContract);

                if (BigNumber.from(allowance).lt(BigNumber.from(params.depositAmount))) {
                    setStatus(DepositStatus.ApprovingWETH);
                    const approveTx = await tokenContract.approve(params.riftExchangeContract, params.depositAmount);
                    await approveTx.wait();
                }

                setStatus(DepositStatus.DepositingLiquidity);
                const depositTx = await riftExchangeContractInstance.depositLiquidity(
                    params.btcPayoutLockingScript,
                    params.btcExchangeRate,
                    params.vaultIndexToOverwrite,
                    params.depositAmount.toString(),
                    params.vaultIndexWithSameExchangeRate,
                );

                setTxHash(depositTx.hash);
                await depositTx.wait();
                setStatus(DepositStatus.Confirmed);
            } catch (err) {
                console.error('Error in depositLiquidity:', err);
                setError(err instanceof Error ? err.message : String(err));
                setStatus(DepositStatus.Error);
            }
        },
        [isClient],
    );

    if (!isClient) {
        return {
            depositLiquidity: () => Promise.resolve(),
            status: DepositStatus.Idle,
            error: null,
            txHash: null,
            resetDepositState: () => {},
        };
    }

    return {
        depositLiquidity,
        status,
        error,
        txHash,
        resetDepositState,
    };
}
