import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EASE, EASE_OUT, EV, TITLE, clamp01, rand, springAt } from "../theme";
import { fadeTex, radialTex, signTex } from "./textures";
import { useGlowMat } from "./prims";

// E8: a generic neighbourhood rises from the sea where the island was; the shop in the middle lights up.
// World coordinates (not turned like the island): the shop's +z and +x faces look at the camera.
export const SHOP_W = 3.0;
export const SHOP_H = 2.1;
export const SILHOUETTE: V3 = [-0.3, 0, 2.6];

type Bld = { x: number; z: number; w: number; d: number; h: number; delay: number };

const BUILDINGS: Bld[] = (() => {
  const out: Bld[] = [];
  let seed = 3;
  const sp = 2.35;
  for (let i = -6; i <= 6; i++) {
    for (let j = -6; j <= 6; j++) {
      const x = i * sp + (rand(seed++) - 0.5) * 0.3;
      const z = j * sp + (rand(seed++) - 0.5) * 0.3;
      const across = (x - z) / Math.SQRT2; // screen right
      const front = (x + z) / Math.SQRT2; // towards the camera
      if (Math.abs(across) > 8.2 || front < -14 || front > 8) continue;
      if (Math.abs(x) < 2.8 && Math.abs(z) < 2.8) continue; // the shop's lot
      if (x > -1.8 && x < 3.0 && z > 1.6 && z < 4.8) continue; // the plaza in front, where Eko stands
      if (rand(seed++) < 0.12) continue;
      let h = 0.8 + Math.pow(rand(seed++), 1.4) * 4.2;
      if (front > 1.2) h = Math.min(h, 0.35 + rand(seed++) * 0.5); // low in front so the shop reads
      const w = 1.4 + rand(seed++) * 0.6;
      const d = 1.4 + rand(seed++) * 0.6;
      out.push({ x, z, w, d, h, delay: 0.05 * Math.hypot(i, j) + rand(seed++) * 0.15 });
    }
  }
  return out;
})();

const riseAt = (t: number, delay: number) => EASE_OUT(clamp01((t - EV.morph - 0.35 - delay) / 0.7));

const tmp = new THREE.Object3D();

