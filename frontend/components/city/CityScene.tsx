"use client";

import { Canvas } from "@react-three/fiber";

import { Building } from "@/components/city/Building";
import { CameraController } from "@/components/city/CameraController";
import { CityLights } from "@/components/city/CityLights";
import { Ground } from "@/components/city/Ground";
import { PlaneController } from "@/components/city/PlaneController";
import type { CityBuilding } from "@/lib/types";

export function CityScene({ buildings }: { buildings: CityBuilding[] }) {
  return (
    <Canvas shadows camera={{ position: [0, 40, 130], fov: 62 }} className="h-full w-full">
      <CityLights />
      <Ground />
      {buildings.map((building) => (
        <Building key={building.id} building={building} />
      ))}
      <PlaneController />
      <CameraController />
    </Canvas>
  );
}
