import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";

const Y = new THREE.Vector3(0, 1, 0);

/** Unlit bright material for lines of light (blooms). */
export const useGlowMat = (color: string, boost: number) => useMemo(() => {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(boost), transparent: true, depthWrite: false, toneMapped: false });
  return m;
}, [color, boost]);

/** Bar of light from a to b (grows from a with `p`). */
export const Seg: React.FC<{ a: V3; b: V3; w: number; p?: number; mat: THREE.Material }> = ({ a, b, w, p = 1, mat }) => {
  if (p <= 0.001) return null;
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const len = dir.length() * p;
  const mid = va.clone().add(dir.clone().multiplyScalar(p / 2));
  const q = new THREE.Quaternion().setFromUnitVectors(Y, dir.normalize());
  return (
    <mesh position={mid} quaternion={q} scale={[w, len, w]} material={mat}>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
};

/** Flat ring lying on the ground. */
export const GroundRing: React.FC<{ c: V3; r: number; w: number; mat: THREE.Material }> = ({ c, r, w, mat }) => (
  <mesh position={c} rotation={[-Math.PI / 2, 0, 0]} material={mat}>
    <ringGeometry args={[Math.max(0.001, r - w / 2), r + w / 2, 96]} />
  </mesh>
);