const Buildings: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const win = useRef<THREE.InstancedMesh>(null);
  const windows = useMemo(() => {
    const out: { b: number; local: V3; face: "x" | "z" }[] = [];
    let seed = 500;
    BUILDINGS.forEach((b, bi) => {
      const floors = Math.floor((b.h - 0.3) / 0.55);
      for (let f = 0; f < floors; f++) {
        for (const face of ["x", "z"] as const) {
          const len = face === "x" ? b.d : b.w;
          const cols = Math.floor(len / 0.45);
          for (let k = 0; k < cols; k++) {
            if (rand(seed++) > 0.16) continue;
            const u = (k - (cols - 1) / 2) * 0.45;
            const y = 0.45 + f * 0.55;
            out.push({ b: bi, local: face === "x" ? [b.w / 2 + 0.01, y, u] : [u, y, b.d / 2 + 0.01], face });
          }
        }
      }
    });
    return out;
  }, []);
  const winMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#c56a2c").multiplyScalar(0.55), toneMapped: false }), []);
  useLayoutEffect(() => {
    const m = ref.current!;
    BUILDINGS.forEach((b, i) => {
      const r = riseAt(t, b.delay);
      const h = Math.max(0.001, b.h * r);
      tmp.position.set(b.x, h / 2 - 0.02, b.z);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(b.w, h, b.d);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    const w = win.current!;
    windows.forEach((wd, i) => {
      const b = BUILDINGS[wd.b];
      const r = riseAt(t, b.delay);
      const on = r > 0.98 && wd.local[1] < b.h ? 1 : 0;
      tmp.position.set(b.x + wd.local[0], wd.local[1], b.z + wd.local[2]);
      tmp.rotation.set(0, wd.face === "x" ? Math.PI / 2 : 0, 0);
      tmp.scale.set(0.2 * on + 0.0001, 0.26 * on + 0.0001, 1);
      tmp.updateMatrix();
      w.setMatrixAt(i, tmp.matrix);
    });
    w.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, BUILDINGS.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#1e1915" roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={win} args={[undefined, undefined, windows.length]} material={winMat} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
    </>
  );
};

const Shop: React.FC<{ t: number }> = ({ t }) => {
  const dark = useMemo(() => signTex(false, TITLE), []);
  const lit = useMemo(() => signTex(true, TITLE), []);
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a221d", roughness: 0.85, flatShading: true }), []);
  const glass = useMemo(() => new THREE.MeshBasicMaterial({ color: C.orangeSoft, toneMapped: false }), []);
  const edge = useGlowMat(C.orange, 2.2);
  const beam = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(C.orange).multiplyScalar(1.3), map: fadeTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
  }), []);
  const pool = useMemo(() => new THREE.MeshBasicMaterial({
    color: C.orange, map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), []);
  const rise = riseAt(t, 0);
  if (rise <= 0) return null;
  // the sign flickers on, then everything glows
  const dt = t - EV.sign;
  const flick = dt < 0 ? 0 : dt < 0.35 ? ([1, 0, 1, 0.3, 1, 0, 1][Math.floor(dt / 0.05)] ?? 1) : 1;
  const on = dt < 0 ? 0 : flick * EASE(clamp01(dt / 0.15));
  glass.color.set(C.orangeSoft).multiplyScalar(0.12 + 1.1 * on);
  edge.opacity = on;
  beam.opacity = 0.5 * on * (0.9 + 0.1 * Math.sin(t * 3));
  pool.opacity = 0.75 * on;
  const H = SHOP_H * rise;
  const W = SHOP_W;
  const corners: V3[] = [[-W / 2, H + 0.01, -W / 2], [W / 2, H + 0.01, -W / 2], [W / 2, H + 0.01, W / 2], [-W / 2, H + 0.01, W / 2]];
  return (
    <group>
      <mesh position={[0, H / 2, 0]} scale={[W, H, W]} material={wall}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      {rise > 0.98 && (
        <>
          {/* front (+z): shop window + door */}
          <mesh position={[-0.4, 0.78, W / 2 + 0.012]} material={glass}>
            <planeGeometry args={[1.7, 1.1]} />
          </mesh>
          <mesh position={[0.95, 0.68, W / 2 + 0.012]} material={glass}>
            <planeGeometry args={[0.66, 1.3]} />
          </mesh>
          {/* side (+x): window */}
          <mesh position={[W / 2 + 0.012, 0.75, 0]} rotation={[0, Math.PI / 2, 0]} material={glass}>
            <planeGeometry args={[2.1, 1.0]} />
          </mesh>
          {/* sign on the front, above the window */}
          <mesh position={[0, SHOP_H + 0.5, W / 2 - 0.1]}>
            <boxGeometry args={[W + 0.5, 0.8, 0.14]} />
            <meshStandardMaterial color="#1c1714" />
          </mesh>
          <mesh position={[0, SHOP_H + 0.5, W / 2 - 0.02]}>
            <planeGeometry args={[W + 0.4, 0.74]} />
            <meshBasicMaterial map={on > 0.5 ? lit : dark} toneMapped={false} color={new THREE.Color(1, 1, 1).multiplyScalar(on > 0.5 ? 1.25 : 1)} />
          </mesh>
          {corners.map((a, i) => {
            const b = corners[(i + 1) % 4];
            const mid: V3 = [(a[0] + b[0]) / 2, a[1], (a[2] + b[2]) / 2];
            return (
              <mesh key={i} position={mid} scale={[Math.abs(b[0] - a[0]) + 0.06, 0.06, Math.abs(b[2] - a[2]) + 0.06]} material={edge}>
                <boxGeometry args={[1, 1, 1]} />
              </mesh>
            );
          })}
          {/* the beacon */}
          {[0, Math.PI / 2].map((r) => (
            <mesh key={r} position={[0, SHOP_H + 4.6, 0]} rotation={[0, Math.PI / 4 + r, 0]} material={beam}>
              <planeGeometry args={[1.6, 8.5]} />
            </mesh>
          ))}
          <mesh position={[0.4, 0.02, 1.0]} rotation={[-Math.PI / 2, 0, 0]} material={pool}>
            <planeGeometry args={[9, 9]} />
          </mesh>
          <pointLight position={[0.2, 1.2, 2.6]} color={C.orange} intensity={9 * on} distance={9} decay={1.5} />
        </>
      )}
    </group>
  );
};

/** Eko again, now a glowing translucent figure (no lobster), answering phone, diary and mobile. */
const Silhouette: React.FC<{ t: number }> = ({ t }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: C.orange, emissive: C.orange, emissiveIntensity: 1.5, transparent: true, opacity: 0.85, roughness: 0.4,
  }), []);
  const rim = useMemo(() => new THREE.MeshBasicMaterial({
    color: C.orangeSoft, transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
  }), []);
  const s = springAt(t, EV.sign - 0.2, 10, 170);
  if (s <= 0.001) return null;
  rim.opacity = 0.3;
  const bob = 0.05 * Math.sin(t * 2.4);
  const [x, , z] = SILHOUETTE;
  return (
    <group position={[x, bob, z]} scale={1.3 * s} rotation={[0, Math.PI / 4, 0]}>
      <mesh position={[0, 0.55, 0]} material={mat}>
        <capsuleGeometry args={[0.22, 0.5, 6, 12]} />
      </mesh>
      <mesh position={[0, 1.12, 0]} material={mat}>
        <sphereGeometry args={[0.17, 14, 10]} />
      </mesh>
      <mesh position={[0, 0.55, 0]} scale={1.18} material={rim}>
        <capsuleGeometry args={[0.22, 0.5, 6, 12]} />
      </mesh>
      <mesh position={[0, 1.12, 0]} scale={1.22} material={rim}>
        <sphereGeometry args={[0.17, 14, 10]} />
      </mesh>
      <pointLight position={[0, 0.8, 0.4]} color={C.orange} intensity={4} distance={4} decay={1.6} />
    </group>
  );
};

export const City: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.morph + 0.3) return null;
  const g = EASE_OUT(clamp01((t - EV.morph - 0.3) / 0.7));
  return (
    <>
      {/* ground slab rising out of the water */}
      <mesh position={[0, -1.2 + 0.6 * g, 0]}>
        <boxGeometry args={[60, 1.2, 60]} />
        <meshStandardMaterial color="#16120f" roughness={0.95} />
      </mesh>
      <Buildings t={t} />
      <Shop t={t} />
      <Silhouette t={t} />
    </>
  );
};
