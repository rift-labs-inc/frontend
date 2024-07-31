import { create } from 'zustand';
import { useEffect } from 'react';
import { Asset, DepositVault, SwapReservation } from './types';
import { ethers } from 'ethers';

type Store = {
    availableAssets: Asset[];
    setAvailableAssets: (assets: Asset[]) => void;
    allUserDepositVaults: any;
    setAllUserDepositVaults: (allUserDepositVaults: DepositVault[]) => void;
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
    swapFlowState: 'not-started' | 'reserve' | 'chrome-extension' | 'send-bitcoin' | 'receive-eth' | 'completed';
    setSwapFlowState: (
        state: 'not-started' | 'reserve' | 'chrome-extension' | 'send-bitcoin' | 'receive-eth' | 'completed',
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
};

export const useStore = create<Store>((set) => ({
    availableAssets: [],
    setAvailableAssets: (availableAssets) => set({ availableAssets }),
    allUserDepositVaults: {},
    setAllUserDepositVaults: (allUserDepositVaults) => set({ allUserDepositVaults }),
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
    swapFlowState: 'not-started',
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
}));
