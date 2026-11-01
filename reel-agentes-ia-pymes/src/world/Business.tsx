import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EASE, EASE_OUT, EV, S, clamp01, lerp, rand, springAt, windowed } from "../theme";
import {
  BAD_CARD, BOARD, BOARD_W, CARD_N, CLIENT, CLOCK, COINS, DESK, GAP_TILE, HUMAN, INV_N, LOOP, OVERDUE, PICKED, PLATE_R, STAFF, TILE,
  cardAt, envelopeAt, focus, invAt, loopAt, tileAt,
} from "./layout";
import { GroundRing, Seg, useGlowMat } from "./prims";

const CREAM = new THREE.Color(C.cream);
const ORANGE = new THREE.Color(C.orange);
const AMBER = new THREE.Color(C.orangeSoft);

/** Step flicker (deterministic): mostly on, sometimes dropping out — how doubts and faults show here. */
const flick = (t: number, seed: number, rate = 14) => (rand(Math.floor(t * rate) + seed * 31) > 0.28 ? 1 : 0.35);

/** E7 "still in testing": the tools go translucent and flicker. */
const testing = (t: number) => windowed(t, EV.test - 0.1, S.E8 + 0.25, 0.25, 0.4);

/** Pop-in of the three tools ("herramientas"). */
const popIn = (t: number, k: number) => Math.max(0, springAt(t, EV.tools + k * EV.toolsStep, 11, 170));

/** Flash when the lesson names the tool (turnos / fichajes / recordatorios). */
const flash = (t: number, at: number) => (t > at ? Math.exp(-(t - at) / 0.45) : 0);

const useCream = (rough = 0.7) => useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, roughness: rough, flatShading: true, emissive: C.cream, emissiveIntensity: 0.05, transparent: true }), [rough]);
const useDark = (color: string) => useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, transparent: true }), [color]);

/** Lights a cream material towards orange (glow 0 → 1) and applies the testing translucency. */
const tint = (m: THREE.MeshStandardMaterial, glow: number, alpha: number) => {
  m.emissive.copy(CREAM).lerp(ORANGE, Math.min(1, glow * 1.3));
  m.emissiveIntensity = 0.05 + glow * 1.4;
  m.color.copy(CREAM).lerp(AMBER, Math.min(1, glow * 0.8));
  m.opacity = alpha;
};

// ── the plate ─────────────────────────────────────────────────────────────
const Plate: React.FC<{ t: number }> = ({ t }) => {
  const top = useDark(C.plate);
  const side = useDark("#2a211b");
  const rim = useGlowMat(C.orange, 1.2);
  const grid = useGlowMat(C.cream, 0.5);
  rim.opacity = 0.55 + 0.1 * Math.sin(t * 1.7);
  grid.opacity = 0.07;
  const lines: React.ReactNode[] = [];
  for (let i = -4; i <= 4; i++) {
    const h = Math.sqrt(Math.max(0, PLATE_R * PLATE_R - i * i)) - 0.15;
    lines.push(<Seg key={`x${i}`} a={[i, 0.012, -h]} b={[i, 0.012, h]} w={0.02} mat={grid} flat />);
    lines.push(<Seg key={`z${i}`} a={[-h, 0.012, i]} b={[h, 0.012, i]} w={0.02} mat={grid} flat />);
  }
  return (
    <>
      <mesh material={top} position={[0, -0.14, 0]}>
        <cylinderGeometry args={[PLATE_R, PLATE_R, 0.28, 14]} />
      </mesh>
      <mesh material={side} position={[0, -0.55, 0]}>
        <cylinderGeometry args={[PLATE_R + 0.08, PLATE_R - 0.25, 0.56, 14]} />
      </mesh>
      <mesh material={rim} position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[PLATE_R - 0.04, PLATE_R + 0.02, 14]} />
      </mesh>
      {lines}
    </>
  );
};

/** Focus pool under the tool the scene is about. */
const FocusRing: React.FC<{ c: V3; r: number; w: number }> = ({ c, r, w }) => {
  const m = useGlowMat(C.orange, 1.6);
  m.opacity = 0.75 * w;
  if (w <= 0.01) return null;
  return <GroundRing c={[c[0], 0.02, c[2]]} r={r} w={0.05} mat={m} />;
};

