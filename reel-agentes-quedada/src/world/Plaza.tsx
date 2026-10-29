import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C, EV, S, TL, act, clamp01, rand } from "../theme";
import { radialTex } from "./textures";
import { shockwave } from "./layout";
import { GroundRing, useGlowMat } from "./prims";

// Plaza tiles in world axes (a diamond grid on screen) around the floating office
const STEP = 1.0;
const TILES: { x: number; z: number; d: number; v: number }[] = [];
for (let i = -15; i <= 15; i++) {
  for (let j = -15; j <= 15; j++) {
    const x = i * STEP;
    const z = j * STEP;
    const d = Math.hypot(x, z);
    if (d < 15) TILES.push({ x, z, d, v: rand(i * 31 + j * 7 + 400) });
  }
}

const BASE = new THREE.Color("#1c1714");
const BASE2 = new THREE.Color("#241d18");
const HOT = new THREE.Color(C.orange).multiplyScalar(1.6);
const tmpC = new THREE.Color();
const tmpO = new THREE.Object3D();

/** How much a tile at distance d lights up at time t: a ring of light runs out from the office on every kick. */
const tileHeat = (d: number, t: number) => {
  if (t < EV.drop) return 0;
  let v = 0;
  for (let i = TL.kicks.length - 1; i >= 0; i--) {
    const [k, s] = TL.kicks[i];
    if (k > t) continue;
    const age = t - k;
    if (age > 1.6) break;
    const r = 3.2 + age * 9;
    v += s * Math.exp(-((d - r) ** 2) / 0.5) * Math.exp(-age / 0.5);
  }
  // the drop itself: one big wave
  const w = shockwave(t);
  v += 1.6 * Math.exp(-((d - (3 + w * 14)) ** 2) / 2.5) * (1 - w);
  // the plaza keeps a faint warm floor once the music is up; calmer while the CTA is on
  return Math.min(1.0, v * 0.38) * (1 - 0.5 * clamp01((t - S.E11) / 0.6));
};

const Tiles: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  useLayoutEffect(() => {
    const m = ref.current!;
    TILES.forEach((tile, i) => {
      tmpO.position.set(tile.x, 0.005, tile.z);
      tmpO.rotation.set(-Math.PI / 2, 0, 0);
      tmpO.scale.set(STEP * 0.93, STEP * 0.93, 1);
      tmpO.updateMatrix();
      m.setMatrixAt(i, tmpO.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, []);
  useLayoutEffect(() => {
    const m = ref.current!;
    const fadeFar = (d: number) => clamp01(1.25 - d / 13);
    TILES.forEach((tile, i) => {
      tmpC.copy(BASE).lerp(BASE2, tile.v);
      const h = tileHeat(tile.d, t) * (0.7 + 0.3 * tile.v);
      tmpC.lerp(HOT, clamp01(h));
      tmpC.multiplyScalar(0.35 + 0.65 * fadeFar(tile.d));
      m.setColorAt(i, tmpC);
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, TILES.length]} material={mat} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
};

// Street lamps around the plaza (cream objects); they come on in a ripple on the drop
const LAMPS = Array.from({ length: 8 }, (_, i) => {
  const a = ((i + 0.5) / 8) * Math.PI * 2;
  return { x: Math.cos(a) * 10, z: Math.sin(a) * 10, i };
});
const TREES = [
  [-11, -3], [-10.5, 2.5], [-6, -10.5], [-1.5, -11.5], [3.5, -11], [11, -1], [10.5, 3.5], [6.5, 9.5], [-6.5, 9.5], [1, 11.5],
].map(([x, z], i) => ({ x, z, s: 0.8 + rand(i + 90) * 0.5, i }));

const Lamps: React.FC<{ t: number }> = ({ t }) => {
  const pole = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6e5f53", roughness: 0.8, flatShading: true }), []);
  const heads = useMemo(() => LAMPS.map(() => new THREE.MeshBasicMaterial({ color: C.cream, toneMapped: false })), []);
  const pools = useMemo(() => LAMPS.map(() => new THREE.MeshBasicMaterial({
    color: "#5a4030", map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })), []);
  return (
    <>
      {LAMPS.map((l, k) => {
        const on = clamp01((t - EV.drop - 0.08 - k * 0.05) / 0.12);
        const b = 0.45 + 0.75 * on;
        heads[k].color.set(C.cream).multiplyScalar(b);
        pools[k].opacity = 0.35 + 0.55 * on;
        return (
          <group key={k} position={[l.x, 0, l.z]}>
            <mesh material={pole} position={[0, 0.9, 0]}>
              <cylinderGeometry args={[0.05, 0.07, 1.8, 6]} />
            </mesh>
            <mesh material={heads[k]} position={[0, 1.88, 0]}>
              <icosahedronGeometry args={[0.16, 0]} />
            </mesh>
            <mesh material={pools[k]} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4.2, 4.2]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

const Trees: React.FC = () => {
  const leaf = useMemo(() => new THREE.MeshStandardMaterial({ color: "#4a3c31", roughness: 0.9, flatShading: true }), []);
  const trunk = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2e25", roughness: 0.9, flatShading: true }), []);
  return (
    <>
      {TREES.map((tr) => (
        <group key={tr.i} position={[tr.x, 0, tr.z]} scale={tr.s} rotation={[0, tr.i, 0]}>
          <mesh material={trunk} position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 0.6, 5]} />
          </mesh>
          <mesh material={leaf} position={[0, 1.15, 0]}>
            <coneGeometry args={[0.6, 1.5, 6]} />
          </mesh>
        </group>
      ))}
    </>
  );
};

export const Plaza: React.FC<{ t: number }> = ({ t }) => {
  const wave = useGlowMat(C.orange, 1.6);
  const haze = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#3a2618", map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), []);
  const shadow = useMemo(() => new THREE.MeshBasicMaterial({ color: "#000000", map: radialTex(), transparent: true, depthWrite: false, opacity: 0.75 }), []);
  const w = shockwave(t);
  wave.opacity = t > EV.drop ? (1 - w) * 0.9 : 0;
  haze.opacity = 0.7 + 0.5 * act(t);
  return (
    <>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial color={C.bg} roughness={0.9} />
      </mesh>
      <Tiles t={t} />
      {/* warm haze around the office and its shadow under it */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={haze}>
        <planeGeometry args={[30, 30]} />
      </mesh>
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} material={shadow}>
        <planeGeometry args={[12, 12]} />
      </mesh>
      {t > EV.drop && w < 1 && <GroundRing c={[0, 0.03, 0]} r={3 + w * 14} w={0.25 + 0.4 * (1 - w)} mat={wave} />}
      <Lamps t={t} />
      <Trees />
    </>
  );
};
