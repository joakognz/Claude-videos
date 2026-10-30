import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EASE, EV, S, clamp01 } from "../theme";
import { NOTE, studentAt, studentGlow } from "./layout";
import { Seg, useGlowMat } from "./prims";
import { radialTex } from "./textures";

/** One crystal: elongated low-poly octahedron of translucent orange light, a hot core and a halo. */
const Crystal: React.FC<{ p: V3; glow: number; opacity: number; spin: number; tilt: number }> = ({ p, glow, opacity, spin, tilt }) => {
  const shell = useMemo(() => new THREE.MeshStandardMaterial({
    color: C.orange, emissive: C.orange, roughness: 0.3, flatShading: true, transparent: true, depthWrite: false,
  }), []);
  const core = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true }), []);
  const halo = useMemo(() => new THREE.SpriteMaterial({
    map: radialTex(), color: C.orange, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), []);
  shell.emissiveIntensity = 0.3 + glow * 0.9;
  shell.opacity = (0.55 + 0.25 * clamp01(glow)) * opacity;
  core.color.set(C.orangeSoft).multiplyScalar(0.5 + glow * 1.4);
  core.opacity = opacity;
  halo.opacity = clamp01(0.2 + glow * 0.45) * opacity * (0.85 + 0.15 * Math.sin(spin * 3));
  return (
    <group position={p} rotation={[0, 0, tilt]}>
      <mesh material={shell} scale={[0.58, 1.05, 0.58]} rotation={[0, spin, 0]}>
        <octahedronGeometry args={[1, 0]} />
      </mesh>
      <mesh material={core} scale={[0.2, 0.38, 0.2]} rotation={[0, -spin * 1.5, 0]}>
        <octahedronGeometry args={[1, 0]} />
      </mesh>
      <sprite material={halo} scale={[3.4, 4.0, 1]} />
    </group>
  );
};

/** The Student, its gaze to the note while it reasons, and its reflection when it notices it is watched. */
export const Student: React.FC<{ t: number }> = ({ t }) => {
  const gaze = useGlowMat(C.orange, 1.3);
  const st = studentAt(t);
  const g = studentGlow(t);
  const look = clamp01((t - EV.turn - 0.2) / 0.4) * (1 - clamp01((t - S.E7 - 0.2) / 0.4));
  gaze.opacity = 0.55 * look;
  // the reflection: a ghost copy slides out to its right on screen and holds, translucent
  const gq = EASE(clamp01((t - EV.ghost) / 0.7)) * (1 - clamp01((t - S.E10 - 0.2) / 0.5));
  const ghost: V3 = [st.p[0] + 0.85 * gq, st.p[1], st.p[2] - 0.85 * gq];
  return (
    <>
      <Crystal p={st.p} glow={g} opacity={1} spin={st.spin} tilt={-0.18 * st.lean} />
      {gq > 0.01 && <Crystal p={ghost} glow={g * 0.7} opacity={0.35 * gq} spin={-st.spin} tilt={0.12} />}
      {look > 0.01 && <Seg a={[st.p[0], st.p[1] + 0.1, st.p[2]]} b={[NOTE[0], NOTE[1], NOTE[2] + 0.02]} w={0.022} p={look} mat={gaze} />}
    </>
  );
};
