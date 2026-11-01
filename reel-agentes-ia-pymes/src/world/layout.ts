import { V3 } from "../camera";
import { EASE, EV, S, clamp01, lerp } from "../theme";

// Plate-local coordinates (see L2W): +x to the right of the screen, +z towards the camera, y up.
export const PLATE_R = 4.5;
export const PLATE_TOP = 0;

// ── the business's tools ─────────────────────────────────────────────────
// shift board (TURNOS): 4 days x 3 shifts
export const BOARD: V3 = [-2.25, 0, -2.25];
export const BOARD_W = 2.15;
export const TILE = 0.42;
export const tileAt = (c: number, r: number): V3 => [BOARD[0] + (c - 1.5) * 0.5, 0.92 + r * 0.46, BOARD[2] + 0.07];
export const GAP_TILE = { c: 2, r: 1 };

// the team, three cream pictograms by the board
export const STAFF: V3[] = [[-3.7, 0, -0.75], [-3.2, 0, -0.1], [-2.6, 0, 0.35]];
export const PICKED = 1;

// time clock (FICHAJES) and the row of timecards
export const CLOCK: V3 = [2.55, 0, -2.4];
export const CARD_N = 6;
export const BAD_CARD = 4;
export const cardAt = (i: number): V3 => [1.1 + i * 0.5, 0.42, -0.95];

// invoices (FACTURAS)
export const INV_N = 5;
export const OVERDUE = 3;
export const invAt = (i: number): V3 => [0.95 + i * 0.55, 0.5, 1.75];

// desk with the person who has the last word
export const DESK: V3 = [-1.85, 0, 2.35];
export const HUMAN: V3 = [-1.85, 0, 1.75];
export const COINS: V3 = [-3.35, 0, 2.55];
export const CLIENT: V3 = [-0.45, 0, 3.25];

// ── the agent's path ─────────────────────────────────────────────────────
export const HOME: V3 = [0.1, 1.75, 0.35];
const gapTile = tileAt(GAP_TILE.c, GAP_TILE.r);
const BOARD_FRONT: V3 = [BOARD[0], 1.75, BOARD[2] + 0.95];
const CLOCK_FRONT: V3 = [CLOCK[0], 2.0, CLOCK[2] + 0.95];
const INV_FRONT: V3 = [2.05, 1.55, 2.55];
const STAFF_ABOVE: V3 = [-3.0, 1.55, 0.45];
const NEAR_GAP: V3 = [gapTile[0] + 0.55, gapTile[1] + 0.25, gapTile[2] + 0.75];
const CARDS_A: V3 = [cardAt(0)[0] - 0.1, 1.3, -0.45];
const CARDS_B: V3 = [cardAt(CARD_N - 1)[0] + 0.15, 1.3, -0.45];
const INV_A: V3 = [invAt(0)[0] - 0.1, 1.45, 2.35];
const INV_B: V3 = [invAt(OVERDUE)[0], 1.45, 2.35];
export const ENV_DRAFT: V3 = [invAt(OVERDUE)[0] - 0.35, 1.45, 2.65];
export const ENV_HAND: V3 = [HUMAN[0] + 0.55, 1.25, HUMAN[2] + 0.55];
const BY_DRAFT: V3 = [ENV_DRAFT[0] + 0.65, ENV_DRAFT[1] + 0.35, ENV_DRAFT[2] - 0.2];
const BY_HAND: V3 = [ENV_HAND[0] + 0.6, ENV_HAND[1] + 0.4, ENV_HAND[2] - 0.15];

type Key = { t: number; p: V3; lift?: number };

// keyframes: the agent eases from one to the next (with a small hop on long moves)
const KEYS: Key[] = [
  { t: 0, p: HOME },
  { t: EV.exec, p: HOME },
  { t: EV.exec + 0.35, p: BOARD_FRONT, lift: 0.5 },
  { t: EV.exec + 0.7, p: CLOCK_FRONT, lift: 0.6 },
  { t: EV.exec + 1.05, p: INV_FRONT, lift: 0.5 },
  { t: EV.exec + 1.45, p: HOME, lift: 0.3 },
  { t: EV.toStaff, p: HOME },
  { t: EV.scan - 0.05, p: STAFF_ABOVE, lift: 0.4 },
  { t: EV.walk0, p: STAFF_ABOVE },
  { t: EV.walk1, p: NEAR_GAP, lift: 0.3 },
  { t: EV.walk1 + 0.2, p: NEAR_GAP },
  { t: EV.sweep0, p: CARDS_A, lift: 0.5 },
  { t: EV.sweep1, p: CARDS_B },
  { t: EV.toInv, p: CARDS_B },
  { t: EV.toInv + 0.7, p: INV_A, lift: 0.4 },
  { t: EV.detect - 0.2, p: INV_A },
  { t: EV.overdue, p: INV_B },
  { t: EV.fold, p: INV_B },
  { t: EV.draft, p: BY_DRAFT, lift: 0.15 },
  { t: EV.ojo, p: BY_DRAFT },
  { t: EV.ojo + 0.6, p: HOME, lift: 0.3 },
  { t: EV.deliver0, p: HOME },
  { t: EV.deliver0 + 0.35, p: BY_DRAFT, lift: 0.2 },
  { t: EV.deliver1, p: BY_HAND, lift: 0.4 },
  { t: EV.send + 0.2, p: BY_HAND },
  { t: EV.send + 0.9, p: HOME, lift: 0.3 },
  { t: 999, p: HOME },
];

