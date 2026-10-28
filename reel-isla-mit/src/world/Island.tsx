import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EASE, EASE_OUT, EV, S, clamp01, lerp, rand, springAt, windowed } from "../theme";
import {
  BEACH, BLOCK, BOWL_FROM, EKO_SCALE, BOWL_TARGET, ISLAND_RX, ISLAND_RZ, LAND1, LAND2, LETTER_CELLS, MANDALA, NOT_PLAYED, PEAK2, PEAK2_H,
  PICO, PICO_H, PILE, PLAYED, RING_ROCK, ROCK, TEMPLE, TEMPLE_SLOTS, TOWER_L, TOWER_L_N, TOWER_R, TOWER_R_N, arc, clawTip,
  ekoAt, sinkY, templeLand, towerLand,
} from "./layout";
import { Lobster } from "./Lobster";
import { Block, GroundRing, Seg, useGlowMat } from "./prims";

// ── terrain ───────────────────────────────────────────────────────────────
const OUTLINE: [number, number][] = (() => {
  const out: [number, number][] = [];
  const n = 18;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (rand(i + 40) - 0.5) * 0.12;
    out.push([Math.cos(a) * ISLAND_RX * k, Math.sin(a) * ISLAND_RZ * k]);
  }
  return out;
})();

const slab = (scale: number, depth: number) => {
  const sh = new THREE.Shape();
  OUTLINE.forEach(([x, z], i) => (i === 0 ? sh.moveTo(x * scale, -z * scale) : sh.lineTo(x * scale, -z * scale)));
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.22, bevelSegments: 1 });
  g.rotateX(-Math.PI / 2);
  return g;
};

const Terrain: React.FC<{ glow: number }> = ({ glow }) => {
  const top = useMemo(() => slab(1, 0.35), []);
  const cliff = useMemo(() => slab(1.05, 0.6), []);
  const sand = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5a4636", roughness: 0.95, flatShading: true, emissive: C.orange }), []);
  const rock = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2e231c", roughness: 0.9, flatShading: true }), []);
  sand.emissiveIntensity = 0.1 * glow;
  return (
    <>
      <mesh geometry={top} material={sand} position={[0, -0.47, 0]} />
      <mesh geometry={cliff} material={rock} position={[0, -1.05, 0]} />
    </>
  );
};

const STONES: { p: V3; r: number; s: number }[] = Array.from({ length: 14 }, (_, i) => {
  const a = rand(i + 7) * Math.PI * 2;
  const k = 0.86 + rand(i + 21) * 0.1;
  return { p: [Math.cos(a) * ISLAND_RX * k, 0.02, Math.sin(a) * ISLAND_RZ * k] as V3, r: 0.1 + rand(i + 33) * 0.2, s: i };
}).filter((s) => !(s.p[2] > 3.2 && Math.abs(s.p[0]) < 1.5));

