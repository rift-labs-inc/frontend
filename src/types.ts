import { BigNumberish } from 'ethers';

export type SwapReservation = {
    confirmationBlockHeight: number;
    reservationTimestamp: number;
    unlockTimestamp: number;
    state: ReservationState;
    ethPayoutAddress: string;
    lpReservationHash: string;
    nonce: string;
    totalSwapAmount: BigNumberish;
    prepaidFeeAmount: BigNumberish;
    vaultIndexes: number[];
    amountsToReserve: BigNumberish[];
};

export type ReservationState = 'None' | 'Created' | 'Unlocked' | 'ExpiredAndAddedBackToVault' | 'Completed';

export type DepositVault = {
    initialBalance: BigNumberish;
    unreservedBalance: BigNumberish;
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
