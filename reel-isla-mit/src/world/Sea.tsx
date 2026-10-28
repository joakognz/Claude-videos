import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C, EASE, EV, clamp01, rand } from "../theme";
import { ISLAND_YAW } from "../camera";
import { ISLAND_RX, ISLAND_RZ } from "./layout";
import { radialTex } from "./textures";

const SEA_Y = -0.32;
const N_GLINTS = 900;

// star reflections on the water: spread from the shore out to the far sea (log-radial, so both the
// aerial opening and the working shot have them)
const GLINTS = Array.from({ length: N_GLINTS }, (_, i) => {
  const r = 7.5 * Math.exp(rand(i + 1) * Math.log(160 / 7.5));
  const a = rand(i + 2) * Math.PI * 2;
  return { r, a, px: 2 + rand(i + 3) * 4.5, ph: rand(i + 4) * 20, sp: 0.6 + rand(i + 5) * 2.2, bright: rand(i + 6) };
});

const tmp = new THREE.Object3D();

const Glints: React.FC<{ t: number; zoom: number }> = ({ t, zoom }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(C.cream).multiplyScalar(1.6), map: radialTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);
  // "the sky turns": the reflections wheel round during the 30 hours
  const spin = 0.9 * EASE(clamp01((t - EV.counter0) / (EV.counter1 - EV.counter0))) + t * 0.004;
  useLayoutEffect(() => {
    const m = ref.current!;
    GLINTS.forEach((g, i) => {
      const a = g.a + spin;
      tmp.position.set(Math.cos(a) * g.r, SEA_Y + 0.01, Math.sin(a) * g.r);
      const tw = 0.35 + 0.65 * Math.max(0, Math.sin(t * g.sp + g.ph)) ** 2;
      const s = (g.px * (0.5 + 0.8 * g.bright) * tw) / zoom;
      tmp.rotation.set(-Math.PI / 2, 0, 0);
      tmp.scale.set(s * 2.2, s, 1);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N_GLINTS]} material={mat} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
};

/** Swell lines rolling out from the shore. */
const Ripples: React.FC<{ t: number }> = ({ t }) => {
  const mats = useMemo(() => [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ color: C.cream, transparent: true, depthWrite: false })), []);
  const fade = 1 - clamp01((t - EV.morph) / 0.6);
  return (
    <group rotation={[0, ISLAND_YAW, 0]}>
      {mats.map((m, k) => {
        const p = ((t + k * 1.4) / 4.2) % 1;
        m.opacity = 0.07 * Math.sin(Math.PI * p) * fade;
        const s = 1.12 + p * 0.5;
        return (
          <mesh key={k} position={[0, SEA_Y + 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[ISLAND_RX * s, ISLAND_RZ * s, 1]} material={m}>
            <ringGeometry args={[0.985, 1, 96]} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Sea: React.FC<{ t: number; zoom: number }> = ({ t, zoom }) => {
  const glow = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#3a2618", map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), []);
  return (
    <>
      <mesh position={[0, SEA_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial color={C.sea} roughness={0.5} metalness={0.15} />
      </mesh>
      {/* warm haze on the water around the island */}
      <mesh position={[0, SEA_Y + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} material={glow}>
        <planeGeometry args={[34, 34]} />
      </mesh>
      <Glints t={t} zoom={zoom} />
      <Ripples t={t} />
    </>
  );
};
