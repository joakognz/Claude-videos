import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Cam, V3 } from "../camera";
import { C, EV, FPS, TITLE, clamp01, musicAt, rand } from "../theme";
import {
  GRID_HALF, GRID_Y, MINIS, MINI_PITCH, MINI_TILE, Mini, TILE, TILES, darkAt, frozen, miniFakeAt, miniIn, miniOut, scanAt, scanned,
} from "./layout";
import { MiniOrb } from "./Oracle";
import { Seg, useGlowMat } from "./prims";
import { questionTex, radialTex } from "./textures";

const CREAM = new THREE.Color(C.cream);
const ORANGE = new THREE.Color(C.orange);
const SOFT = new THREE.Color(C.orangeSoft);
const GHOSTS = 3;

/** Per-frame jitter of an invented tile (deterministic: frame number + tile seed). */
const jitter = (seed: number, frame: number, amp: number): V3 => [
  (rand(seed + frame * 3.1) - 0.5) * amp, (rand(seed + frame * 5.7) - 0.5) * amp * 0.5, (rand(seed + frame * 7.9) - 0.5) * amp,
];

/** Rotation that makes a plane face the camera. */
const facing = (cam: Cam) => {
  const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(...cam.right), new THREE.Vector3(...cam.up), new THREE.Vector3(...cam.d));
  return new THREE.Euler().setFromRotationMatrix(m);
};

/** The oracle's 10×10 grid: blank cream, solid orange when right, trembling orange with a "?" when invented. */
export const Tiles: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const mats = useMemo(() => TILES.map(() => new THREE.MeshStandardMaterial({ color: C.cream, roughness: 0.6, flatShading: true, transparent: true })), []);
  const pools = useMemo(() => TILES.map(() => new THREE.MeshBasicMaterial({
    color: "#8a4a22", map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })), []);
  const ghostMats = useMemo(() => Array.from({ length: GHOSTS }, () => new THREE.MeshBasicMaterial({
    color: ORANGE.clone().multiplyScalar(1.6), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending,
  })), []);
  const qMats = useMemo(() => [0, 1, 2].map(() => new THREE.MeshBasicMaterial({
    map: questionTex(TITLE), color: CREAM.clone().multiplyScalar(1.15), transparent: true, depthWrite: false, toneMapped: false,
  })), []);
  const frameMat = useGlowMat(C.cream, 1.3);
  const scanMat = useGlowMat(C.cream, 2.2);
  const rot = facing(cam);
  const frame = Math.floor(t * FPS);
  const dark = darkAt(t);
  const fz = frozen(t);
  const beat = musicAt(t);
  ghostMats.forEach((m, k) => (m.opacity = 0.32 * (1 - k / GHOSTS) * (1 - 0.4 * dark)));
  qMats[0].opacity = 1 - 0.3 * dark;
  qMats[1].opacity = 0.35 * (1 - 0.3 * dark);
  qMats[2].opacity = 0.18 * (1 - 0.3 * dark);
  frameMat.opacity = 0.9;

  // review line (scene 7)
  const sc = scanAt(t);
  const scanOn = t > EV.scan && t < EV.scan + EV.scanDur + 0.2 ? Math.sin(Math.PI * clamp01((t - EV.scan) / (EV.scanDur + 0.2))) : 0;
  scanMat.opacity = scanOn;
  const H = GRID_HALF + 0.1;
  const x1 = Math.max(-H, sc - H);
  const x2 = Math.min(H, sc + H);

  return (
    <>
      {TILES.map((tile, i) => {
        const m = mats[i];
        const lit = t >= tile.lit ? 1 : 0;
        const flash = lit ? Math.exp(-(t - tile.lit) / 0.22) : 0;
        const fake = clamp01((t - tile.fake) / 0.1);
        const marked = fake > 0 && scanned(tile.p, t) ? 1 : 0;
        const shake = fake * (1 - 0.8 * marked);
        const bob = 0.035 * Math.sin(t * 1.3 + tile.seed);
        const [jx, jy, jz] = shake > 0 ? jitter(tile.seed, frame, 0.07 * shake) : [0, 0, 0];
        const p: V3 = [tile.p[0] + jx, tile.p[1] + bob + jy, tile.p[2] + jz];
        // material by state
        if (fake > 0) {
          const fl = 0.75 + 0.9 * rand(tile.seed + frame * 1.3);
          m.color.copy(ORANGE);
          m.emissive.copy(SOFT);
          m.emissiveIntensity = (0.4 + fl * 0.9 * fake) * (1 - 0.45 * dark);
          m.opacity = 0.62;
        } else if (lit) {
          m.color.copy(ORANGE);
          m.emissive.copy(ORANGE);
          m.emissiveIntensity = (1.9 + 3.2 * flash) * (1 - 0.3 * fz) * (1 - 0.45 * dark) * (0.9 + 0.2 * beat);
          m.opacity = 1;
        } else {
          m.color.copy(CREAM);
          m.emissive.copy(CREAM);
          m.emissiveIntensity = 0.16;
          m.opacity = 1 - 0.35 * dark;
        }
        pools[i].opacity = (lit ? 0.3 + 0.8 * flash : 0) * (1 - 0.5 * dark) + (fake > 0 ? 0.18 * rand(tile.seed + frame) : 0);
        const pop = 1 + 0.18 * flash + 0.1 * Math.exp(-Math.max(0, t - tile.fake) / 0.15) * fake;
        // "?" wobble: squash, stretch and lean, a different phase per tile
        const qs = 0.42 * (0.7 + 0.3 * fake);
        const wob = shake;
        const qx = qs * (1 + 0.22 * Math.sin(t * 13 + tile.seed) * wob);
        const qy = qs * (1 + 0.2 * Math.sin(t * 10.7 + tile.seed * 2) * wob);
        const lean = 0.3 * Math.sin(t * 8.3 + tile.seed) * wob;
        return (
          <group key={i}>
            <mesh material={pools[i]} position={[tile.p[0], 0.015, tile.p[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.5, 1.5]} />
            </mesh>
            <mesh material={m} position={p} scale={[TILE * pop, 0.07, TILE * pop]}>
              <boxGeometry args={[1, 1, 1]} />
            </mesh>
            {fake > 0 && (
              <>
                {/* motion trail: where it was on the previous frames */}
                {ghostMats.map((gm, k) => {
                  const [gx, gy, gz] = jitter(tile.seed, frame - (k + 1), 0.07 * shake * 1.8);
                  return (
                    <mesh key={k} material={gm} position={[tile.p[0] + gx, tile.p[1] + bob + gy, tile.p[2] + gz]} scale={[TILE * 1.02, 0.07, TILE * 1.02]}>
                      <boxGeometry args={[1, 1, 1]} />
                    </mesh>
                  );
                })}
                <group position={[p[0], p[1] + 0.3, p[2]]} rotation={rot}>
                  <mesh material={qMats[0]} rotation={[0, 0, lean]} scale={[qx, qy, 1]}>
                    <planeGeometry args={[1, 1]} />
                  </mesh>
                  <mesh material={qMats[1]} position={[0.05 * wob, 0.01, -0.01]} rotation={[0, 0, -lean]} scale={[qx * 1.1, qy * 0.92, 1]}>
                    <planeGeometry args={[1, 1]} />
                  </mesh>
                  <mesh material={qMats[2]} position={[-0.07 * wob, -0.02, -0.02]} rotation={[0, 0, lean * 1.5]} scale={[qx * 0.9, qy * 1.12, 1]}>
                    <planeGeometry args={[1, 1]} />
                  </mesh>
                </group>
                {marked > 0 && (
                  <>
                    {([[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]] as const).map(([a, b, c, d], k) => {
                      const h = TILE / 2 + 0.05;
                      return (
                        <Seg key={k} a={[p[0] + a * h, p[1] + 0.05, p[2] + b * h]} b={[p[0] + c * h, p[1] + 0.05, p[2] + d * h]} w={0.028} mat={frameMat}
                          p={clamp01((t - EV.scan - 0.05) / 0.25)} />
                      );
                    })}
                  </>
                )}
              </>
            )}
          </group>
        );
      })}
      {scanOn > 0.01 && x2 > x1 && <Seg a={[x1, GRID_Y + 0.1, sc - x1]} b={[x2, GRID_Y + 0.1, sc - x2]} w={0.05} mat={scanMat} />}
    </>
  );
};

