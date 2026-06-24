export function Billboard({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[7, 4, 0.35]} />
        <meshStandardMaterial color="#080b10" emissive={color} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <planeGeometry args={[5.8, 2.7]} />
        <meshBasicMaterial color={color} transparent opacity={0.72} />
      </mesh>
    </group>
  );
}
