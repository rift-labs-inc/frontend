import { useState, useCallback, useEffect } from 'react';
import { ethers, BigNumber, BigNumberish } from 'ethers';
import { useStore } from '../../store';
import { ERC20ABI } from '../../utils/constants';
import { useAccount } from 'wagmi';
import { useContractData } from '../../components/providers/ContractDataProvider';

export enum DepositStatus {
    Idle = 'idle',
    WaitingForWalletConfirmation = 'waitingForWalletConfirmation',
    WaitingForDepositTokenApproval = 'ApprovingDepositToken',
    ApprovalPending = 'approvalPending',
    WaitingForDepositApproval = 'WaitingForDepositApproval',
    DepositPending = 'depositPending',
    Confirmed = 'confirmed',
    Error = 'error',
}

interface DepositLiquidityParams {
    signer: ethers.Signer;
    riftExchangeAbi: ethers.ContractInterface;
    riftExchangeContractAddress: string;
    tokenAddress: string;
    btcPayoutLockingScript: string;
    btcExchangeRate: BigNumber;
    vaultIndexToOverwrite: number;
    tokenDepositAmountInSmallestTokenUnits: BigNumber;
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
    const selectedAsset = useStore((state) => state.selectedAsset);
    const userEthAddress = useStore((state) => state.userEthAddress);
    const { refreshUserDepositData } = useContractData();

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
                const tokenContract = new ethers.Contract(params.tokenAddress, ERC20ABI, params.signer);
                const riftExchangeContractInstance = new ethers.Contract(
                    params.riftExchangeContractAddress,
                    params.riftExchangeAbi,
                    params.signer,
                );

                const allowance = await tokenContract.allowance(userEthAddress, params.riftExchangeContractAddress);

                console.log('allowance:', allowance.toString());
                console.log('tokenDepositAmountInSmallestTokenUnits:', params.tokenDepositAmountInSmallestTokenUnits.toString());
                if (BigNumber.from(allowance).lt(BigNumber.from(params.tokenDepositAmountInSmallestTokenUnits))) {
                    setStatus(DepositStatus.WaitingForDepositTokenApproval);
                    const approveTx = await tokenContract.approve(
                        params.riftExchangeContractAddress,
                        params.tokenDepositAmountInSmallestTokenUnits,
                    );

                    setStatus(DepositStatus.ApprovalPending);
                    await approveTx.wait();
                }

                setStatus(DepositStatus.WaitingForDepositApproval);

                const depositTx = await riftExchangeContractInstance.depositLiquidity(
                    params.tokenDepositAmountInSmallestTokenUnits,
                    params.btcExchangeRate,
                    params.btcPayoutLockingScript,
                    params.vaultIndexToOverwrite,
                    params.vaultIndexWithSameExchangeRate,
                );
                setStatus(DepositStatus.DepositPending);

                setTxHash(depositTx.hash);
                await depositTx.wait();
                setStatus(DepositStatus.Confirmed);
                refreshUserDepositData();
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
