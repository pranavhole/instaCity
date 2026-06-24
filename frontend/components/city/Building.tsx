"use client";

import type { ThreeEvent } from "@react-three/fiber";

import { useCityStore } from "@/stores/cityStore";
import type { CityBuilding } from "@/lib/types";
import { Billboard } from "@/components/city/Billboard";

export function Building({ building }: { building: CityBuilding }) {
  const setSelectedBuilding = useCityStore((state) => state.setSelectedBuilding);
  const primary = building.color_palette[0] ?? "#19c2a0";
  const secondary = building.color_palette[1] ?? "#6ea8fe";
  const windows = Array.from({ length: Math.min(building.floors, 28) });
  const trees = Math.min(8, Math.floor((building.stats?.avg_comments ?? 0) / 20));
  const billboards = Math.min(3, Math.max(0, Math.floor((building.stats?.reels_count ?? 0) / 12)));

  function select(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    setSelectedBuilding(building);
  }

  return (
    <group position={[building.position_x, 0, building.position_z]} onClick={select}>
      <mesh position={[0, building.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[building.width, building.height, building.depth]} />
        <meshStandardMaterial
          color={secondary}
          emissive={primary}
          emissiveIntensity={building.glow_intensity * 0.35}
          metalness={building.material_style.includes("metal") || building.material_style.includes("glass") ? 0.65 : 0.2}
          roughness={building.material_style.includes("premium") ? 0.22 : 0.55}
        />
      </mesh>

      {windows.map((_, index) => {
        const y = 4 + index * Math.max(1.8, building.height / Math.max(8, building.floors));
        if (y >= building.height - 2) return null;
        return (
          <group key={index}>
            <mesh position={[0, y, building.depth / 2 + 0.03]}>
              <boxGeometry args={[building.width * 0.68, 0.45, 0.08]} />
              <meshBasicMaterial color="#e0f2fe" transparent opacity={0.55} />
            </mesh>
            <mesh position={[building.width / 2 + 0.03, y, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[building.depth * 0.55, 0.35, 0.08]} />
              <meshBasicMaterial color="#e0f2fe" transparent opacity={0.35} />
            </mesh>
          </group>
        );
      })}

      {Array.from({ length: trees }).map((_, index) => {
        const angle = (index / Math.max(1, trees)) * Math.PI * 2;
        const radius = building.width + 6;
        return (
          <group key={index} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            <mesh position={[0, 1.6, 0]}>
              <cylinderGeometry args={[0.25, 0.35, 3, 6]} />
              <meshStandardMaterial color="#6b4f2a" />
            </mesh>
            <mesh position={[0, 3.6, 0]}>
              <coneGeometry args={[1.6, 3.4, 8]} />
              <meshStandardMaterial color="#2dd4bf" />
            </mesh>
          </group>
        );
      })}

      {Array.from({ length: billboards }).map((_, index) => (
        <Billboard key={index} position={[-building.width / 2 - 0.3, building.height * (0.35 + index * 0.18), 0]} color={primary} />
      ))}
    </group>
  );
}
