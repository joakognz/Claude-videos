import React, { useMemo } from "react";
import * as THREE from "three";
import { C } from "../theme";

export type LobsterLook = "eko" | "played" | "dim";

const LOOKS: Record<LobsterLook, { color: string; emissive: string; ei: number; opacity: number; rim: number }> = {
  eko: { color: C.orange, emissive: C.orange, ei: 1.5, opacity: 0.9, rim: 0.32 },
  played: { color: C.orange, emissive: C.orange, ei: 0.95, opacity: 0.85, rim: 0.14 },
  dim: { color: "#9a8574", emissive: "#4d382a", ei: 0.55, opacity: 0.92, rim: 0 },
};

const Y = new THREE.Vector3(0, 1, 0);

/** Thin cylinder between two points (legs, antennae, arms). */
const Stick: React.FC<{ a: [number, number, number]; b: [number, number, number]; r: number; mat: THREE.Material }> = ({ a, b, r, mat }) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const dir = vb.clone().sub(va);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(Y, dir.normalize());
  return (
    <mesh position={mid} quaternion={q} material={mat}>
      <cylinderGeometry args={[r * 0.7, r, len, 5]} />
    </mesh>
  );
};

/** One claw: arm from the shoulder, then a two-fingered pincer. `raise` lifts it (throws), `open` parts the fingers. */
const Claw: React.FC<{ side: 1 | -1; raise: number; open: number; mat: THREE.Material }> = ({ side, raise, open, mat }) => (
  <group position={[0.36, 0.28, 0.12 * side]} rotation={[0, -0.35 * side, 0.15 + raise * 0.9]}>
    <Stick a={[0, 0, 0]} b={[0.24, 0.02, 0.16 * side]} r={0.035} mat={mat} />
    <group position={[0.36, 0.03, 0.2 * side]} rotation={[0, -0.25 * side, 0]}>
      <mesh material={mat} scale={[0.16, 0.075, 0.095]}>
        <sphereGeometry args={[1, 7, 5]} />
      </mesh>
      <group position={[0.12, 0, 0]} rotation={[0, -open * 0.35 * side, 0]}>
        <mesh material={mat} position={[0.1, 0, -0.025 * side]} rotation={[0, 0, -Math.PI / 2]} scale={[0.5, 1, 0.45]}>
          <coneGeometry args={[0.07, 0.24, 5]} />
        </mesh>
      </group>
      <group position={[0.12, 0, 0]} rotation={[0, open * 0.35 * side, 0]}>
        <mesh material={mat} position={[0.08, 0, 0.035 * side]} rotation={[0, 0, -Math.PI / 2]} scale={[0.4, 1, 0.4]}>
          <coneGeometry args={[0.06, 0.18, 5]} />
        </mesh>
      </group>
    </group>
  </group>
);

/**
 * Stylised low-poly lobster of translucent emissive light, facing +x, about 1 unit long.
 * `walk` drives the legs and tail, `claw` raises both claws, `t` keeps it alive (antennae, breathing).
 */
