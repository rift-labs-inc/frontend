import { useState, useCallback, useEffect } from 'react';
import { ethers, BigNumber, BigNumberish } from 'ethers';
import { ERC20ABI } from '../../utils/constants'; // Make sure this import is correct
import { useStore } from '../../store';

export enum ReserveStatus {
    Idle = 'idle',
    WaitingForWalletConfirmation = 'waitingForWalletConfirmation',
    WaitingForTokenApproval = 'waitingForTokenApproval',
    ApprovalPending = 'approvalPending',
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
    tokenAddress: string;
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
    const userEthAddress = useStore((state) => state.userEthAddress);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);

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
                const tokenContract = new ethers.Contract(params.tokenAddress, ERC20ABI, params.signer);
                const riftExchangeContractInstance = new ethers.Contract(params.riftExchangeContract, params.riftExchangeAbi, params.signer);

                // Calculate total amount to reserve
                const totalAmountToReserve = params.amountsToReserve.reduce((acc, amount) => BigNumber.from(acc).add(amount), BigNumber.from(0));

                // Check allowance
                const allowance = await tokenContract.allowance(userEthAddress, params.riftExchangeContract);

                const protocolFeePercentage = BigNumber.from(1); // 0.1%
                const protocolFeeDenominator = BigNumber.from(1000); // 100% / 0.1% = 1000

                const protocolFee = BigNumber.from(totalAmountToReserve).mul(protocolFeePercentage).div(protocolFeeDenominator);

                // Calculate the total reservation fee
                const reservationFee = selectedInputAsset.releaserFee.add(selectedInputAsset.proverFee).add(protocolFee);

                if (BigNumber.from(allowance).lt(reservationFee)) {
                    setStatus(ReserveStatus.WaitingForTokenApproval);
                    const approveTx = await tokenContract.approve(params.riftExchangeContract, reservationFee);

                    setStatus(ReserveStatus.ApprovalPending);
                    await approveTx.wait();
                }

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

                // create swap in proxy wallet
                // const createRiftSwapArgs = {
                //     orderNonceHex: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', // example nonce in hexadecimal format
                //     liquidityProviders: [
                //         {
                //             amount: '0.5', // example amount of liquidity provided
                //             btcExchangeRate: '40000', // example BTC exchange rate
                //             lockingScriptHex: '76a91489abcdefabbaabbaabbaabbaabbaabbaabba88ac', // example locking script in hexadecimal format
                //         },
                //         {
                //             amount: '1.0',
                //             btcExchangeRate: '39000',
                //             lockingScriptHex: '76a914abcdefabcdefabcdefabcdefabcdefabcdef88ac',
                //         },
                //     ],
                // };
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