// ── people: faceless cream pictograms ───────────────────────────────────────
export const Pictogram: React.FC<{ p: V3; s: number; glow?: number; alpha?: number; arm?: number }> = ({ p, s, glow = 0, alpha = 1, arm = 0 }) => {
  const m = useCream(0.6);
  tint(m, glow, alpha);
  if (s <= 0.001) return null;
  return (
    <group position={p} scale={[s, s, s]}>
      <mesh material={m} position={[0, 0.36, 0]}>
        <capsuleGeometry args={[0.17, 0.32, 3, 8]} />
      </mesh>
      <mesh material={m} position={[0, 0.82, 0]}>
        <icosahedronGeometry args={[0.15, 1]} />
      </mesh>
      {arm > 0 && (
        <group position={[0.2, 0.55, 0]} rotation={[0, 0, -0.3 + arm * 2.2]}>
          <mesh material={m} position={[0, -0.16, 0]}>
            <capsuleGeometry args={[0.055, 0.24, 2, 6]} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// ── shift board (TURNOS) ────────────────────────────────────────────────────
const Board: React.FC<{ t: number }> = ({ t }) => {
  const frame = useDark("#3d3129");
  const tiles = useCream();
  const gapM = useCream();
  const newM = useCream();
  const crack = useGlowMat(C.orange, 2.2);
  const s = popIn(t, 0);
  const test = testing(t);
  const alpha = 1 - test * 0.5 * (2 - flick(t, 3));
  const fl = flash(t, EV.f1);
  tint(tiles, 0.08 * focus(t, "board") + fl * 0.8, alpha);
  frame.opacity = alpha;
  if (s <= 0.001) return null;

  const out: React.ReactNode[] = [];
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (c === GAP_TILE.c && r === GAP_TILE.r) continue;
      out.push(
        <mesh key={`${c}${r}`} material={tiles} position={tileAt(c, r)}>
          <boxGeometry args={[TILE, TILE * 0.82, 0.05]} />
        </mesh>,
      );
    }
  }
  // the uncovered shift: cracks and flickers from `gap` until the stand-in's tile arrives
  const g = tileAt(GAP_TILE.c, GAP_TILE.r);
  const broken = t >= EV.gap && t < EV.walk1;
  if (t < EV.gap) {
    tint(gapM, fl * 0.8, alpha);
    out.push(<mesh key="gap" material={gapM} position={g}><boxGeometry args={[TILE, TILE * 0.82, 0.05]} /></mesh>);
  } else if (broken) {
    const k = EASE_OUT(clamp01((t - EV.gap) / 0.3));
    const fk = flick(t, 7, 18);
    tint(gapM, 0, (0.25 + 0.35 * fk) * alpha);
    const j = (rand(Math.floor(t * 18)) - 0.5) * 0.03 * fk;
    out.push(
      <mesh key="gl" material={gapM} position={[g[0] - 0.11 - 0.04 * k + j, g[1] - 0.02 * k, g[2]]} rotation={[0, 0, 0.08 * k]}>
        <boxGeometry args={[TILE / 2 - 0.02, TILE * 0.82, 0.05]} />
      </mesh>,
      <mesh key="gr" material={gapM} position={[g[0] + 0.11 + 0.04 * k - j, g[1] + 0.02 * k, g[2]]} rotation={[0, 0, -0.06 * k]}>
        <boxGeometry args={[TILE / 2 - 0.02, TILE * 0.82, 0.05]} />
      </mesh>,
    );
    crack.opacity = 0.9 * fk;
    out.push(
      <Seg key="c1" a={[g[0] - 0.02, g[1] + 0.17, g[2] + 0.04]} b={[g[0] + 0.03, g[1] + 0.02, g[2] + 0.04]} w={0.02} mat={crack} p={k} />,
      <Seg key="c2" a={[g[0] + 0.03, g[1] + 0.02, g[2] + 0.04]} b={[g[0] - 0.02, g[1] - 0.17, g[2] + 0.04]} w={0.02} mat={crack} p={k} />,
    );
  }
  // the stand-in's tile flies from the picked person into the slot
  if (t >= EV.walk0) {
    const p = EASE(clamp01((t - EV.walk0) / (EV.walk1 - EV.walk0)));
    const from: V3 = [STAFF[PICKED][0], 0.9, STAFF[PICKED][2]];
    const pos: V3 = [lerp(from[0], g[0], p), lerp(from[1], g[1], p) + 0.7 * Math.sin(Math.PI * p), lerp(from[2], g[2], p)];
    const settle = clamp01((t - EV.walk1) / 1.2);
    tint(newM, Math.max(0.15, 1 - settle) * 1 + fl * 0.8, alpha);
    out.push(
      <mesh key="new" material={newM} position={pos} rotation={[0, (1 - p) * 3, 0]}>
        <boxGeometry args={[TILE, TILE * 0.82, 0.05]} />
      </mesh>,
    );
  }
  const [bx, , bz] = BOARD;
  return (
    <group scale={[s, s, s]} position={[0, 0, 0]}>
      <group position={[bx, 0, bz]} scale={[1, 1, 1]}>
        <mesh material={frame} position={[0, 1.38, 0]}>
          <boxGeometry args={[BOARD_W + 0.2, 1.62, 0.08]} />
        </mesh>
        <mesh material={frame} position={[-BOARD_W / 2 + 0.1, 0.3, 0]}>
          <boxGeometry args={[0.09, 0.6, 0.09]} />
        </mesh>
        <mesh material={frame} position={[BOARD_W / 2 - 0.1, 0.3, 0]}>
          <boxGeometry args={[0.09, 0.6, 0.09]} />
        </mesh>
      </group>
      {out}
    </group>
  );
};

/** The team by the board; the chosen stand-in lights up. */
const Staff: React.FC<{ t: number }> = ({ t }) => (
  <>
    {STAFF.map((p, i) => {
      const s = Math.max(0, springAt(t, EV.toStaff - 0.25 + i * 0.1, 12, 170));
      const picked = i === PICKED ? EASE_OUT(clamp01((t - EV.pick) / 0.3)) * (1 - 0.7 * clamp01((t - EV.walk1) / 1)) : 0;
      const fade = 1 - clamp01((t - S.E5) / 0.6);
      return <Pictogram key={i} p={p} s={s * (fade > 0 ? 1 : 0)} glow={picked * 0.8} alpha={0.35 + 0.65 * fade} />;
    })}
  </>
);

// ── time clock and timecards (FICHAJES) ─────────────────────────────────────
const Clock: React.FC<{ t: number }> = ({ t }) => {
  const body = useCream();
  const face = useDark("#2a211b");
  const disp = useGlowMat(C.orange, 1.8);
  const s = popIn(t, 1);
  const test = testing(t);
  const alpha = 1 - test * 0.5 * (2 - flick(t, 5));
  tint(body, flash(t, EV.f2) * 0.8 + 0.06 * focus(t, "clock"), alpha);
  face.opacity = alpha;
  disp.opacity = 0.7 + 0.3 * Math.sin(t * 6);
  if (s <= 0.001) return null;
  const [x, , z] = CLOCK;
  return (
    <group position={[x, 0, z]} scale={[s, s, s]}>
      <mesh material={body} position={[0, 0.7, 0]}>
        <boxGeometry args={[0.9, 1.4, 0.6]} />
      </mesh>
      <mesh material={face} position={[0, 0.92, 0.305]}>
        <boxGeometry args={[0.66, 0.66, 0.02]} />
      </mesh>
      {/* clock hands of light */}
      <Seg a={[0, 0.92, 0.33]} b={[0.2 * Math.sin(t * 2), 0.92 + 0.2 * Math.cos(t * 2), 0.33]} w={0.03} mat={disp} />
      <Seg a={[0, 0.92, 0.33]} b={[0.13 * Math.sin(t * 0.3 + 1), 0.92 + 0.13 * Math.cos(t * 0.3 + 1), 0.33]} w={0.035} mat={disp} />
      <mesh material={face} position={[0, 0.36, 0.305]}>
        <boxGeometry args={[0.44, 0.05, 0.02]} />
      </mesh>
    </group>
  );
};

const Cards: React.FC<{ t: number }> = ({ t }) => {
  const m = useCream();
  const bad = useCream();
  const mark = useDark("#4a3a2f");
  const missing = useGlowMat(C.orangeSoft, 1.4);
  const flagM = useGlowMat(C.orange, 2.2);
  const test = testing(t);
  const alpha = 1 - test * 0.5 * (2 - flick(t, 9));
  const fl = flash(t, EV.f2);
  tint(m, fl * 0.7, alpha);
  mark.opacity = alpha;
  const out: React.ReactNode[] = [];
  const scanned = (i: number) => t > EV.sweep0 + ((cardAt(i)[0] - cardAt(0)[0] + 0.1) / (cardAt(CARD_N - 1)[0] - cardAt(0)[0] + 0.25)) * (EV.sweep1 - EV.sweep0);
  for (let i = 0; i < CARD_N; i++) {
    const s = Math.max(0, springAt(t, EV.cards + i * 0.08, 12, 180));
    if (s <= 0.001) continue;
    const c = cardAt(i);
    const isBad = i === BAD_CARD;
    const hit = isBad && scanned(i);
    const fk = hit ? flick(t, 11, 16) : 1;
    const j = hit ? (rand(Math.floor(t * 16) + 3) - 0.5) * 0.03 * (fk < 1 ? 1 : 0.3) : 0;
    const ok = !isBad && scanned(i) ? EASE_OUT(clamp01((t - EV.sweep0) / 0.2)) : 0;
    if (isBad) tint(bad, hit ? 0.15 : fl * 0.7, alpha * (hit ? 0.55 + 0.45 * fk : 1));
    out.push(
      <group key={i} position={[c[0] + j, c[1] - (1 - s) * 0.6, c[2]]} scale={[1, s, 1]}>
        <mesh material={isBad ? bad : m} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.36, 0.6, 0.03]} />
        </mesh>
        {[0, 1, 2, 3].map((r) => {
          const isMissing = isBad && r === 2;
          if (isMissing) {
            missing.opacity = hit ? 0.25 + 0.65 * (1 - fk + 0.3) : 0;
            return (
              <mesh key={r} material={missing} position={[0, 0.18 - r * 0.12, 0.03]} rotation={[-0.1, 0, 0]}>
                <boxGeometry args={[0.22, 0.05, 0.01]} />
              </mesh>
            );
          }
          return (
            <mesh key={r} material={mark} position={[0, 0.18 - r * 0.12, 0.025]} rotation={[-0.1, 0, 0]}>
              <boxGeometry args={[0.22 - (ok > 0 ? 0 : 0), 0.045, 0.01]} />
            </mesh>
          );
        })}
      </group>,
    );
  }
  // flag on the incomplete card
  const f = Math.max(0, springAt(t, EV.flag, 10, 190));
  if (f > 0.001) {
    const c = cardAt(BAD_CARD);
    const fade = 1 - clamp01((t - S.E6) / 0.5);
    flagM.opacity = fade;
    if (fade > 0) {
      out.push(
        <group key="flag" position={[c[0] + 0.14, c[1] + 0.3, c[2]]} scale={[f, f, f]}>
          <Seg a={[0, 0, 0]} b={[0, 0.5, 0]} w={0.025} mat={flagM} />
          <mesh material={flagM} position={[0.1, 0.42, 0]} rotation={[0, 0, -Math.PI / 2 + 0.05 * Math.sin(t * 6)]}>
            <coneGeometry args={[0.08, 0.2, 3]} />
          </mesh>
        </group>,
      );
    }
  }
  return <>{out}</>;
};

