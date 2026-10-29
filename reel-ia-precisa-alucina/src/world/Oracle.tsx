import React, { useMemo } from "react";
import * as THREE from "three";
import { C, EV, clamp01, musicAt } from "../theme";
import { V3 } from "../camera";
import { ORACLE_R, ORACLE_Y, PLINTH_H, darkAt, frozen, oracleClock, oracleSpin, splitAmt } from "./layout";
import { GroundRing, Seg, useGlowMat } from "./prims";
import { radialTex } from "./textures";

const ORANGE = new THREE.Color(C.orange);
const GREY = new THREE.Color("#8a7a6c");

type Half = { geo: THREE.BufferGeometry; edges: [V3, V3][] };

/**
 * Low-poly icosahedron split into two jagged halves along `axis` (local), by which side each face's centre falls.
 * Edges are the triangle sides of each half, deduplicated.
 */
const splitIco = (r: number, axis: THREE.Vector3): [Half, Half] => {
  const g = new THREE.IcosahedronGeometry(r, 0);
  const pos = g.getAttribute("position");
  const sides: number[][] = [[], []];
  const edges: Map<string, [V3, V3]>[] = [new Map(), new Map()];
  const v = (i: number): V3 => [pos.getX(i), pos.getY(i), pos.getZ(i)];
  const key = (a: V3) => a.map((x) => x.toFixed(3)).join(",");
  for (let f = 0; f < pos.count / 3; f++) {
    const a = v(f * 3);
    const b = v(f * 3 + 1);
    const c = v(f * 3 + 2);
    const cx = (a[0] + b[0] + c[0]) / 3;
    const cy = (a[1] + b[1] + c[1]) / 3;
    const cz = (a[2] + b[2] + c[2]) / 3;
    const s = cx * axis.x + cy * axis.y + cz * axis.z > 0 ? 1 : 0;
    sides[s].push(...a, ...b, ...c);
    for (const [p, q] of [[a, b], [b, c], [c, a]] as [V3, V3][]) {
      const k = [key(p), key(q)].sort().join("|");
      edges[s].set(k, [p, q]);
    }
  }
  return [0, 1].map((s) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(sides[s], 3));
    geo.computeVertexNormals();
    return { geo, edges: [...edges[s].values()] };
  }) as [Half, Half];
};

const SCREEN_RIGHT = new THREE.Vector3(Math.SQRT1_2, 0, -Math.SQRT1_2);
/** How far each half moves out at the split. */
export const SPLIT_D = 1.55;