const Rocks: React.FC<{ t: number; glow: number }> = ({ t, glow }) => {
  const rock = useMemo(() => new THREE.MeshStandardMaterial({ color: "#4a392d", roughness: 0.9, flatShading: true }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2c23", roughness: 0.9, flatShading: true }), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: C.orangeSoft, emissive: C.orangeSoft, roughness: 0.3, metalness: 0.4 }), []);
  gold.emissiveIntensity = 1.3 + 0.25 * Math.sin(t * 2.2) + glow * 0.8;
  return (
    <>
      {/* el Pico + a smaller peak beside it */}
      <mesh material={dark} position={[PICO[0], PICO_H / 2, PICO[2]]} rotation={[0, 0.3, 0]}>
        <coneGeometry args={[1.55, PICO_H, 7]} />
      </mesh>
      <mesh material={rock} position={[PICO[0] - 0.55, 1.0, PICO[2] + 0.6]} rotation={[0, 1.1, 0.12]}>
        <coneGeometry args={[0.9, 2.0, 6]} />
      </mesh>
      <mesh material={dark} position={[PEAK2[0], PEAK2_H / 2, PEAK2[2]]} rotation={[0, 0.8, 0]}>
        <coneGeometry args={[1.05, PEAK2_H, 6]} />
      </mesh>
      {/* the big rock Eko climbs */}
      <mesh material={rock} position={[ROCK[0], 0.12, ROCK[2]]} scale={[1.25, 1.05, 1.05]} rotation={[0.2, 0.5, 0]}>
        <dodecahedronGeometry args={[1, 0]} />
      </mesh>
      {/* the golden ring on its rock */}
      <mesh material={rock} position={[RING_ROCK[0], 0.2, RING_ROCK[2]]} scale={[0.62, 0.5, 0.55]} rotation={[0, 0.7, 0]}>
        <dodecahedronGeometry args={[1, 0]} />
      </mesh>
      <mesh material={gold} position={[RING_ROCK[0], 1.12, RING_ROCK[2]]} rotation={[0, t * 0.5, 0]}>
        <torusGeometry args={[0.42, 0.045, 8, 40]} />
      </mesh>
      {STONES.map((s) => (
        <mesh key={s.s} material={rock} position={s.p} scale={s.r} rotation={[s.s, s.s * 2, 0]}>
          <dodecahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </>
  );
};

// ── the scenes' props ─────────────────────────────────────────────────────

/** Ghost copies just behind a fast object: a cheap, deterministic motion blur. */
const ghosts = (t: number, n = 5, dt = 0.012) => Array.from({ length: n }, (_, k) => ({ t: t - (k + 1) * dt, o: 0.4 * (1 - k / n) }));

const Bowling: React.FC<{ t: number }> = ({ t }) => {
  const lineMat = useGlowMat(C.cream, 0.55);
  const flash = useGlowMat(C.orange, 2.2);
  const hit = EV.bowlHit;
  const visible = clamp01((t - S.E3 + 0.2) / 0.3);
  if (visible <= 0) return null;
  const c = BOWL_TARGET;
  const corners: V3[] = [[c[0] - 0.55, 0.012, c[2] - 0.55], [c[0] + 0.55, 0.012, c[2] - 0.55], [c[0] + 0.55, 0.012, c[2] + 0.55], [c[0] - 0.55, 0.012, c[2] + 0.55]];
  lineMat.opacity = 0.7 * visible;
  // ball block: in the claw, then slides and tumbles to the pins
  const start: V3 = [BOWL_FROM[0] + 0.5, 0.17, BOWL_FROM[2] - 0.1];
  const end: V3 = [c[0] - 0.42, 0.17, c[2] + 0.06];
  const ballAt = (tt: number): V3 => {
    if (tt < EV.bowl) return clawTip(tt);
    const p = clamp01((tt - EV.bowl) / (hit - EV.bowl));
    const q = 1 - (1 - p) * (1 - p) * 0.4 - 0.6 * (1 - p);
    return [lerp(start[0], end[0], q), 0.17 + 0.25 * Math.max(0, 1 - p * 3) * Math.sin(Math.PI * Math.min(1, p * 3)), lerp(start[2], end[2], q)];
  };
  const pins: { p: V3; v: V3 }[] = [
    { p: [c[0] - 0.05, 0, c[2]], v: [1.4, 2.6, -0.8] },
    { p: [c[0] + 0.25, 0, c[2] - 0.2], v: [1.8, 2.2, -1.6] },
    { p: [c[0] + 0.25, 0, c[2] + 0.2], v: [1.6, 2.4, 1.2] },
  ];
  const fl = clamp01((t - hit) / 0.5);
  return (
    <>
      {corners.map((a, i) => <Seg key={i} a={a} b={corners[(i + 1) % 4]} w={0.035} mat={lineMat} flat />)}
      {t > EV.bowl - 0.35 && (
        <>
          <Block p={ballAt(t)} size={0.26} glow={t > EV.bowl - 0.35 && t < hit + 0.6 ? 0.5 : 0.1} rot={[0, 0, t > EV.bowl ? -Math.min(t - EV.bowl, hit - EV.bowl) * 9 : 0]} />
          {t > EV.bowl && t < hit && ghosts(t).map((g, k) => <Block key={k} p={ballAt(g.t)} size={0.26} glow={0.5} opacity={g.o} />)}
        </>
      )}
      {pins.map((pin, i) => {
        const dt = Math.max(0, t - hit);
        const air = Math.min(dt, 0.55);
        const y = Math.max(0.07, 0.15 + pin.v[1] * air - 4.9 * air * air * 1.6);
        const fallen = dt > 0;
        const p: V3 = [pin.p[0] + pin.v[0] * 0.35 * EASE_OUT(clamp01(dt / 0.6)), fallen ? y : 0.15, pin.p[2] + pin.v[2] * 0.35 * EASE_OUT(clamp01(dt / 0.6))];
        const spin = fallen ? Math.min(dt, 0.55) * 7 : 0;
        return <Block key={i} p={p} size={[0.13, 0.3, 0.13]} glow={fallen ? 0.6 * (1 - clamp01((dt - 0.6) / 0.8)) : 0} rot={[spin * 0.4, i, fallen ? Math.min(Math.PI / 2, spin) : 0]} />;
      })}
      {fl > 0 && fl < 1 && (() => {
        flash.opacity = (1 - fl) * 0.9;
        return <GroundRing c={[c[0], 0.02, c[2]]} r={0.3 + fl * 1.1} w={0.06} mat={flash} />;
      })()}
    </>
  );
};

const Temple: React.FC<{ t: number; net: number }> = ({ t, net }) => (
  <>
    {TEMPLE_SLOTS.map((slot, i) => {
      const land = templeLand(i);
      const t0 = land - 0.3;
      if (t < t0) return null;
      const from = clawTip(t0);
      const flying = t < land;
      const p = flying ? arc(from, slot, t0, land, 0.9, t) : slot;
      const settle = flying ? 0 : 1 - springAt(t, land, 9, 260);
      const glow = Math.max(flying ? 0.55 : 0.55 * (1 - clamp01((t - land) / 0.5)), net * 0.65);
      return (
        <React.Fragment key={i}>
          <Block p={[p[0], p[1] - settle * 0.03, p[2]]} glow={glow} rot={[0, flying ? (t - t0) * 6 : 0, 0]} />
          {flying && ghosts(t, 3, 0.02).map((g, k) => <Block key={k} p={arc(from, slot, t0, land, 0.9, g.t)} glow={0.5} opacity={g.o} />)}
        </React.Fragment>
      );
    })}
  </>
);

const Mandala: React.FC<{ t: number; net: number }> = ({ t, net }) => {
  const mat = useGlowMat(C.orange, 2.4);
  const soft = useGlowMat(C.orangeSoft, 1.6);
  const lp = (l: number) => EASE(clamp01((t - (EV.mandala0 + l * EV.mandalaStep)) / 0.38));
  mat.opacity = 0.95;
  soft.opacity = 0.9;
  const c: V3 = [MANDALA[0], 0.015, MANDALA[2]];
  const pulse = 1 + 0.25 * net * Math.sin(t * 5);
  const out: React.ReactNode[] = [];
  out.push(<GroundRing key="r0" c={c} r={0.32} w={0.045} p={lp(0)} mat={mat} />);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    out.push(<Seg key={`s${k}`} a={[c[0] + Math.cos(a) * 0.34, c[1], c[2] + Math.sin(a) * 0.34]} b={[c[0] + Math.cos(a) * 0.88, c[1], c[2] + Math.sin(a) * 0.88]} w={0.035} p={lp(1)} mat={soft} flat />);
  }
  out.push(<GroundRing key="r1" c={c} r={0.9} w={0.05} p={lp(2)} mat={mat} start={Math.PI / 2} />);
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) / 8) * Math.PI * 2;
    out.push(<GroundRing key={`p${k}`} c={[c[0] + Math.cos(a) * 1.12, c[1], c[2] + Math.sin(a) * 1.12]} r={0.2} w={0.035} p={lp(3)} mat={soft} start={a} />);
  }
  out.push(<GroundRing key="r2" c={c} r={1.38} w={0.055} p={lp(4)} mat={mat} start={-Math.PI / 2} />);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const s = EASE_OUT(clamp01((t - (EV.mandala0 + 5 * EV.mandalaStep) - k * 0.012) / 0.2));
    if (s > 0) out.push(<GroundRing key={`d${k}`} c={[c[0] + Math.cos(a) * 1.58, c[1], c[2] + Math.sin(a) * 1.58]} r={0.025} w={0.05 * s} mat={mat} />);
  }
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    out.push(<GroundRing key={`f${k}`} c={[c[0] + Math.cos(a) * 0.32, c[1], c[2] + Math.sin(a) * 0.32]} r={0.32} w={0.03} p={lp(6)} mat={soft} start={a + Math.PI} />);
  }
  const dot = lp(7);
  if (dot > 0) out.push(<GroundRing key="c" c={c} r={0.05 * pulse} w={0.1 * dot * pulse} mat={mat} />);
  return <>{out}</>;
};

