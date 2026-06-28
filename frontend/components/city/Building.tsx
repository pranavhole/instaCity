"use client";

import { Billboard as DreiBillboard, Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { useCityStore } from "@/stores/cityStore";
import type { CityBuilding } from "@/lib/types";
import { Billboard } from "@/components/city/Billboard";

function FloatingProfileId({ username, height }: { username: string; height: number }) {
  const group = useRef<THREE.Group>(null);
  const phase = username.length * 0.37;

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.y = height + 8 + Math.sin(clock.elapsedTime * 2.2 + phase) * 0.8;
    }
  });

  return (
    <group ref={group} position={[0, height + 8, 0]}>
      <DreiBillboard>
        <Text
          fontSize={3.4}
          maxWidth={26}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#ffffff"
          outlineColor="#050712"
          outlineWidth={0.16}
        >
          @{username}
        </Text>
      </DreiBillboard>
    </group>
  );
}

export function Building({ building }: { building: CityBuilding }) {
  const setSelectedBuilding = useCityStore((state) => state.setSelectedBuilding);
  const primary = building.color_palette[0] ?? "#ff2f87";
  const secondary = building.color_palette[1] ?? "#7c2be8";
  const windows = Array.from({ length: Math.min(building.floors, 28) });
  const trees = Math.min(8, Math.floor((building.stats?.avg_comments ?? 0) / 20));
  const billboards = Math.min(3, Math.max(0, Math.floor((building.stats?.reels_count ?? 0) / 12)));

  function select(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    setSelectedBuilding(building);
  }

  return (
    <group position={[building.position_x, 0, building.position_z]} onClick={select}>
      <FloatingProfileId username={building.username} height={building.height} />

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
              <meshBasicMaterial color="#ffe1f2" transparent opacity={0.58} />
            </mesh>
            <mesh position={[building.width / 2 + 0.03, y, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[building.depth * 0.55, 0.35, 0.08]} />
              <meshBasicMaterial color="#ffd6eb" transparent opacity={0.38} />
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
              <meshStandardMaterial color="#2b183b" />
            </mesh>
            <mesh position={[0, 3.6, 0]}>
              <coneGeometry args={[1.6, 3.4, 8]} />
              <meshStandardMaterial color="#b238d8" emissive="#7c2be8" emissiveIntensity={0.18} />
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
