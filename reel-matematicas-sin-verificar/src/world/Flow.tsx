import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C, EASE, EV, clamp01, rand } from "../theme";
import { radialTex } from "./textures";

// E1–E3: the big glass cube with a fine orange vortex inside and cream flow lines through it.
export const CUBE = 2.4;
const H = CUBE / 2;

const tmp = new THREE.Object3D();

/** How much the flow has "tightened" (E2): 0 calm → 1 bent lines and a fast, narrow vortex. */
const flowAt = (t: number) => EASE(clamp01((t - EV.flow) / 1.6));

const N_ARMS = 8;
const PER_ARM = 90;

/** Orange vortex: particles running up helical arms that narrow towards the top. */
const Vortex: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(C.orangeSoft).multiplyScalar(1.5), map: radialTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);
  mat.opacity = o;
  const f = flowAt(t);
  // phase integrates the speed so the spin never jumps
  const spin = t * 1.2 + Math.max(0, t - EV.flow) * 2.4 * f;
  useLayoutEffect(() => {
    const m = ref.current!;
    for (let a = 0; a < N_ARMS; a++) {
      for (let k = 0; k < PER_ARM; k++) {
        const u = ((k / PER_ARM + t * 0.12 * (1 + f)) % 1);
        const y = -H * 0.85 + u * CUBE * 0.85;
        // funnel: narrow at the bottom, open at the top
        const r = (0.12 + 0.78 * u * u) * (1 - 0.3 * f) + 0.04;
        const ang = (a / N_ARMS) * Math.PI * 2 + u * (11 + 6 * f) + spin;
        tmp.position.set(Math.cos(ang) * r, y + H, Math.sin(ang) * r);
        tmp.rotation.set(-0.616, Math.PI / 4, 0, "YXZ");
        const s = 0.028 + 0.022 * Math.sin(Math.PI * u);
        tmp.scale.set(s * 2, s * 2, 1);
        tmp.updateMatrix();
        m.setMatrixAt(a * PER_ARM + k, tmp.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N_ARMS * PER_ARM]} material={mat} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
};

const N_LINES = 9;
const PER_LINE = 46;
const LINES = Array.from({ length: N_LINES }, (_, i) => ({ y: 0.25 + (i % 3) * 0.85 + rand(i + 3) * 0.2, z: -0.8 + Math.floor(i / 3) * 0.8, ph: rand(i + 9) }));

/** Cream flow lines crossing the cube (front-local x), bending round the vortex once the flow tightens. */
const FlowLines: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(C.cream).multiplyScalar(1.1), map: radialTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);
  mat.opacity = 0.75 * o;
  const f = flowAt(t);
  useLayoutEffect(() => {
    const m = ref.current!;
    LINES.forEach((L, i) => {
      for (let k = 0; k < PER_LINE; k++) {
        const u = (k / PER_LINE + t * 0.18 * (1 + 1.5 * f) + L.ph) % 1;
        const x = -H + u * CUBE;
        // bend: lines are pulled round the axis in proportion to how close they pass
        const d = Math.hypot(x, L.z);
        const pull = f * Math.exp(-d * d * 1.2);
        const ang = pull * 1.6;
        const px = x * Math.cos(ang) - L.z * Math.sin(ang);
        const pz = x * Math.sin(ang) + L.z * Math.cos(ang);
        const py = L.y + f * 0.25 * Math.sin(u * Math.PI * 2 + t * 2 + i);
        tmp.position.set(px * 0.98, py, pz * 0.98);
        tmp.rotation.set(-0.616, 0, 0); // facing the camera in the stage's front frame
        const s = 0.035 * Math.sin(Math.PI * u) + 0.01;
        tmp.scale.set(s * 2, s * 2, 1);
        tmp.updateMatrix();
        m.setMatrixAt(i * PER_LINE + k, tmp.matrix);
      }
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N_LINES * PER_LINE]} material={mat} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
};

/** The glass cube (front-local frame). `rise` 0 → 1 lifts it out of the floor. */
export const Cube: React.FC<{ t: number; rise: number }> = ({ t, rise }) => {
  const glass = useMemo(() => new THREE.MeshStandardMaterial({
    color: C.cream, transparent: true, opacity: 0.06, roughness: 0.1, depthWrite: false, side: THREE.DoubleSide,
  }), []);
  const edge = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.cream, emissiveIntensity: 0.45, roughness: 0.5 }), []);
  if (rise <= 0.001) return null;
  const E: [[number, number, number], [number, number, number]][] = [];
  for (const x of [-H, H]) for (const z of [-H, H]) E.push([[x, H, z], [0.05, CUBE, 0.05]]);
  for (const y of [0, CUBE]) {
    for (const z of [-H, H]) E.push([[0, y, z], [CUBE + 0.05, 0.05, 0.05]]);
    for (const x of [-H, H]) E.push([[x, y, 0], [0.05, 0.05, CUBE + 0.05]]);
  }
  return (
    <group position={[0, -(1 - rise) * (CUBE + 0.3), 0]} rotation={[0, -Math.PI / 4, 0]}>
      <mesh material={glass} position={[0, H, 0]}>
        <boxGeometry args={[CUBE, CUBE, CUBE]} />
      </mesh>
      {E.map(([p, s], i) => (
        <mesh key={i} material={edge} position={p} scale={s}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}
      {/* the cube is world-aligned (isometric); the vortex billboards in world axes, the flow lines in the stage's front frame */}
      <Vortex t={t} o={rise} />
      <group rotation={[0, Math.PI / 4, 0]}>
        <FlowLines t={t} o={rise} />
      </group>
      <pointLight position={[0, H, 0]} color={C.orange} intensity={3 * rise} distance={6} decay={1.5} />
    </group>
  );
};