// ── invoices and the reminder envelope (FACTURAS) ───────────────────────────
const Invoices: React.FC<{ t: number }> = ({ t }) => {
  const m = useCream();
  const od = useCream();
  const line = useDark("#5a4a3e");
  const tray = useDark("#3d3129");
  const crack = useGlowMat(C.orange, 2.4);
  const s = popIn(t, 2);
  const test = testing(t);
  const alpha = 1 - test * 0.5 * (2 - flick(t, 13));
  const fl = flash(t, EV.f3);
  tint(m, fl * 0.7 + 0.05 * focus(t, "inv"), alpha);
  line.opacity = alpha;
  tray.opacity = alpha;
  if (s <= 0.001) return null;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < INV_N; i++) {
    const c = invAt(i);
    const isOd = i === OVERDUE;
    const over = isOd && t >= EV.overdue;
    const fk = over && t < EV.fold + 0.3 ? flick(t, 17, 16) : 1;
    const j = over && t < EV.fold ? (rand(Math.floor(t * 16) + 5) - 0.5) * 0.04 : 0;
    // after the reminder is drafted, the overdue invoice stays dimmer
    if (isOd) tint(od, over ? 0.12 * fk : fl * 0.7, alpha * (over ? (t < EV.fold + 0.3 ? 0.5 + 0.5 * fk : 0.55) : 1));
    out.push(
      <group key={i} position={[c[0] + j, c[1], c[2]]} rotation={[-0.22, 0, 0]}>
        <mesh material={isOd ? od : m}>
          <boxGeometry args={[0.42, 0.6, 0.02]} />
        </mesh>
        {[0, 1, 2, 3].map((r) => (
          <mesh key={r} material={line} position={[r === 0 ? -0.06 : 0, 0.18 - r * 0.1, 0.015]}>
            <boxGeometry args={[r === 0 ? 0.18 : 0.3, 0.025, 0.005]} />
          </mesh>
        ))}
        {over && (
          <>
            <Seg a={[0.21, 0.2, 0.02]} b={[0.02, 0.05, 0.02]} w={0.022} mat={crack} p={EASE_OUT(clamp01((t - EV.overdue) / 0.25))} />
            <Seg a={[0.02, 0.05, 0.02]} b={[0.08, -0.12, 0.02]} w={0.022} mat={crack} p={EASE_OUT(clamp01((t - EV.overdue - 0.12) / 0.25))} />
          </>
        )}
      </group>,
    );
  }
  crack.opacity = t < EV.fold + 0.3 ? 0.95 * flick(t, 19, 16) : 0.35;
  return (
    <group scale={[s, s, s]}>
      <mesh material={tray} position={[invAt(2)[0], 0.08, invAt(2)[2] - 0.08]}>
        <boxGeometry args={[INV_N * 0.55 + 0.2, 0.16, 0.5]} />
      </mesh>
      {out}
    </group>
  );
};

