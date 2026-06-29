import { CITY_BLOCK_SIZE, cityBlocksForBuildings } from "@/lib/city-navigation";
import type { CityBuilding } from "@/lib/types";

export function Ground({ buildings = [] }: { buildings?: CityBuilding[] }) {
  const blocks = cityBlocksForBuildings(buildings);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[900, 900, 80, 80]} />
        <meshStandardMaterial color="#090b18" roughness={0.9} metalness={0.1} />
      </mesh>
      <gridHelper args={[900, 45, "#ff2f87", "#241536"]} position={[0, 0.03, 0]} />
      {blocks.map((block, index) => (
        <mesh key={block.key} position={[block.x, 0.06, block.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[CITY_BLOCK_SIZE - 10, CITY_BLOCK_SIZE - 10]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? "#111326" : "#151630"}
            emissive={index % 2 === 0 ? "#7c2be8" : "#ff2f87"}
            emissiveIntensity={0.06}
            roughness={0.82}
            metalness={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}
