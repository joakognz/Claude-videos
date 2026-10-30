import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EV, S, clamp01, springAt } from "../theme";
import { FINDINGS, crackMid, lupaAt, sinkY } from "./layout";
import { Seg, useGlowMat } from "./prims";

/** Where the Lupa is looking at time t (its scan beam), or null. */
const targetAt = (t: number): V3 | null => {
  if (t >= EV.cracks - 0.2 && t < EV.morph) {
    // sweeps the cracks one after the other, then holds on the whole wall
    const order = [0, 2, 3, 1];
    const k = Math.min(order.length - 1, Math.max(0, Math.floor((t - EV.cracks + 0.1) / EV.crackStep)));
    const c = crackMid(order[k]);
    return [c[0], c[1] + sinkY(t), c[2]];
  }
  if (t >= EV.scan && t < S.E10 + 0.4) {
    const k = Math.floor((t - EV.scan) / 0.45) % FINDINGS.length;
    const f = FINDINGS[k];
    return [f[0] * 0.6, 0.9, f[2] * 0.6];
  }
  return null;
};

/**
 * The Lupa: a low-poly translucent crystal lens of orange light with a brighter core, a lens ring and a short handle.
 * It always faces the camera (the lens reads as a circle).
 */
export const Lupa: React.FC<{ t: number }> = ({ t }) => {
  const glass = useMemo(() => new THREE.MeshStandardMaterial({
    color: C.orange, emissive: C.orange, emissiveIntensity: 0.9, transparent: true, opacity: 0.45, roughness: 0.2, flatShading: true,
  }), []);
  const ring = useMemo(() => new THREE.MeshStandardMaterial({ color: C.orange, emissive: C.orange, emissiveIntensity: 1.8, flatShading: true }), []);
  const core = useGlowMat(C.orangeSoft, 3);
  const beam = useGlowMat(C.orangeSoft, 1.5);
  const s = springAt(t, EV.lupa, 10, 150);
  if (s <= 0.001) return null;
  const p = lupaAt(t);
  const dim = 1 - 0.55 * clamp01((t - S.E10) / 0.5);
  ring.emissiveIntensity = (1.6 + 0.3 * Math.sin(t * 2.6)) * dim;
  glass.emissiveIntensity = 0.9 * dim;
  core.opacity = dim;
  const target = targetAt(t);
  const pulse = (t * 2.2) % 1;
  beam.opacity = 0.55 * (1 - pulse * 0.5) * dim;
  const sc = 1.15 * s;
  return (
    <>
      {/* lens plane faces the camera: rotate its normal (+z) to the view direction (+x +z, elevated) */}
      <group position={p} rotation={[-0.35, Math.PI / 4, 0, "YXZ"]} scale={sc}>
        <group rotation={[0, 0, Math.sin(t * 0.9) * 0.12]}>
          <mesh material={glass} scale={[0.5, 0.5, 0.16]}>
            <icosahedronGeometry args={[1, 1]} />
          </mesh>
          <mesh material={core} scale={0.13 + 0.02 * Math.sin(t * 4)}>
            <octahedronGeometry args={[1, 0]} />
          </mesh>
          <mesh material={ring}>
            <torusGeometry args={[0.55, 0.075, 6, 18]} />
          </mesh>
          <mesh material={ring} position={[0.6, -0.6, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.07, 0.09, 0.55, 6]} />
          </mesh>
        </group>
      </group>
      <pointLight position={p} color={C.orange} intensity={4 * s * dim} distance={6} decay={1.6} />
      {target && <Seg a={p} b={target} w={0.06 + 0.05 * Math.sin(Math.PI * pulse)} mat={beam} />}
      {target && <mesh position={target} scale={0.12 + 0.12 * pulse} material={beam}><sphereGeometry args={[1, 10, 8]} /></mesh>}
    </>
  );
};

