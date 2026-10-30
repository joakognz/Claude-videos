import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EASE, EASE_OUT, EV, TITLE, clamp01, springAt } from "../theme";
import { BIZ_H, BIZ_W, FINDINGS, FINDING_OK, riseAt } from "./layout";
import { GroundRing, Seg, useGlowMat } from "./prims";
import { signTex } from "./textures";

/** The supervision lens: a cream ring that visits each finding in turn. */
export const reviewLensAt = (t: number): { p: V3; k: number } => {
  const k = Math.min(FINDINGS.length - 1, Math.max(0, Math.floor((t - EV.review + 0.25) / EV.reviewStep)));
  const prev = FINDINGS[Math.max(0, k - 1)];
  const cur = FINDINGS[k];
  const p = k === 0 ? 1 : EASE(clamp01((t - (EV.review + (k - 1) * EV.reviewStep)) / (EV.reviewStep * 0.8)));
  const start: V3 = [FINDINGS[0][0] - 1.4, FINDINGS[0][1] + 0.6, FINDINGS[0][2] + 0.6];
  const from = k === 0 ? start : prev;
  const q = k === 0 ? EASE(clamp01((t - EV.review + 0.6) / 0.5)) : p;
  return { p: [from[0] + (cur[0] - from[0]) * q, from[1] + (cur[1] - from[1]) * q + 0.05, from[2] + (cur[2] - from[2]) * q], k };
};

/** E9: a small cream building ("tu negocio") rises; the Lupa's findings float over it; a cream lens weighs each one. */
export const Business: React.FC<{ t: number }> = ({ t }) => {
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color(C.cream).multiplyScalar(0.62), roughness: 0.9, flatShading: true }), []);
  const roof = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2f27", roughness: 0.9, flatShading: true }), []);
  const glass = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.orangeSoft).multiplyScalar(0.9), toneMapped: false }), []);
  const sign = useMemo(() => signTex(true, TITLE), []);
  const find = useGlowMat(C.orange, 2.4);
  const lens = useGlowMat(C.cream, 1.6);
  const link = useGlowMat(C.orangeSoft, 1.2);
  const r = riseAt(t);
  if (r <= 0) return null;
  const dark = 1 - 0.5 * clamp01((t - EV.dark) / 0.6);
  glass.color.set(C.orangeSoft).multiplyScalar(0.9 * dark);
  const H = BIZ_H * r;
  const W = BIZ_W;
  const lensIn = EASE_OUT(clamp01((t - EV.review + 0.6) / 0.4)) * dark;
  lens.opacity = lensIn;
  const L = reviewLensAt(t);
  link.opacity = 0.5 * dark;
  return (
    <group>
      <mesh material={wall} position={[0, H / 2, 0]} scale={[W, H, W]}><boxGeometry args={[1, 1, 1]} /></mesh>
      <mesh material={roof} position={[0, H + 0.06, 0]} scale={[W + 0.2, 0.12, W + 0.2]}><boxGeometry args={[1, 1, 1]} /></mesh>
      {r > 0.98 && (
        <>
          <mesh material={glass} position={[-0.35, 0.65, W / 2 + 0.012]}><planeGeometry args={[1.2, 0.85]} /></mesh>
          <mesh material={glass} position={[0.75, 0.55, W / 2 + 0.012]}><planeGeometry args={[0.5, 1.05]} /></mesh>
          <mesh material={glass} position={[W / 2 + 0.012, 0.7, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[1.6, 0.8]} /></mesh>
          <mesh position={[0, BIZ_H - 0.25, W / 2 + 0.02]}>
            <planeGeometry args={[W - 0.2, 0.42]} />
            <meshBasicMaterial map={sign} toneMapped={false} color={new THREE.Color(1, 1, 1).multiplyScalar(1.15 * dark)} />
          </mesh>
        </>
      )}
      {/* findings: small orange diamonds popping over the roof, linked to the building */}
      {FINDINGS.map((f, i) => {
        const s = springAt(t, EV.findings + i * EV.findStep, 11, 200);
        if (s <= 0.001) return null;
        const judged = t > EV.review + i * EV.reviewStep;
        const drop = judged && !FINDING_OK[i] ? EASE(clamp01((t - EV.review - i * EV.reviewStep - 0.1) / 0.5)) : 0;
        const k = 0.17 * s * (1 - drop * 0.6);
        const pos: V3 = [f[0], f[1] + 0.06 * Math.sin(t * 2.4 + i) - drop * 0.4, f[2]];
        return (
          <React.Fragment key={i}>
            <mesh position={pos} rotation={[0, t * 1.5 + i, 0]} scale={[k, k * 1.4, k]} material={find}><octahedronGeometry args={[1, 0]} /></mesh>
            {drop < 0.5 && <Seg a={[f[0] * 0.55, BIZ_H, f[2] * 0.55]} b={pos} w={0.025} mat={link} />}
          </React.Fragment>
        );
      })}
      {lensIn > 0 && (
        <group position={L.p} rotation={[-0.35, Math.PI / 4, 0, "YXZ"]}>
          <mesh material={lens}><torusGeometry args={[0.36, 0.035, 6, 32]} /></mesh>
        </group>
      )}
      <GroundRing c={[0, 0.02, 0]} r={2.3} w={0.04} p={EASE(clamp01((t - EV.scan) / 0.8))} mat={link} />
      <pointLight position={[1.0, 1.4, 2.4]} color={C.orangeSoft} intensity={3 * r * dark} distance={7} decay={1.5} />
    </group>
  );
};
