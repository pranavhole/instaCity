"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { advancePlaneFlight, flightKeyForCode, nudgePlaneAltitude, type FlightKeyState, type PlaneFlightState } from "@/lib/flight-controls";
import { useCityStore } from "@/stores/cityStore";

const leftWing = new Float32Array([0, 0.22, 4.2, -3.4, -0.18, -2.4, 0, 0.05, -0.7]);
const rightWing = new Float32Array([0, 0.22, 4.2, 0, 0.05, -0.7, 3.4, -0.18, -2.4]);
const centerFold = new Float32Array([0, 0.24, 4.2, -0.42, -0.04, -3.1, 0.42, -0.04, -3.1]);
const leftKeel = new Float32Array([0, 0.02, -0.5, -0.42, -0.04, -3.1, 0, -0.9, -1.7]);
const rightKeel = new Float32Array([0, 0.02, -0.5, 0, -0.9, -1.7, 0.42, -0.04, -3.1]);

function Triangle({ vertices, color, emissive = "#000000" }: { vertices: Float32Array; color: string; emissive?: string }) {
  return (
    <mesh castShadow>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[vertices, 3]} />
      </bufferGeometry>
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.12} roughness={0.72} metalness={0.02} side={THREE.DoubleSide} />
    </mesh>
  );
}

function PaperPlaneModel() {
  return (
    <group scale={[1.2, 1.2, 1.2]}>
      <Triangle vertices={leftWing} color="#fff7fb" emissive="#ff2f87" />
      <Triangle vertices={rightWing} color="#f4ecff" emissive="#7c2be8" />
      <Triangle vertices={centerFold} color="#ffffff" />
      <Triangle vertices={leftKeel} color="#d8c8ff" />
      <Triangle vertices={rightKeel} color="#ffd6e8" />
      <mesh position={[0, 0.16, 4.1]} scale={[0.24, 0.16, 0.4]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#ff7a45" emissive="#ff2f87" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

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
        plane.current = nudgePlaneAltitude(plane.current, event.movementY);
      }
    }

    function lock() {
      const request = gl.domElement.requestPointerLock();
      if (request instanceof Promise) {
        void request.catch(() => undefined);
      }
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
      <PaperPlaneModel />
    </group>
  );
}