const Letters: React.FC<{ t: number; net: number }> = ({ t, net }) => {
  const glowAll = clamp01((t - EV.lettersGlow) / 0.35);
  return (
    <>
      {LETTER_CELLS.map((cell, i) => {
        const at = EV.letters + cell.letter * EV.letterStep + cell.k * 0.018;
        const s = springAt(t, at, 11, 220);
        if (s <= 0) return null;
        const y = -0.05 + 0.09 * s;
        const wave = glowAll > 0 ? 0.5 + 0.5 * Math.sin((t - EV.lettersGlow) * 6 - cell.p[0] * 2) : 0;
        const glow = Math.max(0.9 * glowAll * (0.75 + 0.25 * wave), 0.6 * (1 - clamp01((t - at) / 0.4)), net * 0.8);
        return <Block key={i} p={[cell.p[0], y, cell.p[2]]} size={[0.27, 0.07, 0.27]} glow={glow} />;
      })}
    </>
  );
};

const Pile: React.FC = () => (
  <>
    {([[0, 0.17, 0, 0.2], [0.36, 0.17, 0.05, -0.3], [0.18, 0.17, 0.38, 0.5], [0.12, 0.51, 0.14, 0.9], [-0.32, 0.17, 0.3, 0.1]] as [number, number, number, number][]).map(([x, y, z, r], i) => (
      <Block key={i} p={[PILE[0] + x, y, PILE[2] + z]} rot={[0, r, 0]} />
    ))}
  </>
);

