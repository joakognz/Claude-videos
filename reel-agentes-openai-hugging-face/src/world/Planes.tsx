import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EV, S, clamp01 } from "../theme";
import { N_PLANES, carrying, planeAlpha, planeAt } from "./layout";
import { radialTex } from "./textures";

/**
 * The agents: original paper planes folded out of orange light. Low-poly, translucent, no face.
 * A plane is a thing that follows its course wherever it can fly — the metaphor of the reel.
 */
const planeGeometry = () => {
  const v = [
    0.32, 0.0, 0.0, // 0 nose
    -0.22, 0.02, 0.2, // 1 left wing tip
    -0.16, 0.0, 0.0, // 2 tail centre (top)
    -0.22, 0.02, -0.2, // 3 right wing tip
    -0.2, -0.09, 0.0, // 4 keel
  ];
  const idx = [0, 1, 2, 0, 2, 3, 0, 4, 2, 0, 2, 4];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

const X = new THREE.Vector3(1, 0, 0);

const orient = (a: V3, b: V3, bank: number) => {
  const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  if (dir.lengthSq() < 1e-8) dir.set(1, 0, 0);
  dir.normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(X, dir);
  const roll = new THREE.Quaternion().setFromAxisAngle(X, bank);
  return q.multiply(roll);
};

export const Planes: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(planeGeometry, []);
  const mats = useMemo(() => Array.from({ length: N_PLANES }, () => new THREE.MeshStandardMaterial({
    color: C.orange, emissive: C.orange, emissiveIntensity: 1.3, roughness: 0.4, flatShading: true, transparent: true, side: THREE.DoubleSide,
  })), []);
  const ghost = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.orange).multiplyScalar(1.3), transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }), []);
  const glow = useMemo(() => new THREE.SpriteMaterial({ map: radialTex(), color: C.orange, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  const chip = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.cream, emissiveIntensity: 0.4, flatShading: true }), []);
  const key = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.orangeSoft, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.3, flatShading: true }), []);
  ghost.opacity = 0.28;
  // the swarm is brighter while it is out; calmer when back in the box for the lesson
  const out = clamp01((t - EV.esc) / 0.5) * (1 - 0.4 * clamp01((t - S.E9) / 0.6));
  glow.opacity = 0.35 + 0.15 * out;

  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < N_PLANES; i++) {
    const a = planeAlpha(i, t);
    if (a <= 0.01) continue;
    const p = planeAt(i, t);
    const prev = planeAt(i, t - 0.03);
    const next = planeAt(i, t + 0.03);
    const speed = Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]) / 0.03;
    // bank into turns
    const turn = (next[0] - p[0]) * (p[2] - prev[2]) - (next[2] - p[2]) * (p[0] - prev[0]);
    const q = orient(prev, next, Math.max(-0.7, Math.min(0.7, turn * 40)));
    const m = mats[i];
    m.opacity = 0.88 * a;
    m.emissiveIntensity = 1.2 + 0.25 * Math.sin(t * 4 + i);
    const s = i === 0 ? 1.25 : 1;
    nodes.push(
      <group key={i} position={p} quaternion={q} scale={[s, s, s]}>
        <mesh geometry={geo} material={m} />
        {carrying(i, t) && (
          <mesh material={chip} position={[-0.02, -0.14, 0]}>
            <boxGeometry args={[0.12, 0.03, 0.09]} />
          </mesh>
        )}
      </group>,
      <sprite key={`h${i}`} material={glow} position={p} scale={[0.9 * s, 0.9 * s, 1]} />,
    );
    // motion blur: ghost copies when fast
    if (speed > 2.5) {
      for (let k = 1; k <= 4; k++) {
        const g = planeAt(i, t - k * 0.03);
        const gn = planeAt(i, t - k * 0.03 + 0.03);
        nodes.push(<mesh key={`g${i}${k}`} geometry={geo} material={ghost} position={g} quaternion={orient(g, gn, 0)} scale={[s * (1 - k * 0.12), s * (1 - k * 0.12), s * (1 - k * 0.12)]} />);
      }
    }
  }
  // the stolen key travels with plane 0
  if (t >= EV.grab && t < EV.keyIn + 0.1) {
    const p = planeAt(0, t);
    nodes.push(
      <group key="key" position={[p[0], p[1] - 0.2, p[2]]} rotation={[0, t * 2, 0.4]} scale={[0.8, 0.8, 0.8]}>
        <mesh material={key} position={[-0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.03, 5, 10]} />
        </mesh>
        <mesh material={key} position={[0.1, 0, 0]}>
          <boxGeometry args={[0.24, 0.04, 0.04]} />
        </mesh>
        <mesh material={key} position={[0.18, -0.04, 0]}>
          <boxGeometry args={[0.04, 0.07, 0.04]} />
        </mesh>
      </group>,
    );
  }
  return <>{nodes}</>;
};
