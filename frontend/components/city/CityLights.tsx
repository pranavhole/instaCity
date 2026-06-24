export function CityLights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[120, 180, 80]} intensity={1.8} castShadow />
      <pointLight position={[0, 80, 0]} intensity={1.5} color="#19c2a0" distance={420} />
      <pointLight position={[-160, 55, -120]} intensity={1.2} color="#ff6b6b" distance={320} />
      <fog attach="fog" args={["#0b1117", 220, 760]} />
    </>
  );
}
