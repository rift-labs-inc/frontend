import { create } from 'zustand';
import { useEffect } from 'react';
import { Swap, LiqudityProvider, Asset, DepositVault } from './types';
import { ethers } from 'ethers';

type Store = {
    activityData: Swap[];
    setActivityData: (activity: Swap[]) => void;
    availableAssets: Asset[];
    setAvailableAssets: (assets: Asset[]) => void;
    allUserDepositVaults: any;
    setAllUserDepositVaults: (allUserDepositVaults: DepositVault[]) => void;
    ethersProvider: ethers.providers.Provider | null;
    setEthersProvider: (provider: ethers.providers.Provider) => void;
};

export const useStore = create<Store>((set) => ({
    activityData: [],
    setActivityData: (activityData) => set({ activityData }),
    availableAssets: [],
    setAvailableAssets: (availableAssets) => set({ availableAssets }),
    allUserDepositVaults: {},
    setAllUserDepositVaults: (allUserDepositVaults) => set({ allUserDepositVaults }),
    ethersProvider: null,
    setEthersProvider: (ethersProvider) => set({ ethersProvider }),
}));
