import { V3 } from "../camera";
import { EASE, EV, clamp01, lerp } from "../theme";

// Plate-local coordinates (see L2W): +x to the right of the screen, +z towards the camera, y up.

// the test box (left) and the other company's servers (right)
export const LAB: V3 = [-2.2, 0, 0.3];
export const LAB_H = 1.1; // half size in x and z
export const LAB_Y = 1.75; // height
export const SRV: V3 = [2.25, 0, -0.3];
export const PLATE_R = 1.75;

export const rackAt = (c: number, r: number): V3 => [SRV[0] + (c - 1) * 0.64, 0, SRV[2] + (r - 0.5) * 0.9];
export const RACK = { w: 0.48, h: 1.3, d: 0.56 };
export const BREACH_RACK = { c: 0, r: 1 };

export const EXAM: V3 = [LAB[0] + 0.35, 0, LAB[2] + 0.35];
export const EXAM_TOP: V3 = [EXAM[0], 0.72, EXAM[2]];
export const BOARD: V3 = [LAB[0], 0, LAB[2] - 0.75];
export const KEY_SPOT: V3 = [0.05, 1.3, 1.3];
export const COINS: V3 = [1.25, 0, 0.85];

// where the agents leave the box (right wall) and enter the servers (front of one rack)
export const LAB_CRACK: V3 = [LAB[0] + LAB_H, 1.05, LAB[2] - 0.1];
const br = rackAt(BREACH_RACK.c, BREACH_RACK.r);
export const SRV_CRACK: V3 = [br[0], 0.75, br[2] + RACK.d / 2 + 0.02];

// three gates in the front wall (the "accesses" of the lesson)
export const gateAt = (k: number): V3 => [LAB[0] + (k - 1) * 0.7, 0, LAB[2] + LAB_H];
export const GATE = { w: 0.5, h: 1.05 };

export const N_PLANES = 14;

// ── modes ───────────────────────────────────────────────────────────────
const inside = (i: number, t: number): V3 => {
  const dir = i % 2 ? 1 : -1;
  const a = (i / N_PLANES) * Math.PI * 2 + dir * t * (0.75 + 0.08 * (i % 4));
  const r = 0.4 + 0.2 * (i % 3);
  return [LAB[0] + Math.cos(a) * r, 0.75 + 0.12 * ((i * 7) % 5) + 0.06 * Math.sin(t * 2 + i), LAB[2] + Math.sin(a) * r];
};
const servers = (i: number, t: number, fast: number): V3 => {
  const dir = i % 2 ? 1 : -1;
  const a = (i / N_PLANES) * Math.PI * 2 + dir * t * (0.9 + 1.4 * fast) + i;
  const r = 1.1 + 0.16 * (i % 3);
  return [SRV[0] + Math.cos(a) * r, 1.65 + 0.12 * (i % 4) + 0.08 * Math.sin(t * 3 + i), SRV[2] + Math.sin(a) * r * 0.85];
};
const SRV_TOP: V3 = [SRV[0], 1.75, SRV[2]];
/** ferrying between the servers and the exam (cheating), u: 0 at the servers → 1 at the exam */
const courierU = (i: number, t: number) => {
  const p = ((t - EV.courier) * 0.5 + i * 0.137) % 1;
  return p < 0.5 ? p * 2 : 2 - p * 2;
};
const courier = (i: number, t: number): V3 => {
  const u = EASE(courierU(i, t));
  const to: V3 = [EXAM_TOP[0], EXAM_TOP[1] + 0.35, EXAM_TOP[2]];
  return [lerp(SRV_TOP[0], to[0], u) + 0.15 * Math.sin(i), lerp(SRV_TOP[1], to[1], u) + 1.1 * Math.sin(Math.PI * u), lerp(SRV_TOP[2], to[2], u) + 0.2 * Math.cos(i)];
};
/** streaming out of the open gates */
const gatesQ = (i: number, t: number) => ((t - EV.gates) * 0.42 + i * 0.193) % 1;
const gates = (i: number, t: number): V3 => {
  const q = gatesQ(i, t);
  const k = i % 3;
  const g = gateAt(k);
  const start: V3 = [LAB[0], 0.8, LAB[2]];
  const door: V3 = [g[0], 0.75, g[2]];
  const out: V3 = [g[0] + (k - 1) * 0.9 + 0.6, 0.9 + 0.3 * (i % 2), g[2] + 1.6];
  if (q < 0.4) {
    const p = q / 0.4;
    return [lerp(start[0], door[0], p), lerp(start[1], door[1], p), lerp(start[2], door[2], p)];
  }
  const p = (q - 0.4) / 0.6;
  return [lerp(door[0], out[0], p), lerp(door[1], out[1], p) + 0.3 * Math.sin(Math.PI * p), lerp(door[2], out[2], p)];
};

type Mode = "inside" | "servers" | "swarm" | "courier" | "gates";

const posIn = (m: Mode, i: number, t: number): V3 => {
  if (m === "inside") return inside(i, t);
  if (m === "servers") return servers(i, t, 0);
  if (m === "swarm") return servers(i, t, 1);
  if (m === "courier") return courier(i, t);
  return gates(i, t);
};

