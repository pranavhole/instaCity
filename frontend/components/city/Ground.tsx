export function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[900, 900, 80, 80]} />
        <meshStandardMaterial color="#090b18" roughness={0.9} metalness={0.1} />
      </mesh>
      <gridHelper args={[900, 45, "#ff2f87", "#241536"]} position={[0, 0.03, 0]} />
    </group>
  );
}