const between = (t: number, keys: Key[]): V3 => {
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1].t) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const p = EASE(clamp01((t - a.t) / Math.max(1e-3, b.t - a.t)));
  const lift = (b.lift ?? 0) * Math.sin(Math.PI * p);
  return [lerp(a.p[0], b.p[0], p), lerp(a.p[1], b.p[1], p) + lift, lerp(a.p[2], b.p[2], p)];
};

/** Agent centre at time t, plus a gentle hover. */
export const agentAt = (t: number): V3 => {
  const p = between(t, KEYS);
  return [p[0] + 0.05 * Math.sin(t * 1.3), p[1] + 0.07 * Math.sin(t * 2.1), p[2] + 0.04 * Math.cos(t * 1.1)];
};

export const agentSpeed = (t: number) => {
  const a = agentAt(t - 0.02);
  const b = agentAt(t);
  return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 0.02;
};

/** What the agent's beam points at (null when it isn't scanning). */
export const beamTarget = (t: number): V3 | null => {
  if (t >= EV.scan && t < EV.walk0) {
    const k = Math.floor(clamp01((t - EV.scan) / (EV.pick - EV.scan)) * 2.999);
    const s = STAFF[t >= EV.pick ? PICKED : [0, 2, 1][k]];
    return [s[0], 0.75, s[2]];
  }
  if (t >= EV.sweep0 && t < EV.sweep1 + 0.1) {
    const a = agentAt(t);
    return [a[0], 0.45, cardAt(0)[2]];
  }
  if (t >= EV.detect - 0.2 && t < EV.fold) {
    const a = agentAt(t);
    return [a[0], 0.5, invAt(0)[2]];
  }
  return null;
};

/** Envelope (the payment reminder) position: folds out of the overdue invoice, waits as a draft, goes to the person, then out. */
export const envelopeAt = (t: number): V3 => {
  const inv = invAt(OVERDUE);
  if (t < EV.fold + 0.35) {
    const p = EASE(clamp01((t - EV.fold) / 0.35));
    return [lerp(inv[0], ENV_DRAFT[0], p), lerp(inv[1] + 0.1, ENV_DRAFT[1], p) + 0.2 * Math.sin(Math.PI * p), lerp(inv[2], ENV_DRAFT[2], p)];
  }
  if (t < EV.deliver0 + 0.35) return [ENV_DRAFT[0], ENV_DRAFT[1] + 0.05 * Math.sin(t * 2.4), ENV_DRAFT[2]];
  if (t < EV.send) {
    const a = agentAt(t);
    const p = EASE(clamp01((t - EV.deliver0 - 0.35) / (EV.deliver1 - EV.deliver0 - 0.35)));
    const off: V3 = [lerp(ENV_DRAFT[0] - BY_DRAFT[0], ENV_HAND[0] - BY_HAND[0], p), lerp(ENV_DRAFT[1] - BY_DRAFT[1], ENV_HAND[1] - BY_HAND[1], p), 0];
    return [a[0] + off[0], a[1] + off[1], a[2] + lerp(ENV_DRAFT[2] - BY_DRAFT[2], ENV_HAND[2] - BY_HAND[2], p)];
  }
  // sent: away to the top right, accelerating
  const p = clamp01((t - EV.send) / 0.7);
  const q = p * p;
  return [ENV_HAND[0] + q * 9, ENV_HAND[1] + q * 5.5, ENV_HAND[2] - q * 6];
};

/** The repetitive loop (E9B on): an ellipse of light round the plate's centre through the three tools. */
export const LOOP = { c: [0.1, 0.03, -0.1] as V3, rx: 3.0, rz: 2.15 };
export const loopAt = (a: number): V3 => [LOOP.c[0] + Math.cos(a) * LOOP.rx, LOOP.c[1], LOOP.c[2] + Math.sin(a) * LOOP.rz];

/** Shared "focus" weight per tool: 1 when the scene is about it. */
export const focus = (t: number, tool: "board" | "clock" | "inv" | "desk") => {
  const win = (a: number, b: number) => clamp01((t - a) / 0.4) * clamp01((b - t) / 0.4);
  if (tool === "board") return win(S.E3, S.E4);
  if (tool === "clock") return win(S.E4, S.E5);
  if (tool === "inv") return win(EV.toInv, S.E6);
  return win(S.E8, S.E9) + win(S.E10, S.E11);
};
