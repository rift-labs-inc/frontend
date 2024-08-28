import { BigNumber, BigNumberish } from 'ethers';
import { ComponentType, ReactElement } from 'react';

export enum ReservationState {
    None,
    Created,
    Unlocked,
    ExpiredAndAddedBackToVault,
    Completed,
}

export interface ReserveLiquidityParams {
    inputSwapAmountInSats: number;
    vaultIndexesToReserve: number[];
    amountsToReserve: BigNumberish[];
    ethPayoutAddress: string;
    expiredSwapReservationIndexes: number[];
}

export interface SwapReservation {
    confirmationBlockHeight: number;
    reservationTimestamp: number;
    unlockTimestamp: number;
    state: ReservationState;
    ethPayoutAddress: string;
    lpReservationHash: string;
    nonce: string;
    totalSwapAmount: BigNumber;
    prepaidFeeAmount: BigNumber;
    vaultIndexes: BigNumber[];
    amountsToReserve: BigNumber[];
}

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
