"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { advancePlaneFlight, flightKeyForCode, type FlightKeyState, type PlaneFlightState } from "@/lib/flight-controls";
import { useCityStore } from "@/stores/cityStore";

export function PlaneController() {
  const group = useRef<THREE.Group>(null);
  const plane = useRef<PlaneFlightState>({ x: 0, y: 18, z: 90, heading: Math.PI });
  const keys = useRef<FlightKeyState>({ forward: false, backward: false, left: false, right: false, up: false, down: false });
  const setPlane = useCityStore((state) => state.setPlane);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    function key(event: KeyboardEvent, value: boolean) {
      const action = flightKeyForCode(event.code);
      if (!action) return;
      event.preventDefault();
      keys.current[action] = value;
    }

    function mouse(event: MouseEvent) {
      if (document.pointerLockElement === gl.domElement) {
        plane.current.heading -= event.movementX * 0.0022;
      }
    }

    function lock() {
      void gl.domElement.requestPointerLock();
    }

    const down = (event: KeyboardEvent) => key(event, true);
    const up = (event: KeyboardEvent) => key(event, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("mousemove", mouse);
    gl.domElement.addEventListener("click", lock);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("mousemove", mouse);
      gl.domElement.removeEventListener("click", lock);
    };
  }, [gl.domElement]);

  useFrame((_, delta) => {
    const frame = advancePlaneFlight(plane.current, keys.current, delta);
    plane.current = { x: frame.x, y: frame.y, z: frame.z, heading: frame.heading };

    if (group.current) {
      group.current.position.set(frame.x, frame.y, frame.z);
      group.current.rotation.set(frame.pitch, frame.heading, frame.roll);
    }
    setPlane(plane.current);
  });

  return (
    <group ref={group} position={[0, 18, 90]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[1.2, 6, 4]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, -0.8]} scale={[7, 0.14, 1.1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#19c2a0" emissive="#19c2a0" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.05, -3.1]} scale={[2.2, 0.12, 0.8]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}
