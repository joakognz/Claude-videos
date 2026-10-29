import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EV, clamp01, rand } from "../theme";
import { radialTex } from "./textures";

// The night plaza around the shop: paving, street lamps, benches and a ring of low dark buildings.

type Bld = { x: number; z: number; w: number; d: number; h: number };

const BUILDINGS: Bld[] = (() => {
  const out: Bld[] = [];
  let seed = 7;
  const sp = 2.4;
  for (let i = -9; i <= 9; i++) {
    for (let j = -9; j <= 9; j++) {
      const x = i * sp + (rand(seed++) - 0.5) * 0.3;
      const z = j * sp + (rand(seed++) - 0.5) * 0.3;
      const front = (x + z) / Math.SQRT2; // towards the camera
      if (Math.max(Math.abs(x), Math.abs(z)) < 5.4) continue; // the plaza
      if (rand(seed++) < 0.15) continue;
      let h = 0.8 + Math.pow(rand(seed++), 1.4) * 4.5;
      if (front > 2) h = Math.min(h, 0.3 + rand(seed++) * 0.4); // low in front so the shop reads
      out.push({ x, z, w: 1.5 + rand(seed++) * 0.6, d: 1.5 + rand(seed++) * 0.6, h });
    }
  }
  return out;
})();

const tmp = new THREE.Object3D();

