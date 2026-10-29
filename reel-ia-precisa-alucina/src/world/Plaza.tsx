import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C, rand } from "../theme";
import { PLAZA, darkAt } from "./layout";
import { pavingTex, radialTex } from "./textures";

const tmp = new THREE.Object3D();

// Night city around the plaza: blocks of dark buildings on a street grid, with street lights.
const BLOCK = 4.2;
const STREET = 1.6;
const BUILDINGS = (() => {
  const out: { x: number; z: number; w: number; d: number; h: number }[] = [];
  const n = 26;
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const cx = i * (BLOCK + STREET);
      const cz = j * (BLOCK + STREET);
      const r = Math.hypot(cx, cz);
      if (Math.max(Math.abs(cx), Math.abs(cz)) < PLAZA + 3 || r > 130) continue;
      // two or three buildings per block
      const k = 2 + Math.floor(rand(i * 91 + j * 17) * 2);
      for (let b = 0; b < k; b++) {
        const s = rand(i * 13 + j * 29 + b * 7);
        const w = BLOCK / k - 0.25;
        const near = Math.max(0, 1 - r / 30);
        out.push({
          x: cx - BLOCK / 2 + (b + 0.5) * (BLOCK / k), z: cz + (s - 0.5) * 0.6, w, d: BLOCK - 0.4 - s * 1.2,
          h: 0.8 + rand(i * 7 + j * 3 + b) ** 2 * 5.5 * (1 - 0.5 * near),
        });
      }
    }
  }
  return out;
})();

const LIGHTS = (() => {
  const out: { x: number; z: number; ph: number }[] = [];
  const n = 26;
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const x = i * (BLOCK + STREET) + (BLOCK + STREET) / 2;
      const z = j * (BLOCK + STREET);
      if (Math.hypot(x, z) > 130 || Math.max(Math.abs(x), Math.abs(z)) < PLAZA + 1) continue;
      if (rand(i * 5 + j * 11) < 0.45) out.push({ x, z: z + (rand(i + j * 3) - 0.5) * 3, ph: rand(i * 3 + j) * 10 });
      if (rand(i * 7 + j * 5) < 0.45) out.push({ x: z, z: x, ph: rand(i + j * 9) * 10 });
    }
  }
  return out;
})();

const City: React.FC<{ t: number; zoom: number }> = ({ t, zoom }) => {
  const bRef = useRef<THREE.InstancedMesh>(null);
  const lRef = useRef<THREE.InstancedMesh>(null);
  const bMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1f1915", roughness: 0.95, flatShading: true }), []);
  const lMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(C.orangeSoft).multiplyScalar(1.3), map: radialTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);
  useLayoutEffect(() => {
    const m = bRef.current!;
    BUILDINGS.forEach((b, i) => {
      tmp.position.set(b.x, b.h / 2, b.z);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(b.w, b.h, b.d);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, []);
  const dim = 1 - 0.6 * darkAt(t);
  useLayoutEffect(() => {
    const m = lRef.current!;
    LIGHTS.forEach((l, i) => {
      const tw = 0.75 + 0.25 * Math.sin(t * 1.3 + l.ph);
      const s = Math.max(0.25, (9 / zoom) * tw) * dim;
      tmp.position.set(l.x, 0.05, l.z);
      tmp.rotation.set(-Math.PI / 2, 0, 0);
      tmp.scale.set(s, s, 1);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={bRef} args={[undefined, undefined, BUILDINGS.length]} material={bMat} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <instancedMesh ref={lRef} args={[undefined, undefined, LIGHTS.length]} material={lMat} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
    </>
  );
};

/** Street lamp: thin cream post, warm bulb, pool of light on the paving. */
const Lamp: React.FC<{ p: [number, number]; glow: number }> = ({ p, glow }) => {
  const post = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8c7d70", roughness: 0.6 }), []);
  const bulb = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.orangeSoft).multiplyScalar(2), toneMapped: false, transparent: true }), []);
  const pool = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#6b4a30", map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), []);
  bulb.opacity = 0.35 + 0.65 * glow;
  pool.opacity = glow;
  return (
    <group position={[p[0], 0, p[1]]}>
      <mesh material={post} position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 2.3, 6]} />
      </mesh>
      <mesh material={post} position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.12, 8]} />
      </mesh>
      <mesh material={bulb} position={[0, 2.36, 0]}>
        <icosahedronGeometry args={[0.11, 0]} />
      </mesh>
      <mesh material={pool} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, 4.2]} />
      </mesh>
    </group>
  );
};

/** Ground, the paved square with its curb, benches and two lamps. */
export const Plaza: React.FC<{ t: number; zoom: number }> = ({ t, zoom }) => {
  const ground = useMemo(() => new THREE.MeshStandardMaterial({ color: "#151110", roughness: 1 }), []);
  const paving = useMemo(() => {
    const tex = pavingTex();
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.05 });
  }, []);
  const curb = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5d5047", roughness: 0.8, flatShading: true }), []);
  const bench = useMemo(() => new THREE.MeshStandardMaterial({ color: "#cfc0b2", roughness: 0.7, flatShading: true }), []);
  const dark = darkAt(t);
  const lampGlow = 1 - 0.55 * dark;
  const S2 = PLAZA * 2;
  return (
    <>
      <mesh material={ground} position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[600, 600]} />
      </mesh>
      <City t={t} zoom={zoom} />
      <mesh material={paving} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[S2, S2]} />
      </mesh>
      {/* curb */}
      {[[0, -PLAZA, S2 + 0.3, 0.3], [0, PLAZA, S2 + 0.3, 0.3], [-PLAZA, 0, 0.3, S2], [PLAZA, 0, 0.3, S2]].map(([x, z, w, d], i) => (
        <mesh key={i} material={curb} position={[x, 0.07, z]}>
          <boxGeometry args={[w, 0.14, d]} />
        </mesh>
      ))}
      {/* benches along the back edges */}
      {[[-3.9, -1.9], [-3.9, 1.9], [-1.9, -3.9], [1.9, -3.9]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, Math.abs(x) > Math.abs(z) ? Math.PI / 2 : 0, 0]}>
          <mesh material={bench} position={[0, 0.22, 0]}>
            <boxGeometry args={[1.1, 0.08, 0.34]} />
          </mesh>
          <mesh material={bench} position={[-0.42, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.2, 0.3]} />
          </mesh>
          <mesh material={bench} position={[0.42, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.2, 0.3]} />
          </mesh>
        </group>
      ))}
      <Lamp p={[-4.0, 0]} glow={lampGlow} />
      <Lamp p={[0, -4.0]} glow={lampGlow} />
    </>
  );
};