/** E5: ordinary throw (short), then the jump throw (far), the markers and the distance arrow. */
const Throws: React.FC<{ t: number }> = ({ t }) => {
  const trail = useGlowMat(C.orange, 2.4);
  const cream = useGlowMat(C.cream, 0.9);
  const orange = useGlowMat(C.orange, 2.2);
  const fade = 1 - clamp01((t - S.E6 - 0.1) / 0.5);
  if (t < S.E5 + 1.4 || fade <= 0) return null;
  const e = ekoAt(t);
  const out: React.ReactNode[] = [];
  // held block
  if (e.holding) out.push(<Block key="held" p={clawTip(t)} size={0.26} glow={0.25} />);
  // throw 1
  const from1 = clawTip(EV.throw1);
  const to1: V3 = [LAND1[0], 0.13, LAND1[2]];
  if (t >= EV.throw1) {
    const p = t < EV.land1 ? arc(from1, to1, EV.throw1, EV.land1, 0.7, t) : to1;
    out.push(<Block key="b1" p={p} size={0.26} glow={0.2} opacity={fade} rot={[0, 0, t < EV.land1 ? -(t - EV.throw1) * 8 : -0.55 * 8]} />);
    if (t < EV.land1) ghosts(t).forEach((g, k) => out.push(<Block key={`g1${k}`} p={arc(from1, to1, EV.throw1, EV.land1, 0.7, g.t)} size={0.26} opacity={g.o} />));
    const m = EASE_OUT(clamp01((t - EV.land1) / 0.3));
    if (m > 0) {
      cream.opacity = 0.75 * fade;
      out.push(<GroundRing key="m1" c={[LAND1[0], 0.015, LAND1[2]]} r={0.32 * m} w={0.04} mat={cream} />);
    }
  }
  // throw 2: released mid-jump, flies to the far end
  const from2 = clawTip(EV.release);
  const to2: V3 = [LAND2[0], 0.13, LAND2[2]];
  if (t >= EV.release) {
    const flying = t < EV.land2;
    const p = flying ? arc(from2, to2, EV.release, EV.land2, 2.3, t) : to2;
    out.push(<Block key="b2" p={p} size={0.26} glow={flying ? 1 : 0.6 * fade} opacity={fade} rot={[0, 0, flying ? -(t - EV.release) * 9 : -9]} />);
    if (flying) {
      ghosts(t, 6, 0.014).forEach((g, k) => out.push(<Block key={`g2${k}`} p={arc(from2, to2, EV.release, EV.land2, 2.3, g.t)} size={0.26} glow={1} opacity={g.o} />));
    }
    // orange trail of light along the flight, fading out after the landing
    const trailFade = fade * (1 - clamp01((t - EV.land2 - 0.2) / 0.8));
    trail.opacity = 0.85 * trailFade;
    const tEnd = Math.min(t, EV.land2);
    const n = 22;
    for (let k = 0; k < n; k++) {
      const ta = EV.release + (tEnd - EV.release) * (k / n);
      const tb = EV.release + (tEnd - EV.release) * ((k + 1) / n);
      const age = (t - tb) / 0.5;
      const w = 0.07 * (1 - clamp01(age)) + 0.02;
      if (trailFade > 0) out.push(<Seg key={`tr${k}`} a={arc(from2, to2, EV.release, EV.land2, 2.3, ta)} b={arc(from2, to2, EV.release, EV.land2, 2.3, tb)} w={w} mat={trail} />);
    }
    const m = clamp01((t - EV.land2) / 0.6);
    if (m > 0) {
      orange.opacity = (1 - m) * 0.9 * fade;
      out.push(<GroundRing key="imp" c={[LAND2[0], 0.02, LAND2[2]]} r={0.2 + m * 1.2} w={0.06} mat={orange} />);
      const mk = EASE_OUT(clamp01((t - EV.land2) / 0.3));
      out.push(<GroundRing key="m2" c={[LAND2[0], 0.015, LAND2[2]]} r={0.34 * mk} w={0.05} mat={trail} />);
      // dashed distance arrow on the sand, from the short throw to the far one
      const grow = EASE(clamp01((t - EV.land2 - 0.15) / 0.55));
      const a: V3 = [LAND1[0] + 0.4, 0.02, LAND1[2] + 0.55];
      const b: V3 = [LAND2[0] - 0.4, 0.02, LAND2[2] + 0.55];
      const dashes = 16;
      for (let k = 0; k < dashes; k++) {
        const p0 = k / dashes;
        const p1 = (k + 0.55) / dashes;
        if (p0 > grow) break;
        out.push(<Seg key={`d${k}`} a={[lerp(a[0], b[0], p0), a[1], a[2]]} b={[lerp(a[0], b[0], Math.min(p1, grow)), a[1], a[2]]} w={0.06} mat={trail} flat />);
      }
      if (grow > 0.98) {
        out.push(<Seg key="h1" a={[b[0], 0.02, b[2]]} b={[b[0] - 0.28, 0.02, b[2] - 0.2]} w={0.06} mat={trail} flat />);
        out.push(<Seg key="h2" a={[b[0], 0.02, b[2]]} b={[b[0] - 0.28, 0.02, b[2] + 0.2]} w={0.06} mat={trail} flat />);
      }
    }
  }
  return <>{out}</>;
};

