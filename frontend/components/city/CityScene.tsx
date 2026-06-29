"use client";

import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";

import { Building } from "@/components/city/Building";
import { CameraController } from "@/components/city/CameraController";
import { CityLights } from "@/components/city/CityLights";
import { Ground } from "@/components/city/Ground";
import { PlaneController } from "@/components/city/PlaneController";
import { findUserBuilding, planeSpawnForBuilding, visibleBuildingsForPlane } from "@/lib/city-navigation";
import type { CityBuilding } from "@/lib/types";
import { useCityStore } from "@/stores/cityStore";

function CityContent({ buildings, currentAccountId }: { buildings: CityBuilding[]; currentAccountId: string | null }) {
  const plane = useCityStore((state) => state.plane);
  const userBuilding = useMemo(() => findUserBuilding(buildings, currentAccountId), [buildings, currentAccountId]);
  const spawn = useMemo(() => planeSpawnForBuilding(userBuilding), [userBuilding]);
  const visibleBuildings = useMemo(() => visibleBuildingsForPlane(buildings, plane), [buildings, plane]);

  return (
    <>
      <CityLights />
      <Ground buildings={visibleBuildings} />
      {visibleBuildings.map((building) => (
        <Building key={building.id} building={building} />
      ))}
      <PlaneController spawn={spawn} />
      <CameraController />
    </>
  );
}

export function CityScene({ buildings, currentAccountId = null }: { buildings: CityBuilding[]; currentAccountId?: string | null }) {
  return (
    <Canvas shadows camera={{ position: [0, 40, 130], fov: 62 }} className="h-full w-full">
      <CityContent buildings={buildings} currentAccountId={currentAccountId} />
    </Canvas>
  );
}
