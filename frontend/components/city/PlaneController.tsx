"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { useCityStore } from "@/stores/cityStore";

type KeyState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
};

const CITY_BOUND = 410;

export function PlaneController() {
  const group = useRef<THREE.Group>(null);
  const heading = useRef(Math.PI);
  const position = useRef(new THREE.Vector3(0, 18, 90));
  const keys = useRef<KeyState>({ forward: false, backward: false, left: false, right: false, up: false, down: false });
  const setPlane = useCityStore((state) => state.setPlane);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    function key(event: KeyboardEvent, value: boolean) {
      const code = event.code;
      if (code === "KeyW") keys.current.forward = value;
      if (code === "KeyS") keys.current.backward = value;
      if (code === "KeyA") keys.current.left = value;
      if (code === "KeyD") keys.current.right = value;
      if (code === "Space") keys.current.up = value;
      if (code === "ShiftLeft" || code === "ShiftRight") keys.current.down = value;
    }

    function mouse(event: MouseEvent) {
      if (document.pointerLockElement === gl.domElement) {
        heading.current -= event.movementX * 0.0022;
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
    const turnSpeed = 1.45 * delta;
    const moveSpeed = 46 * delta;
    const verticalSpeed = 26 * delta;
    if (keys.current.left) heading.current += turnSpeed;
    if (keys.current.right) heading.current -= turnSpeed;

    const direction = new THREE.Vector3(Math.sin(heading.current), 0, Math.cos(heading.current));
    if (keys.current.forward) position.current.addScaledVector(direction, moveSpeed);
    if (keys.current.backward) position.current.addScaledVector(direction, -moveSpeed * 0.6);
    if (keys.current.up) position.current.y += verticalSpeed;
    if (keys.current.down) position.current.y -= verticalSpeed;

    position.current.x = THREE.MathUtils.clamp(position.current.x, -CITY_BOUND, CITY_BOUND);
    position.current.y = THREE.MathUtils.clamp(position.current.y, 8, 120);
    position.current.z = THREE.MathUtils.clamp(position.current.z, -CITY_BOUND, CITY_BOUND);

    if (group.current) {
      group.current.position.copy(position.current);
      group.current.rotation.set(0.08, heading.current, keys.current.left ? 0.22 : keys.current.right ? -0.22 : 0);
    }
    setPlane({ x: position.current.x, y: position.current.y, z: position.current.z, heading: heading.current });
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
