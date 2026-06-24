import { create } from "zustand";

import type { CityBuilding } from "@/lib/types";

export type PlaneState = {
  x: number;
  y: number;
  z: number;
  heading: number;
};

type CityState = {
  selectedBuilding: CityBuilding | null;
  plane: PlaneState;
  setSelectedBuilding: (building: CityBuilding | null) => void;
  setPlane: (plane: PlaneState) => void;
};

export const useCityStore = create<CityState>((set) => ({
  selectedBuilding: null,
  plane: { x: 0, y: 18, z: 90, heading: Math.PI },
  setSelectedBuilding: (selectedBuilding) => set({ selectedBuilding }),
  setPlane: (plane) => set({ plane })
}));
