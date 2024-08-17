import { create } from 'zustand';
import { useEffect } from 'react';
import { DepositAsset, DepositVault, ReserveLiquidityParams, SwapReservation } from './types';
import { BigNumber, ethers } from 'ethers';
import { validDepositAssets } from './utils/constants';

type Store = {
    availableAssets: DepositAsset[];
    setAvailableAssets: (assets: DepositAsset[]) => void;
    allDepositVaults: any;
    setAllDepositVaults: (allDepositVaults: DepositVault[]) => void;
    ethersProvider: ethers.providers.Provider | null;
    setEthersProvider: (provider: ethers.providers.Provider) => void;
    myActiveDepositVaults: DepositVault[];
    setMyActiveDepositVaults: (myActiveDepositVaults: DepositVault[]) => void;
    myCompletedDepositVaults: DepositVault[];
    setMyCompletedDepositVaults: (myCompletedDepositVaults: DepositVault[]) => void;
    bitcoinPriceUSD: number;
    setBitcoinPriceUSD: (price: number) => void;
    ethPriceUSD: number;
    setEthPriceUSD: (price: number) => void;
    wrappedEthPriceUSD: number;
    setWrappedEthPriceUSD: (price: number) => void;
    btcToEthExchangeRate: number;
    setBtcToEthExchangeRate: (rate: number) => void;
    swapFlowState: '0-not-started' | '1-reserve-liquidity' | '2-send-bitcoin' | '3-receive-eth' | '4-completed';
    setSwapFlowState: (
        state: '0-not-started' | '1-reserve-liquidity' | '2-send-bitcoin' | '3-receive-eth' | '4-completed',
    ) => void;
    btcInputSwapAmount: string;
    setBtcInputSwapAmount: (amount: string) => void;
    ethOutputSwapAmount: string;
    setEthOutputSwapAmount: (amount: string) => void;
    selectedVaultToManage: DepositVault | null;
    setSelectedVaultToManage: (vault: DepositVault | null) => void;
    allSwapReservations: SwapReservation[];
    setAllSwapReservations: (reservations: SwapReservation[]) => void;
    showManageDepositVaultsScreen: boolean;
    setShowManageDepositVaultsScreen: (show: boolean) => void;
    totalAvailableLiquidity: BigNumber;
    setTotalAvailableLiquidity: (liquidity: BigNumber) => void;
    totalExpiredReservations: number;
    setTotalExpiredReservations: (totalExpiredReservations: number) => void;
    lowestFeeReservationParams: ReserveLiquidityParams | null;
    setLowestFeeReservationParams: (reservation: ReserveLiquidityParams | null) => void;
    userEthAddress: string;
    setUserEthAddress: (address: string) => void;
    showManageReservationScreen: boolean;
    setShowManageReservationScreen: (show: boolean) => void;
    selectedDepositAsset: DepositAsset | null;
    setSelectedDepositAsset: (asset: DepositAsset | null) => void;
    selectedSwappingAsset: DepositAsset | null;
    setSelectedSwappingAsset: (asset: DepositAsset | null) => void;
};

export const useStore = create<Store>((set) => ({
    availableAssets: [],
    setAvailableAssets: (availableAssets) => set({ availableAssets }),
    allDepositVaults: {},
    setAllDepositVaults: (allDepositVaults) => set({ allDepositVaults }),
    ethersProvider: null,
    setEthersProvider: (ethersProvider) => set({ ethersProvider }),
    myActiveDepositVaults: [],
    setMyActiveDepositVaults: (myActiveDepositVaults) => set({ myActiveDepositVaults }),
    myCompletedDepositVaults: [],
    setMyCompletedDepositVaults: (myCompletedDepositVaults) => set({ myCompletedDepositVaults }),
    bitcoinPriceUSD: 0,
    setBitcoinPriceUSD: (bitcoinPriceUSD) => set({ bitcoinPriceUSD }),
    ethPriceUSD: 0,
    setEthPriceUSD: (ethPriceUSD) => set({ ethPriceUSD }),
    wrappedEthPriceUSD: 0,
    setWrappedEthPriceUSD: (wrappedEthPriceUSD) => set({ wrappedEthPriceUSD }),
    btcToEthExchangeRate: 0,
    setBtcToEthExchangeRate: (btcToEthExchangeRate) => set({ btcToEthExchangeRate }),
    swapFlowState: '0-not-started',
    setSwapFlowState: (swapFlowState) => set({ swapFlowState }),
    btcInputSwapAmount: '',
    setBtcInputSwapAmount: (btcInputSwapAmount) => set({ btcInputSwapAmount }),
    ethOutputSwapAmount: '',
    setEthOutputSwapAmount: (ethOutputSwapAmount) => set({ ethOutputSwapAmount }),
    selectedVaultToManage: null,
    setSelectedVaultToManage: (selectedVaultToManage) => set({ selectedVaultToManage }),
    allSwapReservations: [],
    setAllSwapReservations: (allSwapReservations) => set({ allSwapReservations }),
    showManageDepositVaultsScreen: false,
    setShowManageDepositVaultsScreen: (showManageDepositVaultsScreen) => set({ showManageDepositVaultsScreen }),
    totalAvailableLiquidity: BigNumber.from(0),
    setTotalAvailableLiquidity: (totalAvailableLiquidity) => set({ totalAvailableLiquidity }),
    totalExpiredReservations: 0,
    setTotalExpiredReservations: (totalExpiredReservations) => set({ totalExpiredReservations }),
    lowestFeeReservationParams: null,
    setLowestFeeReservationParams: (lowestFeeReservationParams) => set({ lowestFeeReservationParams }),
    userEthAddress: '',
    setUserEthAddress: (userEthAddress) => set({ userEthAddress }),
    showManageReservationScreen: false,
    setShowManageReservationScreen: (showManageReservationScreen) => set({ showManageReservationScreen }),
    selectedDepositAsset: validDepositAssets.USDT, // Default to USDT TODO: change to null
    setSelectedDepositAsset: (selectedDepositAsset) => set({ selectedDepositAsset }),
    selectedSwappingAsset: validDepositAssets.USDT, // Default to USDT TODO: change to null
    setSelectedSwappingAsset: (selectedSwappingAsset) => set({ selectedSwappingAsset }),
}));