const Envelope: React.FC<{ t: number }> = ({ t }) => {
  const m = useCream(0.5);
  const flap = useGlowMat(C.orange, 1.8);
  const ghost = useGlowMat(C.cream, 0.9);
  if (t < EV.fold || t > EV.send + 0.75) return null;
  const p = envelopeAt(t);
  const s = EASE_OUT(clamp01((t - EV.fold) / 0.3));
  // draft: translucent and breathing; approved: solid and lit
  const approved = clamp01((t - EV.approve) / 0.2);
  const draft = t < EV.approve ? 0.55 + 0.25 * Math.sin(t * 4.5) : 1;
  tint(m, 0.12 + approved * 0.5, draft);
  flap.opacity = 0.6 + 0.4 * approved;
  const g: React.ReactNode[] = [];
  if (t > EV.send) {
    for (let k = 1; k <= 5; k++) {
      ghost.opacity = 0.3;
      g.push(
        <mesh key={k} material={ghost} position={envelopeAt(t - k * 0.03)} rotation={[-0.3, 0, 0]} scale={[1.6, 1.6, 1.6]}>
          <boxGeometry args={[0.46, 0.3, 0.03]} />
        </mesh>,
      );
    }
  }
  return (
    <>
      {g}
      <group position={p} scale={[s * 1.6, s * 1.6, s * 1.6]} rotation={[-0.3, 0.15 * Math.sin(t * 1.3), 0]}>
        <mesh material={m}>
          <boxGeometry args={[0.46, 0.3, 0.03]} />
        </mesh>
        <Seg a={[-0.22, 0.14, 0.02]} b={[0, -0.02, 0.02]} w={0.018} mat={flap} />
        <Seg a={[0, -0.02, 0.02]} b={[0.22, 0.14, 0.02]} w={0.018} mat={flap} />
      </group>
    </>
  );
};