/** E6: the 12 copies, the two towers and the challenge. */
const Groups: React.FC<{ t: number; net: number }> = ({ t, net }) => {
  const leave = clamp01((t - S.E7) / 0.5);
  if (t < EV.spawn || leave >= 1) return null;
  const out: React.ReactNode[] = [];
  const all: { p: V3; look: "played" | "dim"; tower: V3; i: number }[] = [
    ...PLAYED.map((p, i) => ({ p, look: "played" as const, tower: TOWER_L, i })),
    ...NOT_PLAYED.map((p, i) => ({ p, look: "dim" as const, tower: TOWER_R, i: i + 5 })),
  ];
  for (const m of all) {
    const s = springAt(t, EV.spawn + m.i * 0.07, 11, 200);
    if (s <= 0) continue;
    const yaw = Math.atan2(-(m.tower[2] - m.p[2]), m.tower[0] - m.p[0]);
    const busy = m.look === "played" ? 0.5 + 0.5 * Math.sin((t - EV.work) * 9 + m.i) : 0.15 + 0.15 * Math.sin((t - EV.work) * 2.5 + m.i);
    const working = t > EV.work && t < S.E7 ? 1 : 0;
    out.push(
      <group key={m.i} position={[m.p[0], -0.6 * leave, m.p[2]]} rotation={[0, yaw, 0]} scale={0.78 * Math.max(0.01, s)}>
        <Lobster t={t} look={m.look} seed={m.i * 1.7} claw={busy * working} walk={m.look === "played" ? 0.3 * working : 0} opacity={1 - leave} glow={1 + net * 0.4} />
      </group>,
    );
  }
  // towers: blocks fly in from the group around each one
  for (const side of ["L", "R"] as const) {
    const n = side === "L" ? TOWER_L_N : TOWER_R_N;
    const tower = side === "L" ? TOWER_L : TOWER_R;
    const crew = side === "L" ? PLAYED : NOT_PLAYED;
    for (let i = 0; i < n; i++) {
      const land = towerLand(side, i);
      const t0 = land - 0.32;
      if (t < t0) continue;
      const src = crew[i % crew.length];
      const from: V3 = [src[0], 0.45, src[2]];
      const slot: V3 = [tower[0], BLOCK / 2 + i * BLOCK, tower[2]];
      const flying = t < land;
      const p = flying ? arc(from, slot, t0, land, 0.8, t) : slot;
      const glow = side === "L" ? Math.max(0.35, net * 0.7) : 0;
      out.push(<Block key={`${side}${i}`} p={[p[0], p[1] - 0.6 * leave, p[2]]} glow={glow} opacity={1 - leave} rot={[0, flying ? (t - t0) * 5 : (i % 2) * 0.2, 0]} />);
    }
  }
  return <>{out}</>;
};

