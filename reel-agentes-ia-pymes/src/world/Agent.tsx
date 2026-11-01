import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EV, S, clamp01, springAt } from "../theme";
import { agentAt, agentSpeed, beamTarget } from "./layout";
import { radialTex } from "./textures";

const Y = new THREE.Vector3(0, 1, 0);

/**
 * The agent: an original low-poly lantern of orange light with no face. A faceted translucent core,
 * a bright heart and two thin orbit rings that spin faster when it works. It casts a pool of light
 * on the plate and, when it reads something, a soft beam.
 */
export const Agent: React.FC<{ t: number }> = ({ t }) => {
  const shell = useMemo(() => new THREE.MeshStandardMaterial({
    color: C.orange, emissive: C.orange, emissiveIntensity: 1.2, roughness: 0.35, flatShading: true, transparent: true, opacity: 0.82,
  }), []);
  const heart = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.orangeSoft).multiplyScalar(2.4), toneMapped: false, transparent: true }), []);
  const ring = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.orange).multiplyScalar(1.8), toneMapped: false, transparent: true }), []);
  const ghost = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.orange).multiplyScalar(1.3), transparent: true, depthWrite: false, toneMapped: false }), []);
  const halo = useMemo(() => new THREE.SpriteMaterial({ map: radialTex(), color: C.orange, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  const pool = useMemo(() => new THREE.MeshBasicMaterial({ map: radialTex(), color: C.orange, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  const beam = useMemo(() => new THREE.MeshBasicMaterial({ color: C.orangeSoft, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), []);

  const s = Math.max(0, springAt(t, EV.agent, 11, 150));
  if (s <= 0.001) return null;
  const p = agentAt(t);
  const speed = agentSpeed(t);
  // it "works harder" in the lesson and the CTA: brighter heart, faster rings
  const busy = clamp01((t - S.E9B) / 0.5);
  const pulse = 1 + 0.12 * Math.sin(t * 5.2);
  shell.emissiveIntensity = (1.1 + 0.3 * busy) * pulse;
  heart.opacity = 0.9;
  ring.opacity = 0.85;
  halo.opacity = 0.5 + 0.25 * Math.sin(t * 3.1) + 0.2 * busy;
  pool.opacity = 0.35 * clamp01(1.6 / Math.max(0.6, p[1]));
  const spin = t * (1.4 + 1.6 * busy) + speed * 0.05;

  const body = (q: V3, o: number, key: string) => (
    <group key={key} position={q} scale={s}>
      <mesh material={o < 1 ? ghost : shell} rotation={[0.4, t * 0.6, 0.2]}>
        <icosahedronGeometry args={[0.3, 0]} />
      </mesh>
      {o >= 1 && (
        <>
          <mesh material={heart}>
            <octahedronGeometry args={[0.12, 0]} />
          </mesh>
          <mesh material={ring} rotation={[Math.PI / 2 + 0.5, spin, 0]}>
            <torusGeometry args={[0.5, 0.016, 6, 48]} />
          </mesh>
          <mesh material={ring} rotation={[0.3, -spin * 0.8, Math.PI / 2 - 0.4]}>
            <torusGeometry args={[0.42, 0.012, 6, 48]} />
          </mesh>
          <sprite material={halo} scale={[2.2, 2.2, 1]} />
        </>
      )}
    </group>
  );

  // motion blur: ghost copies along the recent path when it moves fast
  const ghosts: React.ReactNode[] = [];
  if (speed > 2.2) {
    for (let k = 1; k <= 5; k++) {
      ghost.opacity = 0.35;
      const g = agentAt(t - k * 0.025);
      ghosts.push(
        <mesh key={`g${k}`} material={ghost} position={g} scale={s * (1 - k * 0.12)}>
          <icosahedronGeometry args={[0.24, 0]} />
        </mesh>,
      );
    }
  }

  const bt = beamTarget(t);
  let beamMesh: React.ReactNode = null;
  if (bt) {
    const a = new THREE.Vector3(...p);
    const b = new THREE.Vector3(...bt);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const mid = a.clone().add(dir.clone().multiplyScalar(0.5));
    const q = new THREE.Quaternion().setFromUnitVectors(Y, dir.normalize().negate());
    beam.opacity = 0.16 + 0.06 * Math.sin(t * 20);
    beamMesh = (
      <mesh position={mid} quaternion={q} material={beam}>
        <coneGeometry args={[0.34, len, 16, 1, true]} />
      </mesh>
    );
  }

  return (
    <>
      {ghosts}
      {body(p, 1, "a")}
      {beamMesh}
      <mesh material={pool} position={[p[0], 0.02, p[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={s}>
        <planeGeometry args={[1.8, 1.8]} />
      </mesh>
    </>
  );
};