// ── the desk, the person with the last word, money and clients ──────────────
const Desk: React.FC<{ t: number }> = ({ t }) => {
  const desk = useDark("#4a3a2f");
  const top = useCream(0.8);
  const coin = useCream(0.4);
  const halo = useGlowMat(C.orange, 1.8);
  const s = Math.max(0, springAt(t, EV.human - 0.15, 12, 160));
  const h = Math.max(0, springAt(t, EV.human, 11, 150));
  tint(top, 0, 1);
  const arm = EASE(clamp01((t - (EV.approve - 0.35)) / 0.3)) * (1 - EASE(clamp01((t - EV.send - 0.3) / 0.4)));
  const sup = EASE_OUT(clamp01((t - EV.halo) / 0.4));
  tint(coin, 0.25 * sup, 1);
  halo.opacity = sup * (0.75 + 0.2 * Math.sin(t * 3));
  const out: React.ReactNode[] = [];
  // coins: three short stacks that drop in ("dinero")
  [[0, 0, 4], [0.36, 0.08, 3], [0.15, 0.36, 5]].forEach(([dx, dz, n], si) => {
    for (let k = 0; k < n; k++) {
      const at = EV.coins + si * 0.09 + k * 0.03;
      const d = clamp01((t - at) / 0.25);
      if (d <= 0) continue;
      out.push(
        <mesh key={`c${si}${k}`} material={coin} position={[COINS[0] + dx, 0.03 + k * 0.06 + (1 - EASE_OUT(d)) * 0.8, COINS[2] + dz]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 10]} />
        </mesh>,
      );
    }
  });
  const cl = Math.max(0, springAt(t, EV.client, 12, 170));
  return (
    <>
      {s > 0.001 && (
        <group position={[DESK[0], 0, DESK[2]]} scale={[s, s, s]}>
          <mesh material={desk} position={[0, 0.27, 0]}>
            <boxGeometry args={[1.45, 0.5, 0.62]} />
          </mesh>
          <mesh material={top} position={[0, 0.54, 0]}>
            <boxGeometry args={[1.55, 0.05, 0.7]} />
          </mesh>
        </group>
      )}
      <Pictogram p={HUMAN} s={h * 1.15} glow={0.05 + 0.15 * sup} arm={arm} />
      {sup > 0.01 && (
        <>
          <GroundRing c={[HUMAN[0], 0.03, HUMAN[2]]} r={0.75 + 0.05 * Math.sin(t * 2)} w={0.05} mat={halo} p={sup} start={t * 0.8} />
          <GroundRing c={[HUMAN[0], 1.55, HUMAN[2]]} r={0.32} w={0.035} mat={halo} p={sup} start={-t * 1.2} />
        </>
      )}
      {out}
      <Pictogram p={CLIENT} s={cl} />
    </>
  );
};

