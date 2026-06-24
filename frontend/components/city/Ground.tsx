export function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[900, 900, 80, 80]} />
        <meshStandardMaterial color="#111922" roughness={0.9} metalness={0.1} />
      </mesh>
      <gridHelper args={[900, 45, "#19c2a0", "#243241"]} position={[0, 0.03, 0]} />
    </group>
  );
}
