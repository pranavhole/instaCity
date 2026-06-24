"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useCityStore } from "@/stores/cityStore";

export function CameraController() {
  const camera = useThree((state) => state.camera);

  useFrame(() => {
    const plane = useCityStore.getState().plane;
    const back = new THREE.Vector3(Math.sin(plane.heading), 0, Math.cos(plane.heading)).multiplyScalar(-28);
    const target = new THREE.Vector3(plane.x, plane.y + 7, plane.z);
    const desired = target.clone().add(back).add(new THREE.Vector3(0, 13, 0));
    camera.position.lerp(desired, 0.08);
    camera.lookAt(target);
  });

  return null;
}