// ── E7: the island becomes a network ─────────────────────────────────────
export const NODES: V3[] = [
  [MANDALA[0], 0.4, MANDALA[2]], // 0 hub (Eko)
  [TEMPLE[0], 1.05, TEMPLE[2]],
  [ROCK[0], 1.2, ROCK[2]],
  [PEAK2[0], PEAK2_H + 0.05, PEAK2[2]],
  [PICO[0], PICO_H + 0.05, PICO[2]],
  [RING_ROCK[0], 1.12, RING_ROCK[2]],
  [LAND2[0], 0.15, LAND2[2]],
  [BOWL_TARGET[0], 0.15, BOWL_TARGET[2]],
  [BEACH[0], 0.1, BEACH[2]],
  [-1.9, 0.15, 3.0],
  [PILE[0] + 0.1, 0.6, PILE[2] + 0.1],
  [TOWER_L[0], BLOCK * TOWER_L_N, TOWER_L[2]],
];
const EDGES: [number, number][] = [
  [0, 1], [0, 4], [0, 5], [0, 7], [0, 9], [0, 11], [0, 6], [0, 2], [0, 10],
  [2, 1], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 11], [11, 2], [10, 8],
];

const Network: React.FC<{ t: number; net: number }> = ({ t, net }) => {
  const line = useGlowMat(C.orange, 2.2);
  const node = useGlowMat(C.orangeSoft, 2.6);
  const shore = useGlowMat(C.orange, 2.0);
  if (net <= 0) return null;
  line.opacity = 0.9 * net;
  node.opacity = net;
  shore.opacity = 0.85 * net;
  const out: React.ReactNode[] = [];
  EDGES.forEach(([a, b], k) => {
    const p = EASE(clamp01((t - EV.net - k * 0.05) / 0.4));
    // a pulse of light runs along each line
    out.push(<Seg key={`e${k}`} a={NODES[a]} b={NODES[b]} w={0.03} p={p} mat={line} />);
    const run = ((t - EV.net) * 0.9 + k * 0.37) % 1;
    if (p >= 1) {
      const pt: V3 = [lerp(NODES[a][0], NODES[b][0], run), lerp(NODES[a][1], NODES[b][1], run), lerp(NODES[a][2], NODES[b][2], run)];
      out.push(<mesh key={`r${k}`} position={pt} material={node}><sphereGeometry args={[0.06, 8, 6]} /></mesh>);
    }
  });
  NODES.forEach((n, k) => {
    const s = springAt(t, EV.net + k * 0.05, 10, 200) * (1 + 0.15 * Math.sin(t * 4 + k));
    if (k > 0 && s > 0) out.push(<mesh key={`n${k}`} position={n} scale={0.11 * s} material={node}><sphereGeometry args={[1, 10, 8]} /></mesh>);
  });
  // the shoreline lights up all the way round
  const sp = EASE(clamp01((t - EV.net) / 1.2));
  OUTLINE.forEach(([x, z], i) => {
    const [x2, z2] = OUTLINE[(i + 1) % OUTLINE.length];
    const p = clamp01(sp * OUTLINE.length - i);
    out.push(<Seg key={`sh${i}`} a={[x * 1.04, 0.02, z * 1.04]} b={[x2 * 1.04, 0.02, z2 * 1.04]} w={0.07} p={p} mat={shore} flat />);
  });
  return <>{out}</>;
};

