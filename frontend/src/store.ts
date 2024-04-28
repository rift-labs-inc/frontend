import create from "zustand";
import { useEffect } from "react";
import { Swap } from "./types";

type Store = {
  activityData: Swap[];
  setActivityData: (activity: Swap[]) => void;
};

export const useStore = create<Store>((set) => ({
  activityData: [],
  setActivityData: (activityData) => set({ activityData }),
}));
