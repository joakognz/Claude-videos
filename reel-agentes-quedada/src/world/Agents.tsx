import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EV, act, beat, clamp01, lerp } from "../theme";
import { ORB_SIZE, TENT, humanAt, orbAt, orbGlow, orbScale } from "./layout";
import { Seg, useGlowMat } from "./prims";
import { radialTex } from "./textures";

/** One agent: a faceless low-poly orb of translucent orange light, a hot core and a halo. */
const Orb: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const shell = useMemo(() => new THREE.MeshStandardMaterial({
    color: C.orange, emissive: C.orange, roughness: 0.35, flatShading: true, transparent: true, depthWrite: false,
  }), []);
  const core = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true }), []);
  const halo = useMemo(() => new THREE.SpriteMaterial({
    map: radialTex(), color: C.orange, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), []);
  const g = orbGlow(k, t);
  shell.emissiveIntensity = 0.25 + g * 1.1;
  shell.opacity = 0.5 + 0.35 * clamp01(g);
  core.color.set(C.orangeSoft).multiplyScalar(0.35 + g * 1.5);
  core.opacity = 0.9;
  halo.opacity = clamp01(0.15 + g * 0.55);
  const p = orbAt(k, t);
  const r = orbScale(k, t);
  const spin = t * (0.35 + 1.2 * act(t)) + k;
  return (
    <group position={p}>
      <mesh material={shell} scale={r} rotation={[0.4 + k, spin, 0.2]}>
        <icosahedronGeometry args={[1, 1]} />
      </mesh>
      <mesh material={core} scale={r * 0.45}>
        <icosahedronGeometry args={[1, 1]} />
      </mesh>
      <sprite material={halo} scale={[r * (3 + 1.4 * clamp01(g)), r * (3 + 1.4 * clamp01(g)), 1]} />
    </group>
  );
};

/** Threads of light from every orb to the offsite bubble, and around the ring, while they plan. */
const Threads: React.FC<{ t: number }> = ({ t }) => {
  const mat = useGlowMat(C.orange, 1.4);
  const ring = useGlowMat(C.orangeSoft, 1.2);
  const grow = clamp01((t - EV.drop) / 0.35);
  const fade = 1 - clamp01((t - EV.drain1 + 0.1) / 0.35);
  if (grow <= 0 || fade <= 0) return null;
  mat.opacity = (0.25 + 0.6 * beat(t)) * fade;
  ring.opacity = (0.2 + 0.5 * beat(t, 0.25)) * fade * clamp01((t - EV.msg0) / 0.5);
  const tent: V3 = [TENT[0], TENT[1] - 0.6, TENT[2]];
  return (
    <>
      {[0, 1, 2, 3, 4].map((k) => {
        const p = orbAt(k, t);
        const q = orbAt((k + 1) % 5, t);
        return (
          <React.Fragment key={k}>
            <Seg a={p} b={tent} w={0.03} p={grow} mat={mat} />
            {ring.opacity > 0.01 && <Seg a={p} b={q} w={0.025} mat={ring} />}
          </React.Fragment>
        );
      })}
    </>
  );
};

export const Orbs: React.FC<{ t: number }> = ({ t }) => (
  <>
    {ORB_SIZE.map((_, k) => <Orb key={k} k={k} t={t} />)}
    <Threads t={t} />
  </>
);

/** The only human: a faceless low-poly cream pictogram. Faces +x; `yaw` turns it. */
export const Human: React.FC<{ t: number }> = ({ t }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: C.cream, emissive: C.cream, emissiveIntensity: 0.22, roughness: 0.6, flatShading: true,
  }), []);
  const h = humanAt(t);
  const ph = t * 9;
  const sw = h.walk * 0.55 * Math.sin(ph);
  const breathe = 1 + 0.015 * Math.sin(t * 2.2);
  const armR = lerp(-sw * 0.8, 2.4, h.arm);
  return (
    <group position={h.p} rotation={[0, h.yaw, 0]} scale={1.3}>
      {/* legs */}
      <group position={[0, 0.44, 0.075]} rotation={[0, 0, sw]}>
        <mesh material={mat} position={[0, -0.21, 0]}>
          <boxGeometry args={[0.1, 0.42, 0.1]} />
        </mesh>
      </group>
      <group position={[0, 0.44, -0.075]} rotation={[0, 0, -sw]}>
        <mesh material={mat} position={[0, -0.21, 0]}>
          <boxGeometry args={[0.1, 0.42, 0.1]} />
        </mesh>
      </group>
      {/* torso */}
      <mesh material={mat} position={[0, 0.66 + h.walk * 0.02 * Math.abs(Math.sin(ph)), 0]} scale={[1, breathe, 1]}>
        <cylinderGeometry args={[0.15, 0.12, 0.46, 6]} />
      </mesh>
      {/* arms */}
      <group position={[0, 0.86, 0.2]} rotation={[0, 0, armR]}>
        <mesh material={mat} position={[0, -0.18, 0]}>
          <boxGeometry args={[0.08, 0.36, 0.08]} />
        </mesh>
      </group>
      <group position={[0, 0.86, -0.2]} rotation={[0, 0, sw * 0.8]}>
        <mesh material={mat} position={[0, -0.18, 0]}>
          <boxGeometry args={[0.08, 0.36, 0.08]} />
        </mesh>
      </group>
      {/* head: no face */}
      <mesh material={mat} position={[0, 1.05, 0]}>
        <icosahedronGeometry args={[0.14, 0]} />
      </mesh>
    </group>
  );
};
