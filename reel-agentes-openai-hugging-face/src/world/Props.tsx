import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EASE, EASE_OUT, EV, S, clamp01, rand, springAt, windowed } from "../theme";
import {
  BOARD, COINS, EXAM, GATE, KEY_SPOT, LAB, LAB_CRACK, LAB_H, LAB_Y, PLATE_R, RACK, SRV, SRV_CRACK, gateAt, gateOpen, hacked, rackAt,
} from "./layout";
import { GroundRing, Seg, useGlowMat } from "./prims";
import { radialTex } from "./textures";

/** Step flicker (deterministic): faults and doubts flicker instead of turning red. */
const flick = (t: number, seed: number, rate = 14) => (rand(Math.floor(t * rate) + seed * 31) > 0.3 ? 1 : 0.3);

const useCream = (rough = 0.7) => useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, roughness: rough, flatShading: true, emissive: C.cream, emissiveIntensity: 0.05, transparent: true }), [rough]);
const useDark = (color: string) => useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, transparent: true }), [color]);

// ── plates ────────────────────────────────────────────────────────────────
const Plate: React.FC<{ c: V3; t: number; seed: number }> = ({ c, t, seed }) => {
  const top = useDark(C.plate);
  const side = useDark("#2a211b");
  const rim = useGlowMat(C.orange, 1.1);
  const grid = useGlowMat(C.cream, 0.5);
  const pool = useMemo(() => new THREE.MeshBasicMaterial({ map: radialTex(), color: C.orangeSoft, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  rim.opacity = 0.5 + 0.1 * Math.sin(t * 1.7 + seed);
  grid.opacity = 0.07;
  pool.opacity = 0.2 + 0.05 * Math.sin(t * 2.1 + seed);
  const a = t * 0.8 + seed;
  const lines: React.ReactNode[] = [];
  for (let i = -1; i <= 1; i++) {
    const h = Math.sqrt(PLATE_R * PLATE_R - i * i * 0.36) - 0.25;
    lines.push(<Seg key={`x${i}`} a={[c[0] + i * 0.6, 0.012, c[2] - h]} b={[c[0] + i * 0.6, 0.012, c[2] + h]} w={0.02} mat={grid} flat />);
    lines.push(<Seg key={`z${i}`} a={[c[0] - h, 0.012, c[2] + i * 0.6]} b={[c[0] + h, 0.012, c[2] + i * 0.6]} w={0.02} mat={grid} flat />);
  }
  return (
    <>
      <mesh material={top} position={[c[0], -0.14, c[2]]}>
        <cylinderGeometry args={[PLATE_R, PLATE_R, 0.28, 6]} />
      </mesh>
      <mesh material={side} position={[c[0], -0.5, c[2]]}>
        <cylinderGeometry args={[PLATE_R + 0.06, PLATE_R - 0.3, 0.46, 6]} />
      </mesh>
      <mesh material={rim} position={[c[0], 0.005, c[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[PLATE_R - 0.04, PLATE_R + 0.02, 6]} />
      </mesh>
      {lines}
      <mesh material={pool} position={[c[0] + Math.cos(a) * 0.9, 0.015, c[2] + Math.sin(a) * 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 2.6]} />
      </mesh>
    </>
  );
};

// ── the test box ─────────────────────────────────────────────────────────────
const Lab: React.FC<{ t: number }> = ({ t }) => {
  const edge = useGlowMat(C.cream, 0.9);
  const glass = useMemo(() => new THREE.MeshBasicMaterial({ color: C.cream, transparent: true, opacity: 0.03, depthWrite: false, side: THREE.DoubleSide }), []);
  const gateM = useMemo(() => new THREE.MeshBasicMaterial({ color: C.cream, transparent: true, depthWrite: false, side: THREE.DoubleSide }), []);
  const gateEdge = useGlowMat(C.orangeSoft, 1.4);
  const crack = useGlowMat(C.orange, 2.4);
  // the box gets more solid once the lesson closes the gates
  const solid = clamp01((t - EV.close) / 0.6);
  edge.opacity = 0.42 + 0.25 * solid;
  glass.opacity = 0.03 + 0.04 * solid;
  const [x, , z] = LAB;
  const h = LAB_H;
  const cs: V3[] = [[x - h, 0, z - h], [x + h, 0, z - h], [x + h, 0, z + h], [x - h, 0, z + h]];
  const edges: React.ReactNode[] = [];
  cs.forEach((p, i) => {
    const q = cs[(i + 1) % 4];
    edges.push(<Seg key={`b${i}`} a={p} b={q} w={0.025} mat={edge} />);
    edges.push(<Seg key={`t${i}`} a={[p[0], LAB_Y, p[2]]} b={[q[0], LAB_Y, q[2]]} w={0.025} mat={edge} />);
    edges.push(<Seg key={`v${i}`} a={p} b={[p[0], LAB_Y, p[2]]} w={0.025} mat={edge} />);
  });
  // escape crack on the right wall
  const ck = EASE_OUT(clamp01((t - EV.esc) / 0.25));
  crack.opacity = t < EV.esc + 1.5 ? 0.95 * flick(t, 3, 16) : 0.45;
  const c = LAB_CRACK;
  const zig: V3[] = [[c[0], c[1] + 0.45, c[2] - 0.05], [c[0], c[1] + 0.15, c[2] + 0.12], [c[0], c[1] - 0.05, c[2] - 0.1], [c[0], c[1] - 0.3, c[2] + 0.08], [c[0], c[1] - 0.55, c[2] - 0.02]];
  // gates in the front wall
  const gates = [0, 1, 2].map((k) => {
    const g = gateAt(k);
    const o = gateOpen(k, t);
    const show = clamp01((t - EV.gates + 0.6) / 0.4);
    if (show <= 0) return null;
    gateM.opacity = 0.16 * show;
    gateEdge.opacity = 0.8 * show;
    const y = GATE.h / 2 + o * (GATE.h + 0.05);
    return (
      <group key={k}>
        {/* frame */}
        <Seg a={[g[0] - GATE.w / 2, 0, g[2]]} b={[g[0] - GATE.w / 2, GATE.h, g[2]]} w={0.03} mat={gateEdge} />
        <Seg a={[g[0] + GATE.w / 2, 0, g[2]]} b={[g[0] + GATE.w / 2, GATE.h, g[2]]} w={0.03} mat={gateEdge} />
        <Seg a={[g[0] - GATE.w / 2, GATE.h, g[2]]} b={[g[0] + GATE.w / 2, GATE.h, g[2]]} w={0.03} mat={gateEdge} />
        {/* door panel slides up when open */}
        <mesh material={gateM} position={[g[0], Math.min(y, LAB_Y - 0.05), g[2] + 0.01]} scale={[GATE.w - 0.04, GATE.h * (1 - 0.55 * o), 1]}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      </group>
    );
  });
  return (
    <>
      {edges}
      <mesh material={glass} position={[x, LAB_Y / 2, z + h]}><planeGeometry args={[2 * h, LAB_Y]} /></mesh>
      <mesh material={glass} position={[x + h, LAB_Y / 2, z]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[2 * h, LAB_Y]} /></mesh>
      <mesh material={glass} position={[x, LAB_Y / 2, z - h]}><planeGeometry args={[2 * h, LAB_Y]} /></mesh>
      <mesh material={glass} position={[x - h, LAB_Y / 2, z]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[2 * h, LAB_Y]} /></mesh>
      {ck > 0 && zig.slice(0, -1).map((p, i) => <Seg key={`c${i}`} a={p} b={zig[i + 1]} w={0.03} mat={crack} p={ck} />)}
      {gates}
    </>
  );
};

/** The exam the agents wanted to pass (cream tablet on a pedestal) and, in the lesson, a test-only key. */
const Exam: React.FC<{ t: number }> = ({ t }) => {
  const ped = useDark("#4a3a2f");
  const sheet = useCream(0.5);
  const line = useDark("#6a5848");
  const dummy = useMemo(() => new THREE.MeshBasicMaterial({ color: C.cream, transparent: true, wireframe: true }), []);
  // lit when the scene talks about the evaluation and when the agents bring answers back
  const lit = Math.max(windowed(t, EV.exam - 0.1, EV.exam + 1.6, 0.2, 0.5), windowed(t, EV.courier, S.E9 + 0.3, 0.3, 0.5) * (0.6 + 0.4 * flick(t, 9, 10)));
  sheet.emissive.set(C.cream).lerp(new THREE.Color(C.orangeSoft), lit);
  sheet.emissiveIntensity = 0.06 + lit * 0.9;
  const d = Math.max(0, springAt(t, EV.dummy, 12, 170));
  dummy.opacity = 0.75 * (0.75 + 0.25 * Math.sin(t * 4));
  return (
    <>
      <mesh material={ped} position={[EXAM[0], 0.25, EXAM[2]]}>
        <boxGeometry args={[0.3, 0.5, 0.3]} />
      </mesh>
      <group position={[EXAM[0], 0.58, EXAM[2]]} rotation={[-0.75, 0, 0]}>
        <mesh material={sheet}>
          <boxGeometry args={[0.5, 0.36, 0.03]} />
        </mesh>
        {[0, 1, 2].map((r) => (
          <mesh key={r} material={line} position={[r === 0 ? -0.06 : 0, 0.1 - r * 0.09, 0.02]}>
            <boxGeometry args={[r === 0 ? 0.24 : 0.36, 0.025, 0.005]} />
          </mesh>
        ))}
      </group>
      {d > 0.001 && (
        <group position={[LAB[0] - 0.55, 1.05 + 0.05 * Math.sin(t * 2), LAB[2] + 0.4]} rotation={[0, t * 0.8, 0.3]} scale={[d * 1.6, d * 1.6, d * 1.6]}>
          <mesh material={dummy} position={[-0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.03, 5, 10]} />
          </mesh>
          <mesh material={dummy} position={[0.1, 0, 0]}>
            <boxGeometry args={[0.24, 0.04, 0.04]} />
          </mesh>
          <mesh material={dummy} position={[0.18, -0.04, 0]}>
            <boxGeometry args={[0.04, 0.07, 0.04]} />
          </mesh>
        </group>
      )}
    </>
  );
};

/** The improvised message board, inside the box: notes of light pile up. */
const Board: React.FC<{ t: number }> = ({ t }) => {
  const frame = useDark("#3d3129");
  const note = useGlowMat(C.orange, 1.6);
  const s = Math.max(0, springAt(t, EV.board, 12, 160));
  if (s <= 0.001) return null;
  note.opacity = 0.9;
  const notes: React.ReactNode[] = [];
  for (let k = 0; k < 12; k++) {
    const at = EV.notes + k * EV.noteStep;
    const p = EASE_OUT(clamp01((t - at) / 0.2));
    if (p <= 0) continue;
    const c = k % 4;
    const r = Math.floor(k / 4);
    notes.push(
      <mesh key={k} material={note} position={[BOARD[0] - 0.45 + c * 0.3 + (rand(k) - 0.5) * 0.06, 1.38 - r * 0.24, BOARD[2] + 0.05]} rotation={[0, 0, (rand(k + 9) - 0.5) * 0.3]} scale={[p, p, 1]}>
        <planeGeometry args={[0.22, 0.16]} />
      </mesh>,
    );
  }
  return (
    <group>
      <group scale={[1, s, 1]}>
        <mesh material={frame} position={[BOARD[0], 1.12, BOARD[2]]}>
          <boxGeometry args={[1.4, 0.9, 0.05]} />
        </mesh>
        <mesh material={frame} position={[BOARD[0], 0.32, BOARD[2]]}>
          <boxGeometry args={[0.07, 0.64, 0.07]} />
        </mesh>
      </group>
      {notes}
    </group>
  );
};

// ── the other company's servers ─────────────────────────────────────────────
const Servers: React.FC<{ t: number }> = ({ t }) => {
  const body = useCream(0.6);
  const face = useDark("#2c231d");
  const ledC = useGlowMat(C.cream, 1.3);
  const ledO = useGlowMat(C.orange, 2.2);
  const crack = useGlowMat(C.orange, 2.4);
  const ring = useGlowMat(C.cream, 1.2);
  const h = hacked(t);
  const glitch = h > 0 && rand(Math.floor(t * 12)) > 0.75 ? 1 : 0;
  ledC.opacity = 0.85;
  ledO.opacity = 0.95;
  const out: React.ReactNode[] = [];
  for (let c = 0; c < 3; c++) {
    for (let r = 0; r < 2; r++) {
      const p = rackAt(c, r);
      const j = glitch && (c + r + Math.floor(t * 12)) % 3 === 0 ? (rand(c * 7 + r + Math.floor(t * 12)) - 0.5) * 0.06 : 0;
      out.push(
        <group key={`${c}${r}`} position={[p[0] + j, 0, p[2]]}>
          <mesh material={body} position={[0, RACK.h / 2, 0]}>
            <boxGeometry args={[RACK.w, RACK.h, RACK.d]} />
          </mesh>
          {[0, 1, 2, 3, 4].map((k) => {
            const y = 0.25 + k * 0.22;
            const on = h > 0 && rand(c * 31 + r * 7 + k + Math.floor(t * (8 + k))) > 0.45;
            return (
              <group key={k}>
                <mesh material={face} position={[0, y, RACK.d / 2 + 0.005]}>
                  <boxGeometry args={[RACK.w - 0.1, 0.12, 0.01]} />
                </mesh>
                <mesh material={on ? ledO : ledC} position={[RACK.w / 2 - 0.1, y, RACK.d / 2 + 0.014]}>
                  <boxGeometry args={[0.05, 0.05, 0.01]} />
                </mesh>
              </group>
            );
          })}
        </group>,
      );
    }
  }
  // cracks of light where the "unknown flaws" are
  const ck = EASE_OUT(clamp01((t - EV.cracks) / 0.3));
  crack.opacity = t < EV.keyIn + 0.8 ? 0.95 * flick(t, 5, 16) : 0.5 * (1 - clamp01((t - S.E10) / 1));
  const sc = SRV_CRACK;
  const zig: V3[] = [[sc[0] - 0.12, sc[1] + 0.45, sc[2]], [sc[0] + 0.05, sc[1] + 0.2, sc[2]], [sc[0] - 0.08, sc[1], sc[2]], [sc[0] + 0.1, sc[1] - 0.25, sc[2]], [sc[0], sc[1] - 0.5, sc[2]]];
  // detection: cream radar pulses from the servers
  const rings: React.ReactNode[] = [];
  for (let k = 0; k < 3; k++) {
    const p = (t - EV.detect - k * 0.45) / 1.4;
    if (p <= 0 || p >= 1) continue;
    ring.opacity = 0.7 * (1 - p);
    rings.push(<GroundRing key={k} c={[SRV[0], 0.03, SRV[2]]} r={0.6 + p * 1.6} w={0.04} mat={ring} />);
  }
  return (
    <>
      {out}
      {ck > 0 && t < S.E10 + 1 && zig.slice(0, -1).map((p, i) => <Seg key={`c${i}`} a={p} b={zig[i + 1]} w={0.03} mat={crack} p={ck} />)}
      {rings}
    </>
  );
};

/** A credential left out on the open internet, between the two plates (until an agent takes it). */
const Key: React.FC<{ t: number }> = ({ t }) => {
  const m = useCream(0.3);
  const pad = useGlowMat(C.cream, 0.8);
  const s = Math.max(0, springAt(t, EV.key, 12, 170));
  if (s <= 0.001 || t >= EV.grab) return null;
  m.emissive.set(C.orangeSoft);
  m.emissiveIntensity = 0.3 + 0.2 * Math.sin(t * 5);
  pad.opacity = 0.35;
  return (
    <>
      <group position={[KEY_SPOT[0], KEY_SPOT[1] + 0.05 * Math.sin(t * 2.5), KEY_SPOT[2]]} rotation={[0, t * 1.5, 0.3]} scale={[s * 1.6, s * 1.6, s * 1.6]}>
        <mesh material={m} position={[-0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.03, 5, 10]} />
        </mesh>
        <mesh material={m} position={[0.1, 0, 0]}>
          <boxGeometry args={[0.24, 0.04, 0.04]} />
        </mesh>
        <mesh material={m} position={[0.18, -0.04, 0]}>
          <boxGeometry args={[0.04, 0.07, 0.04]} />
        </mesh>
      </group>
      <GroundRing c={[KEY_SPOT[0], 0.4, KEY_SPOT[2]]} r={0.35} w={0.02} mat={pad} />
    </>
  );
};

/** Money they did not go for: a small stack that dims while the voice says so. */
const Coins: React.FC<{ t: number }> = ({ t }) => {
  const m = useCream(0.4);
  const o = windowed(t, EV.coins - 0.1, EV.courier + 0.4, 0.2, 0.5);
  if (o <= 0.01) return null;
  m.opacity = o * (t > EV.coins + 0.5 ? 0.35 + 0.25 * flick(t, 13, 8) : 1);
  const out: React.ReactNode[] = [];
  [[0, 0, 5], [0.34, 0.1, 3], [0.12, 0.34, 4]].forEach(([dx, dz, n], si) => {
    for (let k = 0; k < n; k++) {
      const d = clamp01((t - EV.coins - si * 0.09 - k * 0.025) / 0.25);
      if (d <= 0) continue;
      out.push(
        <mesh key={`${si}${k}`} material={m} position={[COINS[0] + dx, 0.03 + k * 0.06 + (1 - EASE(d)) * 0.8, COINS[2] + dz]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 10]} />
        </mesh>,
      );
    }
  });
  return <>{out}</>;
};

/** Faint dotted bridge between the plates: the open internet. */
const Bridge: React.FC<{ t: number }> = ({ t }) => {
  const dot = useGlowMat(C.cream, 0.8);
  const o = clamp01((t - EV.esc) / 0.6);
  if (o <= 0) return null;
  dot.opacity = 0.35 * o;
  const a: V3 = [LAB[0] + LAB_H + 0.3, 0.03, LAB[2]];
  const b: V3 = [SRV[0] - 1.4, 0.03, SRV[2] + 0.4];
  const n = 14;
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        const p = (k + ((t * 1.2) % 1)) / n;
        return (
          <mesh key={k} material={dot} position={[a[0] + (b[0] - a[0]) * p, 0.03, a[2] + (b[2] - a[2]) * p]}>
            <boxGeometry args={[0.07, 0.02, 0.07]} />
          </mesh>
        );
      })}
    </>
  );
};

export const Props: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Plate c={LAB} t={t} seed={0} />
    <Plate c={SRV} t={t} seed={2} />
    <Bridge t={t} />
    <Lab t={t} />
    <Exam t={t} />
    <Board t={t} />
    <Servers t={t} />
    <Key t={t} />
    <Coins t={t} />
  </>
);
