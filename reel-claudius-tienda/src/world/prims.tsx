import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C } from "../theme";

const Y = new THREE.Vector3(0, 1, 0);
const CREAM = new THREE.Color(C.cream);
const ORANGE = new THREE.Color(C.orange);

/** Cream block. `glow` 0 → 1 turns its emission from a faint warm cream to bright orange. */
export const Block: React.FC<{
  p: V3; size?: number | V3; glow?: number; opacity?: number; rot?: V3;
}> = ({ p, size = 0.34, glow = 0, opacity = 1, rot = [0, 0, 0] }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, roughness: 0.7, flatShading: true }), []);
  mat.emissive.copy(CREAM).lerp(ORANGE, Math.min(1, glow * 1.2));
  mat.emissiveIntensity = 0.06 + glow * 1.5;
  mat.color.copy(CREAM).lerp(ORANGE, glow * 0.6);
  mat.transparent = opacity < 1;
  mat.opacity = opacity;
  const s: V3 = typeof size === "number" ? [size, size, size] : size;
  if (opacity <= 0.001) return null;
  return (
    <mesh position={p} rotation={rot} scale={s} material={mat}>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
};

/** Unlit bright material for lines of light (blooms). */
export const useGlowMat = (color: string, boost: number) => useMemo(() => {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(boost), transparent: true, depthWrite: false, toneMapped: false });
  return m;
}, [color, boost]);

/** Bar of light from a to b (grows from a with `p`). */
export const Seg: React.FC<{ a: V3; b: V3; w: number; p?: number; mat: THREE.Material; flat?: boolean }> = ({ a, b, w, p = 1, mat, flat }) => {
  if (p <= 0.001) return null;
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const len = dir.length() * p;
  const mid = va.clone().add(dir.clone().multiplyScalar(p / 2));
  const q = new THREE.Quaternion().setFromUnitVectors(Y, dir.normalize());
  return (
    <mesh position={mid} quaternion={q} scale={[w, len, flat ? w * 0.3 : w]} material={mat}>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
};

/** Flat ring (or arc, with `p` < 1) lying on the ground. */
export const GroundRing: React.FC<{ c: V3; r: number; w: number; p?: number; mat: THREE.Material; start?: number; sx?: number; sz?: number }> = ({
  c, r, w, p = 1, mat, start = 0, sx = 1, sz = 1,
}) => {
  if (p <= 0.001) return null;
  return (
    <mesh position={c} rotation={[-Math.PI / 2, 0, 0]} scale={[sx, sz, 1]} material={mat}>
      <ringGeometry args={[r - w / 2, r + w / 2, 72, 1, start, Math.PI * 2 * p]} />
    </mesh>
  );
};
