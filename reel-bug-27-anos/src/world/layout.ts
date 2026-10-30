import { V3 } from "../camera";
import { EASE, EASE_IN, EV, S, clamp01, drift, lerp } from "../theme";

// World coordinates. The fortress sits square on the axes, so the camera (azimuth 45°) sees its +x and +z faces;
// the gate is in the +z wall, the path comes in from +z.
export const HALF = 3.0;
export const WALL_H = 1.5;
export const WALL_T = 0.4;
export const TOWER = 1.15;
export const TOWER_H = 2.4;
export const KEEP: V3 = [-0.4, 0, -0.4];
export const KEEP_W = 2.0;
export const KEEP_H = 2.9;
export const GATE: V3 = [0, 0.55, HALF + WALL_T / 2 + 0.01];
export const GATE_W = 0.9;
export const GATE_H = 1.05;
export const PATH_FROM: V3 = [0, 0.45, 11];

export const XFACE = HALF + WALL_T / 2 + 0.012; // outer face of the +x wall
export const ZFACE = HALF + WALL_T / 2 + 0.012; // outer face of the +z wall

// ── lights of the fortress: on, cut at the hit (with a flicker), back after the restore ──
export const lightsAt = (t: number) => {
  if (t < EV.hit) return 1;
  const dt = t - EV.hit;
  const flick = dt < 0.45 ? [0.2, 1, 0, 0.7, 0, 0.4, 0, 0, 0.15][Math.floor(dt / 0.05)] ?? 0 : 0;
  const back = EASE(clamp01((t - EV.restore) / 0.9));
  return Math.max(flick, back);
};

// ── the malformed packet: speeds up along the path and hits the gate ──
export const packetAt = (t: number): V3 => {
  const p = Math.pow(clamp01((t - EV.packet) / (EV.hit - EV.packet)), 2.1);
  return [lerp(PATH_FROM[0], GATE[0], p) + 0.15 * Math.sin(t * 9) * (1 - p), PATH_FROM[1] + 0.12 * Math.sin(t * 7), lerp(PATH_FROM[2], GATE[2] + 0.25, p)];
};

// ── cracks: jagged lines on the walls, (u along the wall, v height) ──
type Crack = { face: "x" | "z" | "tower" | "keep"; pts: [number, number][] };
const jag = (u0: number, v0: number, du: number, dv: number, n: number, seed: number): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => [u0 + (du * i) / n + (i > 0 && i < n ? Math.sin(seed + i * 2.3) * 0.09 : 0), v0 + (dv * i) / n]);
export const CRACKS: Crack[] = [
  { face: "x", pts: jag(0.6, 0.25, 0.25, 1.05, 5, 1) },    // 0: the one orb A finds (the SACK bug)
  { face: "z", pts: jag(-1.6, 0.3, -0.2, 0.95, 5, 4) },    // 1: the one orb B flies past
  { face: "tower", pts: jag(-0.2, 0.6, 0.15, 1.2, 5, 7) }, // 2: front tower
  { face: "keep", pts: jag(0.3, 1.0, -0.2, 1.3, 5, 9) },   // 3: keep
];
export const crackPoint = (c: Crack, [u, v]: [number, number]): V3 => {
  switch (c.face) {
    case "x": return [XFACE, v, u];
    case "z": return [u, v, ZFACE];
    case "tower": return [HALF + TOWER / 2 + 0.012, v, HALF + u];
    default: return [KEEP[0] + KEEP_W / 2 + 0.012, v, KEEP[2] + u];
  }
};
export const crackMid = (i: number): V3 => {
  const c = CRACKS[i];
  return crackPoint(c, c.pts[Math.floor(c.pts.length / 2)]);
};

// ── E7: two small orbs (public models) scanning the walls ──
export const ORB_SPAN = 2.7;
export const orbAAt = (t: number): V3 => {
  // runs along the +x wall from the back, reaching crack 0 exactly at "encontró"
  const u0 = -ORB_SPAN;
  const uC = CRACKS[0].pts[2][0];
  const p = clamp01((t - EV.orbA) / (EV.found - EV.orbA));
  const u = p < 1 ? lerp(u0, uC, EASE(p)) : uC + Math.min(1.6, (t - EV.found) * 0.6);
  return [XFACE + 0.85, 0.95 + drift(t, 2, 0.08), u];
};
export const orbBAt = (t: number): V3 => {
  // along the +z wall, right to left, over crack 1 at "no" without stopping
  const uC = CRACKS[1].pts[2][0];
  const v = (uC - ORB_SPAN) / (EV.missed - EV.orbB); // constant speed, passes the crack at "no"
  const u = Math.max(-ORB_SPAN - 1.2, ORB_SPAN + v * Math.max(0, t - EV.orbB));
  return [u, 0.95 + drift(t, 5, 0.08), ZFACE + 0.85];
};

// ── the Lupa's path ──
type Key = [number, V3];
const LUPA_KEYS: Key[] = [
  [0, [KEEP[0], 5.1, KEEP[2]]],
  [S.E7, [KEEP[0], 5.1, KEEP[2]]],
  [S.E7 + 0.9, [-4.6, 3.3, 1.4]],
  [S.E8 - 0.1, [-4.6, 3.3, 1.4]],
  [S.E8 + 0.7, [5.6, 4.0, 0.8]],
  [EV.morph - 0.1, [5.6, 4.0, 0.8]],
  [EV.morph + 0.9, [0.7, 4.2, 0.7]],
  [S.END, [0.7, 4.2, 0.7]],
];
export const lupaAt = (t: number): V3 => {
  let p: V3 = LUPA_KEYS[0][1];
  for (let i = 0; i < LUPA_KEYS.length - 1; i++) {
    const [ta, a] = LUPA_KEYS[i];
    const [tb, b] = LUPA_KEYS[i + 1];
    if (t >= ta && t <= tb) {
      const k = EASE(clamp01((t - ta) / (tb - ta)));
      p = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
      break;
    }
    if (t > tb) p = b;
  }
  return [p[0] + drift(t, 1, 0.06), p[1] + 0.12 * Math.sin(t * 1.8), p[2] + drift(t, 4, 0.06)];
};

// ── E8: the balance ──
export const BALANCE: V3 = [4.6, 0, 3.2];

// ── E9: the fortress sinks, the business rises ──
export const sinkY = (t: number) => -5 * EASE_IN(clamp01((t - EV.morph) / 1.0));
export const riseAt = (t: number) => EASE(clamp01((t - EV.morph - 0.55) / 0.8));
export const BIZ_W = 3.0;
export const BIZ_H = 2.0;
export const FINDINGS: V3[] = [[-1.6, 2.9, 2.2], [0.6, 3.5, 1.9], [2.2, 2.9, -1.1]];
export const FINDING_OK = [true, false, true];