// ── the loop of repetitive work (E9B on) ─────────────────────────────────────
const Loop: React.FC<{ t: number }> = ({ t }) => {
  const rail = useGlowMat(C.orange, 1.6);
  const tick = useGlowMat(C.cream, 1.1);
  const item = useCream(0.5);
  const draw = EASE(clamp01((t - EV.rails) / 0.9));
  if (draw <= 0.001) return null;
  rail.opacity = 0.8;
  tick.opacity = 0.7;
  tint(item, 0.25, 1);
  const out: React.ReactNode[] = [];
  // rules: marks along the rail
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2;
    const at = EV.rules + k * 0.03;
    const s = clamp01((t - at) / 0.2);
    if (s <= 0) continue;
    const p = loopAt(a);
    out.push(
      <mesh key={`k${k}`} material={tick} position={[p[0], 0.05, p[2]]} rotation={[0, -a, 0]} scale={[s, s, s]}>
        <boxGeometry args={[0.04, 0.04, 0.22]} />
      </mesh>,
    );
  }
  // items riding the loop at a steady pace
  const go = clamp01((t - EV.items) / 0.3);
  if (go > 0) {
    for (let k = 0; k < 6; k++) {
      const a = -Math.PI / 2 + (k / 6) * Math.PI * 2 + (t - EV.items) * 0.9;
      const p = loopAt(a);
      const shape: [number, number, number] = k % 3 === 0 ? [0.3, 0.06, 0.3] : k % 3 === 1 ? [0.22, 0.06, 0.34] : [0.34, 0.06, 0.22];
      out.push(
        <mesh key={`i${k}`} material={item} position={[p[0], 0.12 + 0.03 * Math.sin(t * 6 + k), p[2]]} rotation={[0, -a, 0]} scale={[go, go, go]}>
          <boxGeometry args={shape} />
        </mesh>,
      );
    }
  }
  return (
    <>
      <GroundRing c={[LOOP.c[0], 0.03, LOOP.c[2]]} r={1} w={0.025} mat={rail} p={draw} sx={LOOP.rx} sz={LOOP.rz} start={-Math.PI / 2} />
      {out}
    </>
  );
};

export const Business: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Plate t={t} />
    <FocusRing c={[BOARD[0], 0, BOARD[2] + 0.3]} r={1.5} w={focus(t, "board")} />
    <FocusRing c={[CLOCK[0] - 0.2, 0, -1.4]} r={1.7} w={focus(t, "clock")} />
    <FocusRing c={[invAt(2)[0], 0, invAt(2)[2]]} r={1.7} w={focus(t, "inv")} />
    <FocusRing c={[HUMAN[0], 0, HUMAN[2] + 0.3]} r={1.25} w={focus(t, "desk") * 0.6} />
    <Board t={t} />
    <Staff t={t} />
    <Clock t={t} />
    <Cards t={t} />
    <Invoices t={t} />
    <Envelope t={t} />
    <Desk t={t} />
    <Loop t={t} />
  </>
);
