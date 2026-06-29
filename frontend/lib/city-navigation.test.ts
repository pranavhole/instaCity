import { describe, expect, it } from "vitest";

import { DEFAULT_PLANE_START, buildingBlockKey, findUserBuilding, planeSpawnForBuilding, visibleBuildingsForPlane } from "./city-navigation";
import type { CityBuilding } from "./types";

function building(overrides: Partial<CityBuilding>): CityBuilding {
  return {
    id: overrides.id ?? "building-1",
    instagram_account_id: overrides.instagram_account_id ?? "account-1",
    username: overrides.username ?? "creator",
    profile_picture_url: null,
    category: "Public profile",
    building_type: "Small House",
    district: "Default",
    height: overrides.height ?? 20,
    width: overrides.width ?? 8,
    depth: overrides.depth ?? 8,
    floors: 2,
    glow_intensity: 0.2,
    material_style: "matte",
    position_x: overrides.position_x ?? 0,
    position_y: overrides.position_y ?? 10,
    position_z: overrides.position_z ?? 0,
    color_palette: ["#ff2f87", "#7c2be8"],
    created_at: "2026-06-29T00:00:00Z",
    updated_at: "2026-06-29T00:00:00Z",
    stats: null
  };
}

describe("city navigation", () => {
  it("finds the building owned by the current Instagram account", () => {
    const owned = building({ id: "owned", instagram_account_id: "current-account" });

    expect(findUserBuilding([building({ id: "other", instagram_account_id: "other" }), owned], "current-account")).toBe(owned);
    expect(findUserBuilding([owned], null)).toBeNull();
  });

  it("starts the plane outside the user building and faces the building", () => {
    const target = building({ position_x: 120, position_z: -40, height: 32, depth: 10 });
    const spawn = planeSpawnForBuilding(target);

    expect(spawn.x).toBe(120);
    expect(spawn.z).toBeGreaterThan(target.position_z);
    expect(spawn.y).toBeGreaterThan(target.height);
    expect(spawn.heading).toBeCloseTo(Math.PI);
  });

  it("falls back to the default spawn when the user has no building", () => {
    expect(planeSpawnForBuilding(null)).toEqual(DEFAULT_PLANE_START);
  });

  it("filters rendered buildings around the current flight location", () => {
    const near = building({ id: "near", position_x: 20, position_z: 10 });
    const far = building({ id: "far", position_x: 800, position_z: 800 });

    expect(visibleBuildingsForPlane([near, far], { ...DEFAULT_PLANE_START, x: 0, z: 0 })).toEqual([near]);
  });

  it("groups buildings into city block keys", () => {
    expect(buildingBlockKey(building({ position_x: 70, position_z: 75 }))).toBe("1:1");
  });
});