/** The oracle: translucent orange crystal with a brighter core and a thin orbiting ring, on its cream plinth. */
export const Oracle: React.FC<{ t: number }> = ({ t }) => {
  const spinAtSplit = oracleSpin(EV.split);
  // the cut runs across the screen's horizontal at the moment of the split
  const halves = useMemo(() => splitIco(ORACLE_R, SCREEN_RIGHT.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -spinAtSplit)), [spinAtSplit]);
  const body = useMemo(() => halves.map(() => new THREE.MeshStandardMaterial({
    color: C.orange, emissive: C.orange, roughness: 0.25, metalness: 0, flatShading: true, transparent: true, side: THREE.DoubleSide, depthWrite: false,
  })), [halves]);
  const edgeA = useGlowMat(C.orangeSoft, 1.8);
  const edgeB = useGlowMat(C.orangeSoft, 1.8);
  const core = useGlowMat(C.orangeSoft, 2.6);
  const ringMat = useGlowMat(C.orange, 2.2);
  const shock = useGlowMat(C.orange, 2.0);
  const halo = useMemo(() => new THREE.SpriteMaterial({ map: radialTex(), color: C.orange, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  const plinth = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, roughness: 0.65, flatShading: true, emissive: C.orange, emissiveIntensity: 0 }), []);

  const ck = oracleClock(t);
  const fz = frozen(t);
  const sp = splitAmt(t);
  const split = t >= EV.split;
  const dark = darkAt(t);
  const beat = musicAt(t);
  const bob = 0.09 * Math.sin(ck * 1.7);
  const spin = split ? spinAtSplit : oracleSpin(t);
  // glow: breathes with the music, drops while frozen, the bright half keeps it after the split
  const live = (1 - 0.65 * fz) * (1 - 0.35 * dark);
  const pulse = 0.85 + 0.3 * beat;
  body[0].opacity = split ? 0.88 : 0.5;
  body[1].opacity = split ? 0.1 + 0.03 * Math.sin(t * 9) : 0.5;
  body[0].emissiveIntensity = (split ? 1.5 : 0.75) * live * pulse;
  body[1].emissiveIntensity = (split ? 0.05 : 0.75) * live * pulse;
  body[1].color.set(split ? "#6b5a4c" : C.orange);
  if (!split) body.forEach((b) => b.color.set(C.orange).lerp(GREY, 0.7 * fz));
  edgeA.opacity = live;
  edgeB.opacity = split ? 0.4 : live;
  edgeB.color.set(split ? new THREE.Color(C.cream).multiplyScalar(0.9) : new THREE.Color(C.orangeSoft).multiplyScalar(1.8));
  core.opacity = 0.35 + 0.65 * live;
  halo.opacity = 0.55 * live * pulse * (split ? 0.8 : 1);
  plinth.emissiveIntensity = 0.12 * live * pulse;
  // the ring stops with the oracle and breaks outwards at the split
  const ringOut = clamp01((t - EV.split) / 0.7);
  ringMat.opacity = (1 - ringOut) * (0.4 + 0.6 * live);
  const ringR = 1.35 * (1 + ringOut * 1.6);
  const bead = ck * 2.2;
  // shockwave on the paving at the split
  const sw = clamp01((t - EV.split) / 1.1);
  shock.opacity = sw > 0 && sw < 1 ? (1 - sw) * 0.9 : 0;

  const dx = SCREEN_RIGHT.x * SPLIT_D * sp;
  const dz = SCREEN_RIGHT.z * SPLIT_D * sp;
  const jolt = t > EV.fake0 && t < EV.fake0 + 0.4 ? Math.sin((t - EV.fake0) * 60) * 0.04 * (1 - (t - EV.fake0) / 0.4) : 0;
  return (
    <>
      {/* plinth: stepped octagonal column */}
      <mesh material={plinth} position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.5, 0.54, 0.16, 8]} />
      </mesh>
      <mesh material={plinth} position={[0, PLINTH_H / 2 + 0.08, 0]}>
        <cylinderGeometry args={[0.32, 0.38, PLINTH_H - 0.16, 8]} />
      </mesh>
      <mesh material={plinth} position={[0, PLINTH_H - 0.04, 0]}>
        <cylinderGeometry args={[0.44, 0.4, 0.1, 8]} />
      </mesh>
      <GroundRing c={[0, 0.03, 0]} r={0.6 + sw * 6} w={0.06} mat={shock} />
      <group position={[jolt, ORACLE_Y + bob, 0]}>
        <sprite material={halo} scale={[3.4 * pulse, 3.4 * pulse, 1]} />
        {/* bright half (precision) carries the core */}
        <group position={[-dx, 0.12 * sp, -dz]} rotation={[0, 0, 0.12 * sp]}>
          <group rotation={[0, spin, 0]}>
            <mesh geometry={halves[0].geo} material={body[0]} />
            {halves[0].edges.map(([a, b], i) => <Seg key={i} a={a} b={b} w={0.022} mat={edgeA} />)}
          </group>
          <mesh material={core} rotation={[ck * 0.6, ck * 0.9, 0]} scale={1 + 0.08 * beat}>
            <icosahedronGeometry args={[0.3, 0]} />
          </mesh>
        </group>
        {/* the other half: empty after the split (reliability) */}
        <group position={[dx, -0.06 * sp, dz]} rotation={[0, 0, -0.1 * sp]}>
          <group rotation={[0, spin, 0]}>
            <mesh geometry={halves[1].geo} material={body[1]} />
            {halves[1].edges.map(([a, b], i) => <Seg key={i} a={a} b={b} w={0.022} mat={edgeB} />)}
          </group>
        </group>
        {ringMat.opacity > 0.01 && (
          <group rotation={[1.15 + 0.08 * Math.sin(ck * 0.5), ck * 0.8, 0.25]}>
            <mesh material={ringMat}>
              <torusGeometry args={[ringR, 0.018, 6, 96]} />
            </mesh>
            <mesh material={ringMat} position={[Math.cos(bead) * ringR, Math.sin(bead) * ringR, 0]}>
              <icosahedronGeometry args={[0.06, 0]} />
            </mesh>
          </group>
        )}
      </group>
    </>
  );
};

/** One of the other models: a smaller orb (no name, no logo). */
export const MiniOrb: React.FC<{ t: number; seed: number; glow: number }> = ({ t, seed, glow }) => {
  const body = useMemo(() => new THREE.MeshStandardMaterial({
    color: C.orange, emissive: C.orange, roughness: 0.3, flatShading: true, transparent: true, opacity: 0.6, depthWrite: false,
  }), []);
  const core = useGlowMat(C.orangeSoft, 2.2);
  body.emissiveIntensity = 0.8 * glow;
  core.opacity = glow;
  body.emissive.copy(ORANGE);
  return (
    <group position={[0, 0.08 * Math.sin(t * 2 + seed), 0]} rotation={[0.3, t * 0.6 + seed, 0]}>
      <mesh material={body}>
        <icosahedronGeometry args={[0.32, 1]} />
      </mesh>
      <mesh material={core}>
        <icosahedronGeometry args={[0.13, 0]} />
      </mesh>
    </group>
  );
};
