import { BigNumber, BigNumberish, ethers } from 'ethers';
import { ComponentType, ReactElement } from 'react';

export enum ReservationState {
    None,
    Created,
    Unlocked,
    ExpiredAndAddedBackToVault,
    Completed,
}

export type ReserveLiquidityParams = {
    swapAmountInSats: number;
    vaultIndexesToReserve: number[];
    amountsInMicroUsdtToReserve: BigNumberish[];
    amountsInSatsToBePaid: BigNumberish[];
    btcPayoutLockingScripts: string[];
    btcExchangeRates: BigNumberish[];
    ethPayoutAddress: string;
    expiredSwapReservationIndexes: number[];
    totalSatsInputInlcudingProxyFee: BigNumber;
};

export type SwapReservation = {
    owner: string;
    confirmationBlockHeight: number;
    reservationTimestamp: number;
    unlockTimestamp: number;
    state: ReservationState;
    ethPayoutAddress: string;
    lpReservationHash: string;
    nonce: string;
    indexInContract?: number;
    totalSatsInputInlcudingProxyFee: BigNumber;
    totalSwapOutputAmount: BigNumber;
    prepaidFeeAmount: BigNumber;
    proposedBlockHeight: BigNumber;
    proposedBlockHash: string;
    vaultIndexes: number[];
    amountsToReserve: BigNumber[];
};

export type DepositVault = {
    initialBalance: BigNumberish;
    unreservedBalanceFromContract: BigNumberish;
    trueUnreservedBalance?: BigNumberish;
    withdrawnAmount: BigNumberish;
    reservedBalance?: BigNumberish;
    btcExchangeRate: BigNumberish;
    btcPayoutLockingScript: string;
    index?: number;
    depositAsset: ValidAsset;
};

export type ValidAsset = {
    name: string;
    tokenAddress?: string;
    decimals: number;
    riftExchangeContractAddress?: string;
    riftExchangeAbi?: any;
    contractChainID?: number;
    contractRpcURL?: string;
    proverFee?: BigNumber;
    releaserFee?: BigNumber;
    icon_svg: any;
    bg_color: string;
    border_color: string;
    border_color_light: string;
    dark_bg_color: string;
    light_text_color: string;
    exchangeRateInTokenPerBTC?: number | null;
    exchangeRateInSmallestTokenUnitPerSat?: BigNumber | null;
    priceUSD: number | null;
    totalAvailableLiquidity?: BigNumber;
    connectedUserBalanceRaw?: BigNumber;
    connectedUserBalanceFormatted?: string;
};

export type LiqudityProvider = {
    depositVaultIndexes: number[];
};

export interface ProxyWalletLiquidityProvider {
    amount: string;
    btcExchangeRate: string;
    lockingScriptHex: string;
}

export interface ProxyWalletSwapArgs {
    orderNonceHex: string;
    liquidityProviders: Array<ProxyWalletLiquidityProvider>;
}

export type AssetType = 'BTC' | 'USDT' | 'ETH' | 'WETH' | 'WBTC';

export type CurrencyModalTitle = 'send' | 'recieve' | 'deposit' | 'close';

export type LiquidityReservedEvent = {
    reserver: string;
    swapReservationIndex: string;
    orderNonce: string;
    event: ethers.Event;
};

export type RouteButton = 'Swap' | 'Manage' | 'About';

export const ROUTES: { [k in RouteButton]: string } = {
    Swap: '/',
    Manage: '/manage',
    About: '/about',
};