export const Lobster: React.FC<{
  t: number; look: LobsterLook; walk?: number; claw?: number; open?: number; opacity?: number; glow?: number; seed?: number;
}> = ({ t, look, walk = 0, claw = 0, open = 0, opacity = 1, glow = 1, seed = 0 }) => {
  const L = LOOKS[look];
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: L.color, emissive: L.emissive, roughness: 0.45, metalness: 0, flatShading: true, transparent: true,
  }), [L.color, L.emissive]);
  const rim = useMemo(() => new THREE.MeshBasicMaterial({
    color: C.orangeSoft, transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
  }), []);
  mat.opacity = L.opacity * opacity;
  mat.emissiveIntensity = L.ei * glow * (1 + 0.08 * Math.sin(t * 3.1 + seed));
  rim.opacity = L.rim * opacity * glow;
  const ph = t * 16 + seed;
  const breathe = 1 + 0.025 * Math.sin(t * 2.4 + seed);
  const tailSwing = 0.08 * Math.sin(t * 2 + seed) + walk * 0.12 * Math.sin(ph * 0.5);
  const legs: React.ReactNode[] = [];
  for (const side of [1, -1] as const) {
    for (let i = 0; i < 3; i++) {
      const x = 0.24 - i * 0.13;
      const sw = walk * 0.07 * Math.sin(ph + i * 2.1 + (side > 0 ? 0 : Math.PI));
      const lift = walk * 0.04 * Math.max(0, Math.cos(ph + i * 2.1 + (side > 0 ? 0 : Math.PI)));
      legs.push(
        <group key={`${side}${i}`}>
          <Stick a={[x, 0.22, 0.1 * side]} b={[x + sw, 0.2 + lift, 0.25 * side]} r={0.018} mat={mat} />
          <Stick a={[x + sw, 0.2 + lift, 0.25 * side]} b={[x + sw * 1.4, 0.0 + lift, 0.32 * side]} r={0.014} mat={mat} />
        </group>,
      );
    }
  }
  const antSway = (k: number) => 0.06 * Math.sin(t * 2.7 + k + seed) + walk * 0.05 * Math.sin(ph * 0.5 + k);
  const shell = (
    <>
      {/* carapace + head */}
      <mesh material={mat} position={[0.14, 0.28, 0]} scale={[0.34 * breathe, 0.17, 0.2]}>
        <sphereGeometry args={[1, 8, 5]} />
      </mesh>
      <mesh material={mat} position={[0.5, 0.3, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.8]}>
        <coneGeometry args={[0.1, 0.26, 5]} />
      </mesh>
      {/* tail: four segments and the fan */}
      <group position={[-0.16, 0.27, 0]} rotation={[0, tailSwing, -0.12]}>
        {[0, 1, 2, 3].map((k) => (
          <mesh key={k} material={mat} position={[-0.12 - k * 0.13, -k * 0.022, 0]} scale={[0.09, 0.09 - k * 0.01, 0.15 - k * 0.018]}>
            <sphereGeometry args={[1, 6, 4]} />
          </mesh>
        ))}
        {[-0.55, 0, 0.55].map((a, k) => (
          <mesh key={`f${k}`} material={mat} position={[-0.66, -0.07, 0]} rotation={[0, a, Math.PI / 2]} scale={[0.75, 1, 0.22]}>
            <coneGeometry args={[0.08, 0.2, 4]} />
          </mesh>
        ))}
      </group>
    </>
  );
  return (
    <group>
      {shell}
      {/* soft rim of light: the shell drawn again, slightly larger, back faces, additive */}
      {L.rim > 0 && (
        <group scale={1.13} position={[0.03, -0.03, 0]}>
          <mesh material={rim} position={[0.14, 0.28, 0]} scale={[0.34 * breathe, 0.17, 0.2]}>
            <sphereGeometry args={[1, 8, 5]} />
          </mesh>
          <mesh material={rim} position={[-0.42, 0.24, 0]} scale={[0.32, 0.08, 0.13]}>
            <sphereGeometry args={[1, 6, 4]} />
          </mesh>
        </group>
      )}
      {legs}
      <Claw side={1} raise={claw} open={open} mat={mat} />
      <Claw side={-1} raise={claw * 0.85} open={open} mat={mat} />
      {/* antennae */}
      <Stick a={[0.56, 0.33, 0.04]} b={[1.05, 0.62 + antSway(0), 0.3]} r={0.012} mat={mat} />
      <Stick a={[0.56, 0.33, -0.04]} b={[1.05, 0.62 + antSway(1.3), -0.3]} r={0.012} mat={mat} />
      <Stick a={[0.56, 0.31, 0.03]} b={[0.86, 0.38, 0.16]} r={0.01} mat={mat} />
      <Stick a={[0.56, 0.31, -0.03]} b={[0.86, 0.38, -0.16]} r={0.01} mat={mat} />
    </group>
  );
};