const tmp = new THREE.Object3D();
const col = new THREE.Color();

/** One of the other models: its own small 10×10 grid (instanced) and its orb above it. */
const MiniGrid: React.FC<{ t: number; mini: Mini }> = ({ t, mini }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  const s = miniIn(t, mini.k) * (1 - miniOut(t));
  const frame = Math.floor(t * FPS);
  const flare = t > EV.hit2 ? Math.exp(-(t - EV.hit2) / 0.35) : 0;
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < 100; i++) {
      const r = Math.floor(i / 10);
      const c = i % 10;
      const x = (c - 4.5) * MINI_PITCH;
      const z = (r - 4.5) * MINI_PITCH;
      const fj = mini.fake.indexOf(i);
      const fake = fj >= 0 ? clamp01((t - miniFakeAt(mini.k, fj, mini.fake.length)) / 0.1) : 0;
      const lit = mini.lit.includes(i) ? clamp01((t - (EV.orbs + mini.k * EV.orbStep + 0.2 + (r + c) * 0.02)) / 0.15) : 0;
      const j = fake ? jitter(i * 3 + mini.k * 50, frame, 0.05) : [0, 0, 0];
      tmp.position.set(x + j[0], j[1], z + j[2]);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(MINI_TILE, 0.04, MINI_TILE);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      if (fake > 0) col.copy(SOFT).multiplyScalar((0.9 + 0.9 * rand(i + frame * 1.7 + mini.k)) * (1 + 1.6 * flare));
      else if (lit > 0) col.copy(ORANGE).multiplyScalar(0.25 + 0.95 * lit);
      else col.set("#4a3f37");
      m.setColorAt(i, col);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  if (s <= 0.001) return null;
  return (
    <group position={mini.p} scale={s}>
      <instancedMesh ref={ref} args={[undefined, undefined, 100]} material={mat} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <group position={[0, 0.95, 0]}>
        <MiniOrb t={t} seed={mini.k * 2.1} glow={1 + flare} />
      </group>
    </group>
  );
};

export const MiniGrids: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.orbs - 0.1 || t > EV.split + 0.2) return null;
  return <>{MINIS.map((m) => <MiniGrid key={m.k} t={t} mini={m} />)}</>;
};
