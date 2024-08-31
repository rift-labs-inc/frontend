import { useState, useCallback, useEffect } from 'react';
import { ethers, BigNumber, BigNumberish } from 'ethers';
import { ERC20ABI, protocolFeeDenominator, protocolFeePercentage } from '../../utils/constants'; // Make sure this import is correct
import { useStore } from '../../store';
import { ProxyWalletLiquidityProvider } from '../../types';
import {
    getMatchingLiquidityReserved,
    getSwapReservations,
    getSwapReservationsLength,
} from '../../utils/contractReadFunctions';
import swapReservationsAggregatorABI from '../../abis/SwapReservationsAggregator.json';
import riftExchangeABI from '../../abis/RiftExchange.json';
import { bufferTo18Decimals, createReservationUrl } from '../../utils/dappHelper';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';

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
    const { address, isConnected } = useAccount();

    const [status, setStatus] = useState<ReserveStatus>(ReserveStatus.Idle);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const userEthAddress = useStore((state) => state.userEthAddress);
    const setUserEthAddress = useStore((state) => state.setUserEthAddress);
    const selectedInputAsset = useStore((state) => state.selectedInputAsset);
    const lowestFeeReservationParams = useStore((state) => state.lowestFeeReservationParams);
    const setLowestFeeReservationParams = useStore((state) => state.setLowestFeeReservationParams);
    const ethersRpcProvider = useStore((state) => state.ethersRpcProvider);
    const router = useRouter();

    const handleNavigation = (route: string) => {
        router.push(route);
    };

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
                // create contract instances
                const tokenContract = new ethers.Contract(params.tokenAddress, ERC20ABI, params.signer);
                const riftExchangeContractInstance = new ethers.Contract(
                    params.riftExchangeContract,
                    params.riftExchangeAbi,
                    params.signer,
                );

                // calculate total amount to reserve
                const totalAmountToReserve = params.amountsToReserve.reduce(
                    (acc, amount) => BigNumber.from(acc).add(amount),
                    BigNumber.from(0),
                );

                // check if user token allowance > reservation fee
                const allowance = await tokenContract.allowance(userEthAddress, params.riftExchangeContract);
                const protocolFee = BigNumber.from(totalAmountToReserve)
                    .mul(protocolFeePercentage)
                    .div(protocolFeeDenominator);
                const reservationFee = selectedInputAsset.releaserFee
                    .add(selectedInputAsset.proverFee)
                    .add(protocolFee);

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

                // LISTEN FOR "LiquidityReserved" CONTRACT EVENT EMIT HERE
                const reservationDetails = await getMatchingLiquidityReserved(
                    ethersRpcProvider,
                    selectedInputAsset.riftExchangeContractAddress,
                    riftExchangeABI.abi,
                    userEthAddress,
                );

                console.log('reservationDetails', reservationDetails);

                // create unique url for the swap
                const reservationUri = createReservationUrl(
                    reservationDetails.orderNonce,
                    reservationDetails.swapReservationIndex,
                );

                try {
                    handleNavigation(`/swap/${reservationUri}`);
                } catch (e) {
                    console.log(e);
                }
                // TODO: how can we make a a dynamic page for the above url and get details about the swap from the url?

                // ---------- CREATE swap args for proxy wallet ---------- //
                const createLiquidityProvider = (
                    amount: string,
                    btcExchangeRate: string,
                    btcPayoutLockingScript: string,
                ): ProxyWalletLiquidityProvider => {
                    return {
                        amount: amount,
                        btcExchangeRate: btcExchangeRate,
                        lockingScriptHex: btcPayoutLockingScript,
                    };
                };

                const liquidityProviders: Array<ProxyWalletLiquidityProvider> = params.vaultIndexesToReserve.map(
                    (index: number, i: number) => {
                        return createLiquidityProvider(
                            BigNumber.from(
                                bufferTo18Decimals(
                                    lowestFeeReservationParams.amountsInμUsdtToReserve[i],
                                    selectedInputAsset.decimals,
                                ),
                            ).toString(),
                            BigNumber.from(lowestFeeReservationParams.btcExchangeRates[i]).toString(),
                            lowestFeeReservationParams.btcPayoutLockingScripts[i],
                        );
                    },
                );

                console.log('please liquidityProviders:', liquidityProviders);

                const reservationNonce = reservationDetails.orderNonce;

                const riftSwapArgs = {
                    orderNonceHex: reservationNonce,
                    liquidityProviders: liquidityProviders,
                };

                console.log('please riftSwapArgs:', riftSwapArgs);
                try {
                    window.rift.createRiftSwap(riftSwapArgs);
                } catch (e) {
                    console.log(e);
                }
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
