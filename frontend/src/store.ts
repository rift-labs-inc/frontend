import create from "zustand";
import { useEffect } from "react";
import { Swap, LPDeposit } from "./types";

type Store = {
  activityData: Swap[];
  setActivityData: (activity: Swap[]) => void;
  liquidityData: LPDeposit[];
  setLiquidityData: (liquidity: LPDeposit[]) => void;
};

export const useStore = create<Store>((set) => ({
  activityData: [],
  setActivityData: (activityData) => set({ activityData }),
  liquidityData: [],
  setLiquidityData: (liquidityData) => set({ liquidityData }),
}));
