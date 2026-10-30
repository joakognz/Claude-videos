import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, rand } from "../theme";
import { useGlowMat } from "./prims";
import { radialTex } from "./textures";

const HEX = Array.from({ length: 6 }, (_, k) => (k / 6) * Math.PI * 2 + Math.PI / 6);
const Y = new THREE.Vector3(0, 1, 0);

/** Claudius, the shopkeeper: a low-poly lantern of translucent orange light with a bright core and a cream apron. */
export const Lantern: React.FC<{ t: number; scale?: number; glow?: number; opacity?: number; apron?: boolean; seed?: number }> = ({
  t, scale = 1, glow = 1, opacity = 1, apron = true, seed = 0,
}) => {
  const shell = useMemo(() => new THREE.MeshStandardMaterial({
    color: C.orange, emissive: C.orange, roughness: 0.4, flatShading: true, transparent: true, depthWrite: false, side: THREE.DoubleSide,
  }), []);
  const solid = useMemo(() => new THREE.MeshStandardMaterial({ color: C.orange, emissive: C.orange, roughness: 0.5, flatShading: true, transparent: true }), []);
  const bars = useGlowMat(C.orangeSoft, 1.6);
  const core = useGlowMat(C.orangeSoft, 3.2);
  const halo = useMemo(() => new THREE.MeshBasicMaterial({
    color: C.orange, map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);
  const cream = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.cream, emissiveIntensity: 0.12, roughness: 0.8, side: THREE.DoubleSide, transparent: true }), []);
  const flick = 1 + 0.06 * Math.sin(t * 7.3 + seed) + 0.04 * Math.sin(t * 13.1 + seed * 2);
  shell.opacity = 0.42 * opacity;
  shell.emissiveIntensity = 0.9 * glow * flick;
  solid.opacity = 0.95 * opacity;
  solid.emissiveIntensity = 0.7 * glow;
  bars.opacity = opacity * Math.min(1, glow);
  core.opacity = opacity;
  core.color.set(C.orangeSoft).multiplyScalar(3.2 * glow * flick);
  halo.opacity = 0.55 * opacity * glow;
  cream.opacity = opacity;
  const R = 0.2;
  return (
    <group scale={scale}>
      <mesh material={solid} position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.17, 0.21, 0.07, 6]} />
      </mesh>
      <mesh material={shell} position={[0, 0.32, 0]}>
        <cylinderGeometry args={[R, R, 0.5, 6, 1, true]} />
      </mesh>
      {HEX.map((a, k) => (
        <mesh key={k} material={bars} position={[Math.cos(a) * R, 0.32, Math.sin(a) * R]}>
          <boxGeometry args={[0.022, 0.5, 0.022]} />
        </mesh>
      ))}
      <mesh material={core} position={[0, 0.33, 0]}>
        <icosahedronGeometry args={[0.085, 0]} />
      </mesh>
      <mesh material={halo} position={[0, 0.33, 0]} rotation={[-0.62, Math.PI / 4, 0, "YXZ"]}>
        <planeGeometry args={[1.5, 1.5]} />
      </mesh>
      <mesh material={solid} position={[0, 0.67, 0]}>
        <coneGeometry args={[0.27, 0.2, 6]} />
      </mesh>
      <mesh material={bars} position={[0, 0.8, 0]}>
        <icosahedronGeometry args={[0.04, 0]} />
      </mesh>
      <mesh material={bars} position={[0, 0.87, 0]} rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[0.065, 0.014, 5, 12]} />
      </mesh>
      {apron && (
        // apron on the side facing the customers (+x +z), with its neck strap
        <group rotation={[0, Math.PI / 4, 0]}>
          <mesh material={cream} position={[0, 0.2, R * 0.9 + 0.012]}>
            <planeGeometry args={[0.24, 0.22]} />
          </mesh>
          <mesh material={cream} position={[0, 0.13, R * 0.9 + 0.016]}>
            <boxGeometry args={[0.1, 0.006, 0.004]} />
          </mesh>
          <mesh material={cream} position={[-0.075, 0.38, R * 0.9 + 0.012]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[0.018, 0.17, 0.004]} />
          </mesh>
          <mesh material={cream} position={[0.075, 0.38, R * 0.9 + 0.012]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[0.018, 0.17, 0.004]} />
          </mesh>
        </group>
      )}
      <pointLight position={[0, 0.4, 0]} color={C.orange} intensity={2.6 * glow * opacity} distance={4.5} decay={1.6} />
    </group>
  );
};

/** Arm of light from `a` reaching towards `b` (p: 0 → 1), ending in a small glowing hand with a pen. */
export const LightArm: React.FC<{ a: V3; b: V3; p: number; t: number; opacity?: number }> = ({ a, b, p, t, opacity = 1 }) => {
  const mat = useGlowMat(C.orangeSoft, 1.8);
  const hand = useGlowMat(C.orange, 2.6);
  if (p <= 0.01) return null;
  mat.opacity = 0.85 * opacity;
  hand.opacity = opacity;
  // gentle curve: the arm bows up a little
  const pts: V3[] = [];
  const n = 10;
  for (let k = 0; k <= n; k++) {
    const u = (k / n) * p;
    pts.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + Math.sin(Math.PI * u) * 0.25 + 0.015 * Math.sin(t * 9 + k), a[2] + (b[2] - a[2]) * u]);
  }
  const end = pts[pts.length - 1];
  return (
    <>
      {pts.slice(1).map((q, k) => {
        const s = pts[k];
        const va = new THREE.Vector3(...s);
        const vb = new THREE.Vector3(...q);
        const dir = vb.clone().sub(va);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(Y, dir.normalize());
        const w = 0.065 - 0.02 * (k / n);
        return (
          <mesh key={k} position={va.add(vb).multiplyScalar(0.5)} quaternion={quat} scale={[w, len + 0.01, w]} material={mat}>
            <cylinderGeometry args={[0.5, 0.5, 1, 5]} />
          </mesh>
        );
      })}
      <mesh position={end} material={hand}>
        <icosahedronGeometry args={[0.065, 0]} />
      </mesh>
      <mesh position={[end[0] + 0.05, end[1] - 0.06, end[2] + 0.02]} rotation={[0.3, 0, -0.6]} material={hand}>
        <cylinderGeometry args={[0.012, 0.004, 0.16, 4]} />
      </mesh>
    </>
  );
};

/** Deterministic jitter (for the glitch tremble). */
export const jitter = (t: number, seed: number, amp: number): V3 => {
  const k = Math.floor(t * 24);
  return [(rand(k * 3 + seed) - 0.5) * amp, (rand(k * 5 + seed + 1) - 0.5) * amp * 0.5, (rand(k * 7 + seed + 2) - 0.5) * amp];
};
