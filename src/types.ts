import { BigNumber, BigNumberish } from 'ethers';

export enum ReservationState {
    None,
    Created,
    Unlocked,
    ExpiredAndAddedBackToVault,
    Completed,
}

export interface ReserveLiquidityParams {
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
    unreservedBalance: BigNumberish;
    calculatedTrueUnreservedBalance?: BigNumberish;
    btcExchangeRate: BigNumberish;
    btcPayoutLockingScript: string;
    index?: number;
};

export type Asset = {
    name: string;
    icon_svg: string;
    bg_color: string;
    border_color: string;
};

export type LiqudityProvider = {
    depositVaultIndexes: number[];
};
