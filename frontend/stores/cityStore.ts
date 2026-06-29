import { create } from "zustand";

import { emptyFlightKeys, type FlightKeyState } from "@/lib/flight-controls";
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
  mobileKeys: FlightKeyState;
  setSelectedBuilding: (building: CityBuilding | null) => void;
  setPlane: (plane: PlaneState) => void;
  setMobileKeys: (mobileKeys: FlightKeyState) => void;
  resetMobileKeys: () => void;
};

export const useCityStore = create<CityState>((set) => ({
  selectedBuilding: null,
  plane: { x: 0, y: 18, z: 90, heading: Math.PI },
  mobileKeys: emptyFlightKeys,
  setSelectedBuilding: (selectedBuilding) => set({ selectedBuilding }),
  setPlane: (plane) => set({ plane }),
  setMobileKeys: (mobileKeys) => set({ mobileKeys }),
  resetMobileKeys: () => set({ mobileKeys: emptyFlightKeys })
}));