const ESCAPERS = 8;

/** Mode schedule per plane: list of [start time, mode]. */
const schedule = (i: number): [number, Mode][] => ([
  [0, "inside"],
  [i < ESCAPERS ? EV.esc + i * 0.14 : 999, "servers"],
  [EV.swarm + i * 0.04, "swarm"],
  [EV.courier + (i < 10 ? 0 : 999), "courier"],
  [EV.home + i * 0.05, "inside"],
  [EV.gates + i * 0.03, "gates"],
  [EV.close + 0.3 + i * 0.04, "inside"],
] as [number, Mode][]).filter(([s]) => s < 900).sort((a, b) => a[0] - b[0]);

const SCHED = Array.from({ length: N_PLANES }, (_, i) => schedule(i));
const BLEND = 1.0;

/** Bezier through the crack, for the escape. */
const viaCrack = (a: V3, b: V3, p: number): V3 => {
  const c = LAB_CRACK;
  const u = 1 - p;
  return [u * u * a[0] + 2 * u * p * c[0] + p * p * b[0], u * u * a[1] + 2 * u * p * (c[1] + 0.3) + p * p * b[1], u * u * a[2] + 2 * u * p * c[2] + p * p * b[2]];
};

/** Plane 0 also carries the key: from the servers to the key, then into the crack in the rack. */
const keyRun = (t: number): V3 | null => {
  if (t < EV.key - 0.2 || t > EV.keyIn + 0.7) return null;
  const from = servers(0, EV.key - 0.2, 0);
  const keyHover: V3 = [KEY_SPOT[0] + 0.1, KEY_SPOT[1] + 0.12, KEY_SPOT[2]];
  if (t < EV.grab) {
    const p = EASE(clamp01((t - (EV.key - 0.2)) / (EV.grab - EV.key + 0.2)));
    return [lerp(from[0], keyHover[0], p), lerp(from[1], keyHover[1], p) + 0.4 * Math.sin(Math.PI * p), lerp(from[2], keyHover[2], p)];
  }
  if (t < EV.keyIn) {
    const p = EASE(clamp01((t - EV.grab) / (EV.keyIn - EV.grab)));
    const to: V3 = [SRV_CRACK[0], SRV_CRACK[1] + 0.1, SRV_CRACK[2] + 0.15];
    return [lerp(keyHover[0], to[0], p), lerp(keyHover[1], to[1], p) + 0.3 * Math.sin(Math.PI * p), lerp(keyHover[2], to[2], p)];
  }
  // back into the swarm
  const p = EASE(clamp01((t - EV.keyIn) / 0.7));
  const to = servers(0, t, 0);
  return [lerp(SRV_CRACK[0], to[0], p), lerp(SRV_CRACK[1], to[1], p), lerp(SRV_CRACK[2] + 0.15, to[2], p)];
};

export const planeAt = (i: number, t: number): V3 => {
  if (i === 0) {
    const k = keyRun(t);
    if (k) return k;
  }
  const sch = SCHED[i];
  let j = 0;
  while (j < sch.length - 1 && t >= sch[j + 1][0]) j++;
  const [start, mode] = sch[j];
  const cur = posIn(mode, i, t);
  if (j === 0) return cur;
  const prev = posIn(sch[j - 1][1], i, t);
  const p = clamp01((t - start) / BLEND);
  if (p >= 1) return cur;
  if (mode === "servers" && sch[j - 1][1] === "inside") return viaCrack(inside(i, start), cur, EASE(p));
  const e = EASE(p);
  return [lerp(prev[0], cur[0], e), lerp(prev[1], cur[1], e) + 0.25 * Math.sin(Math.PI * e), lerp(prev[2], cur[2], e)];
};

/** Fade for planes looping out of the gates (they wrap round). */
export const planeAlpha = (i: number, t: number) => {
  const appear = clamp01((t - EV.planes - i * 0.05) / 0.4);
  if (t >= EV.gates + i * 0.03 + BLEND && t < EV.close + 0.3 + i * 0.04) {
    const q = gatesQ(i, t);
    return appear * clamp01(Math.min(q / 0.08, (1 - q) / 0.15));
  }
  return appear;
};

/** Is this plane carrying an answer chip back to the exam? */
export const carrying = (i: number, t: number) => {
  if (i >= 10 || t < EV.courier + BLEND || t > EV.home) return false;
  const p = ((t - EV.courier) * 0.5 + i * 0.137) % 1;
  return p < 0.5;
};

export const gateOpen = (k: number, t: number) => {
  const open = EASE(clamp01((t - EV.gates - k * 0.15) / 0.35));
  const shut = EASE(clamp01((t - EV.close - (k === 1 ? 0 : k * 0.09)) / 0.35));
  return open * (1 - shut * (k === 1 ? 0.65 : 1));
};

/** Servers are "visited" (LEDs flicker) from the hack until the agents go home. */
export const hacked = (t: number) => clamp01((t - EV.hack) / 0.3) * (1 - clamp01((t - EV.home) / 0.8));