const Buildings: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const win = useRef<THREE.InstancedMesh>(null);
  const windows = useMemo(() => {
    const out: { local: V3; face: "x" | "z"; b: number; ph: number }[] = [];
    let seed = 900;
    BUILDINGS.forEach((b, bi) => {
      const floors = Math.floor((b.h - 0.3) / 0.55);
      for (let f = 0; f < floors; f++) {
        for (const face of ["x", "z"] as const) {
          const len = face === "x" ? b.d : b.w;
          const cols = Math.floor(len / 0.45);
          for (let k = 0; k < cols; k++) {
            if (rand(seed++) > 0.14) continue;
            const u = (k - (cols - 1) / 2) * 0.45;
            const y = 0.45 + f * 0.55;
            out.push({ b: bi, local: face === "x" ? [b.x + b.w / 2 + 0.01, y, b.z + u] : [b.x + u, y, b.z + b.d / 2 + 0.01], face, ph: rand(seed++) });
          }
        }
      }
    });
    return out;
  }, []);
  const winMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.cream).multiplyScalar(0.5), toneMapped: false }), []);
  // the time skip (E7): windows flick on and off as if days were passing
  const skip = t - EV.skip;
  useLayoutEffect(() => {
    const m = ref.current!;
    BUILDINGS.forEach((b, i) => {
      tmp.position.set(b.x, b.h / 2 - 0.02, b.z);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(b.w, b.h, b.d);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    const w = win.current!;
    windows.forEach((wd, i) => {
      const flick = skip > 0 && skip < 1.0 ? (Math.floor(skip * 14 + wd.ph * 5) % 2 === 0 ? 1 : 0) : 1;
      tmp.position.set(...wd.local);
      tmp.rotation.set(0, wd.face === "x" ? Math.PI / 2 : 0, 0);
      tmp.scale.set(0.2 * flick + 0.0001, 0.26 * flick + 0.0001, 1);
      tmp.updateMatrix();
      w.setMatrixAt(i, tmp.matrix);
    });
    w.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, BUILDINGS.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#1c1714" roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={win} args={[undefined, undefined, windows.length]} material={winMat} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
    </>
  );
};

const LAMPS: V3[] = [[3.5, 0, -0.9], [-0.9, 0, 3.5], [-3.6, 0, -3.6]];
const BENCHES: { p: V3; r: number }[] = [{ p: [3.4, 0, 0.4], r: Math.PI / 2 }, { p: [0.4, 0, 3.4], r: 0 }];

const Lamps: React.FC<{ t: number; dim: number }> = ({ t, dim }) => {
  const pole = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a3029", roughness: 0.8, flatShading: true }), []);
  const bulb = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.cream).multiplyScalar(1.5), toneMapped: false, transparent: true }), []);
  const pool = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#7a6250", map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), []);
  const skip = t - EV.skip;
  const flick = skip > 0 && skip < 1.0 ? 0.25 + 0.75 * (Math.floor(skip * 10) % 2) : 1;
  bulb.opacity = flick * (1 - dim);
  pool.opacity = 0.55 * flick * (1 - dim);
  return (
    <>
      {LAMPS.map((p, i) => (
        <group key={i} position={p}>
          <mesh material={pole} position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.035, 0.05, 1.6, 6]} />
          </mesh>
          <mesh material={bulb} position={[0, 1.66, 0]}>
            <icosahedronGeometry args={[0.1, 0]} />
          </mesh>
          <mesh material={pool} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.2, 3.2]} />
          </mesh>
        </group>
      ))}
      {BENCHES.map((b, i) => (
        <group key={i} position={b.p} rotation={[0, b.r, 0]}>
          <mesh material={pole} position={[0, 0.22, 0]}>
            <boxGeometry args={[0.9, 0.06, 0.3]} />
          </mesh>
          <mesh material={pole} position={[0, 0.4, -0.13]}>
            <boxGeometry args={[0.9, 0.25, 0.04]} />
          </mesh>
          {[-0.38, 0.38].map((x) => (
            <mesh key={x} material={pole} position={[x, 0.1, 0]}>
              <boxGeometry args={[0.05, 0.2, 0.26]} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
};

// dust motes drifting in the warm light, so the locked shot never stands still
const N_MOTES = 90;
const MOTES = Array.from({ length: N_MOTES }, (_, i) => ({
  x: (rand(i + 101) - 0.5) * 6, z: (rand(i + 202) - 0.5) * 6, y0: rand(i + 303) * 3, sp: 0.12 + rand(i + 404) * 0.25,
  ph: rand(i + 505) * 10, sz: 0.035 + rand(i + 606) * 0.05,
}));

const Motes: React.FC<{ t: number; dim: number }> = ({ t, dim }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(C.orangeSoft).multiplyScalar(0.9), map: radialTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);
  mat.opacity = 0.9 * (1 - 0.5 * dim);
  useLayoutEffect(() => {
    const m = ref.current!;
    MOTES.forEach((d, i) => {
      const y = (d.y0 + t * d.sp) % 3.2;
      tmp.position.set(d.x + 0.25 * Math.sin(t * 0.7 + d.ph), y + 0.1, d.z + 0.25 * Math.cos(t * 0.6 + d.ph));
      tmp.rotation.set(-0.616, Math.PI / 4, 0, "YXZ");
      const s = d.sz * Math.sin(Math.PI * (y / 3.2)) * (0.7 + 0.3 * Math.sin(t * 3 + d.ph));
      tmp.scale.set(s * 4, s * 4, 1);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N_MOTES]} material={mat} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
};

export const Plaza: React.FC<{ t: number; dim: number }> = ({ t, dim }) => {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(11, 22, C.cream, C.cream);
    const m = g.material as THREE.LineBasicMaterial;
    m.transparent = true;
    m.opacity = 0.05;
    m.depthWrite = false;
    return g;
  }, []);
  const glow = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#4a2a14", map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), []);
  glow.opacity = 1 - 0.7 * dim;
  return (
    <>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color={C.bg2} roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 11]} />
        <meshStandardMaterial color="#231c17" roughness={0.9} />
      </mesh>
      <primitive object={grid} position={[0, 0.002, 0]} />
      {/* warm haze of the shop's light on the paving */}
      <mesh position={[0.3, 0.006, 0.3]} rotation={[-Math.PI / 2, 0, 0]} material={glow}>
        <planeGeometry args={[9, 9]} />
      </mesh>
      <Lamps t={t} dim={dim} />
      <Motes t={t} dim={dim} />
      <Buildings t={t} />
    </>
  );
};

export const plazaDim = (t: number) => clamp01((t - EV.dark) / 0.8);
