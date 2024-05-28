import create from 'zustand';
import { useEffect } from 'react';
import { Swap, LPDeposit, Asset } from './types';

type Store = {
    activityData: Swap[];
    setActivityData: (activity: Swap[]) => void;
    liquidityData: LPDeposit[];
    setLiquidityData: (liquidity: LPDeposit[]) => void;
    availableAssets: Asset[];
    setAvailableAssets: (assets: Asset[]) => void;
};

export const useStore = create<Store>((set) => ({
    activityData: [],
    setActivityData: (activityData) => set({ activityData }),
    liquidityData: [],
    setLiquidityData: (liquidityData) => set({ liquidityData }),
    availableAssets: [],
    setAvailableAssets: (availableAssets) => set({ availableAssets }),
}));
