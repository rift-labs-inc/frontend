import create from "zustand";
import { useEffect } from "react";

type Store = {};

export const useStore = create<Store>((set) => ({}));
