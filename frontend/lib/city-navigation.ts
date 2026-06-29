import type { CityBuilding } from "@/lib/types";
import type { PlaneFlightState } from "@/lib/flight-controls";

export const DEFAULT_PLANE_START: PlaneFlightState = {
  x: 0,
  y: 18,
  z: 90,
  heading: Math.PI
};

export const CITY_BLOCK_SIZE = 72;
export const CITY_RENDER_RADIUS = 280;

export type CityBlock = {
  key: string;
  x: number;
  z: number;
};

export function findUserBuilding(buildings: CityBuilding[], accountId: string | null | undefined): CityBuilding | null {
  if (!accountId) return null;
  return buildings.find((building) => building.instagram_account_id === accountId) ?? null;
}

export function planeSpawnForBuilding(building: CityBuilding | null | undefined): PlaneFlightState {
  if (!building) return DEFAULT_PLANE_START;
  const offset = Math.max(56, building.depth * 4);
  const x = building.position_x;
  const z = building.position_z + offset;
  return {
    x,
    y: Math.max(18, building.height + 18),
    z,
    heading: Math.atan2(building.position_x - x, building.position_z - z)
  };
}

export function visibleBuildingsForPlane(buildings: CityBuilding[], plane: PlaneFlightState, radius = CITY_RENDER_RADIUS): CityBuilding[] {
  const radiusSquared = radius * radius;
  return buildings.filter((building) => {
    const dx = building.position_x - plane.x;
    const dz = building.position_z - plane.z;
    return dx * dx + dz * dz <= radiusSquared;
  });
}

export function buildingBlockKey(building: CityBuilding): string {
  const x = Math.round(building.position_x / CITY_BLOCK_SIZE);
  const z = Math.round(building.position_z / CITY_BLOCK_SIZE);
  return `${x}:${z}`;
}

export function cityBlocksForBuildings(buildings: CityBuilding[]): CityBlock[] {
  const blocks = new Map<string, CityBlock>();
  for (const building of buildings) {
    const key = buildingBlockKey(building);
    if (!blocks.has(key)) {
      blocks.set(key, {
        key,
        x: Math.round(building.position_x / CITY_BLOCK_SIZE) * CITY_BLOCK_SIZE,
        z: Math.round(building.position_z / CITY_BLOCK_SIZE) * CITY_BLOCK_SIZE
      });
    }
  }
  return [...blocks.values()];
}
