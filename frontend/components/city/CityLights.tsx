export function CityLights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[120, 180, 80]} intensity={1.8} castShadow />
      <pointLight position={[0, 80, 0]} intensity={1.5} color="#ff2f87" distance={420} />
      <pointLight position={[-160, 55, -120]} intensity={1.2} color="#ff7a45" distance={320} />
      <pointLight position={[160, 48, 140]} intensity={0.9} color="#7c2be8" distance={360} />
      <fog attach="fog" args={["#050712", 220, 760]} />
    </>
  );
}