// ── Eko ───────────────────────────────────────────────────────────────────
const Eko: React.FC<{ t: number; net: number }> = ({ t, net }) => {
  const flashMat = useGlowMat(C.orangeSoft, 2.5);
  const e = ekoAt(t);
  const s = springAt(t, EV.eko, 10, 160);
  if (s <= 0.001 || e.leave >= 1) return null;
  const squash = 1 - 0.18 * e.crouch;
  const flash = clamp01((t - EV.eko) / 0.7);
  flashMat.opacity = (1 - flash) * 0.9;
  const k = EKO_SCALE * (1 - 0.5 * e.leave);
  const body = (tt: number, opacity: number, key: string) => {
    const g = ekoAt(tt);
    return (
      <group key={key} position={g.p} rotation={[0, g.yaw, 0]} scale={[k * s, k * s * squash, k * s]}>
        <Lobster t={tt} look="eko" walk={g.walk} claw={g.claw} open={g.holding ? 0.2 : 0.6 * g.claw} opacity={opacity * (1 - e.leave)} glow={1 + net * 0.5} />
      </group>
    );
  };
  return (
    <>
      {body(t, 1, "eko")}
      {/* motion blur on dashes */}
      {e.speed > 2.5 && ghosts(t, 3, 0.03).map((g, k) => body(g.t, g.o * 0.8, `gh${k}`))}
      <pointLight position={[e.p[0], e.p[1] + 0.7, e.p[2]]} color={C.orange} intensity={(5 + net * 6) * s * (1 - e.leave)} distance={6} decay={1.6} />
      {flash < 1 && (
        <>
          <GroundRing c={[e.p[0], 0.03, e.p[2]]} r={0.3 + flash * 1.6} w={0.07} mat={flashMat} />
          <mesh position={[e.p[0], 0.4, e.p[2]]} scale={[0.08 * (1 - flash), 2.4 * (1 - flash * 0.5), 0.08 * (1 - flash)]} material={flashMat}>
            <cylinderGeometry args={[1, 1, 1, 8]} />
          </mesh>
        </>
      )}
    </>
  );
};

/** The whole island (rotated so its local axes match the screen), sinking into the sea in E8. */
export const Island: React.FC<{ t: number }> = ({ t }) => {
  const net = windowed(t, EV.net, EV.morph + 0.6, 0.6, 0.6);
  return (
    <group position={[0, sinkY(t), 0]}>
      <Terrain glow={net} />
      <Rocks t={t} glow={net} />
      <Pile />
      <Bowling t={t} />
      <Temple t={t} net={net} />
      <Mandala t={t} net={net} />
      <Letters t={t} net={net} />
      <Throws t={t} />
      <Groups t={t} net={net} />
      <Network t={t} net={net} />
      <Eko t={t} net={net} />
    </group>
  );
};
