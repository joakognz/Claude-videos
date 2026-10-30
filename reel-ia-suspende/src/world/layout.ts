import { V3 } from "../camera";
import { EASE, EASE_OUT, EV, S, TL, clamp01, lerp, rand, springAt } from "../theme";

// World coordinates (no local frame here): the classroom is a square in world axes, so it reads as a
// diamond on screen. Its two back walls run along x = -H (upper left on screen) and z = -H (upper right).
export const H = 3.0;
export const FLOOR_Y = 0.12;
export const WALL_H = 2.9;
export const FRAME_PAD = 0.3;
export const FRAME_TOP = 3.7;

export const DESKS: V3[] = [
  [-1.0, FLOOR_Y, -1.4], [-1.0, FLOOR_Y, 0.3], [-1.0, FLOOR_Y, 2.0],
  [0.7, FLOOR_Y, -1.4], [0.7, FLOOR_Y, 0.3], [0.7, FLOOR_Y, 2.0],
  [2.2, FLOOR_Y, -1.4], [2.2, FLOOR_Y, 2.0],
];
export const STUDENT_DESK: V3 = [0.7, FLOOR_Y, 0.3];
export const STUDENT: V3 = [STUDENT_DESK[0] + 0.62, FLOOR_Y + 1.5, STUDENT_DESK[2]];
export const GATE: V3 = [1.25, FLOOR_Y, -H]; // on the right back wall
export const GATE_W = 1.5;
export const GATE_H = 2.0;
export const NOTE: V3 = [-0.2, FLOOR_Y + 1.5, -H + 0.09];
export const BOARD: V3 = [-H + 0.09, FLOOR_Y + 1.6, 0.3]; // on the left back wall

/** The Student: bob, lean towards the note while it reasons, a little hop when the sheet arrives. */
export const studentAt = (t: number): { p: V3; lean: number; spin: number } => {
  const bob = 0.14 * Math.sin(t * 1.9);
  const lean = EASE(clamp01((t - EV.turn) / 0.6)) * (1 - EASE(clamp01((t - S.E8) / 0.6)));
  const hop = 0.18 * Math.sin(Math.PI * clamp01((t - EV.give) / 0.5));
  // lean: move a touch towards the note (towards -z) and tilt
  return { p: [STUDENT[0] - 0.1 * lean, STUDENT[1] + bob + hop, STUDENT[2] - 0.25 * lean], lean, spin: t * 1.1 };
};

/** Dust motes drifting up through the room (world). */
export const MOTES = Array.from({ length: 90 }, (_, i) => ({
  x: (rand(i + 1) - 0.5) * 2 * H, z: (rand(i + 2) - 0.5) * 2 * H, ph: rand(i + 3), sp: 0.05 + rand(i + 4) * 0.08, s: 0.025 + rand(i + 5) * 0.035,
}));
export const CLOCK: V3 = [-H + 0.09, FLOOR_Y + 2.45, -2.0];

/** Glow of the Student: steady, brighter when it reasons, dimmer while it fakes. */
export const studentGlow = (t: number) => {
  let g = 0.9 + 0.1 * Math.sin(t * 2.3);
  g += 0.5 * Math.sin(Math.PI * clamp01((t - EV.fill0) / 1.6));
  g -= 0.35 * clamp01((t - EV.off0) / 0.8) * (1 - clamp01((t - S.E8) / 0.5));
  if (t > S.E7 && t < S.E8) g *= 0.75 + 0.25 * Math.abs(Math.sin(t * 5));
  return Math.max(0.25, g);
};

// ── the answer sheet: 10 boxes ────────────────────────────────────────────
export type Box = { on: number; dim: number; blink: number };
const rankIn = (arr: number[], i: number) => arr.indexOf(i);

export const boxAt = (i: number, t: number): Box => {
  const lit = rankIn(TL.lit, i);
  const off = rankIn(TL.offOrder, i);
  // E1 flash-forward: four light, six stay dim, then everything clears for the rewind
  let on = lit >= 0 ? clamp01((t - EV.four - lit * 0.09) / 0.12) : 0;
  let dim = lit < 0 ? clamp01((t - EV.six) / 0.3) : 0;
  const rewind = clamp01((t - EV.rewind) / 0.35);
  on *= 1 - rewind;
  dim *= 1 - rewind;
  // E3: all ten, slowly
  if (t > EV.give) on = clamp01((t - EV.fill0 - i * EV.fillStep) / 0.12);
  // E6: six go out one by one
  if (off >= 0) {
    const o = clamp01((t - EV.off0 - off * EV.offStep) / 0.18);
    on *= 1 - o;
    dim = Math.max(dim, o);
  }
  // E10: the perfect demo, all ten again
  if (t > EV.demo) {
    on = Math.max(on, clamp01((t - EV.demo - i * 0.035) / 0.1));
    dim = 0;
  }
  // flicker of the six in E1 and blink of the four in E7
  let blink = 1;
  if (lit < 0 && t > EV.flick && t < EV.rewind) blink = 0.4 + 0.6 * Math.abs(Math.sin((t - EV.flick) * 22 + i));
  if (lit >= 0 && t > S.E7 && t < S.E8) blink = 0.55 + 0.45 * Math.sign(Math.sin((t - S.E7) * 9 + lit * 0.8));
  return { on, dim, blink };
};
export const score = (t: number) => Array.from({ length: 10 }, (_, i) => boxAt(i, t).on).reduce((a, b) => a + b, 0);

/** Gate doors: shut, swing open when the score drops under the line, gone when the lab frame relights. */
export const gateOpen = (t: number) => EASE_OUT(clamp01((t - EV.open) / 0.45));
export const gateGone = (t: number) => clamp01((t - EV.vanish) / 0.5);
export const gateSign = (t: number) => clamp01((t - EV.gate) / 0.25) * (0.85 + 0.15 * Math.sin(t * 7));

/** Lab frame: draws on in E2, faint after, bright again in E8. */
export const frameDraw = (t: number) => EASE(clamp01((t - EV.frame) / 1.1));
export const frameBright = (t: number) =>
  0.35 + 0.65 * Math.max(Math.sin(Math.PI * clamp01((t - EV.frame) / 2.2)), clamp01((t - EV.relight) / 0.4) * (1 - clamp01((t - S.E9) / 0.6)));

/** The note popping onto the wall. */
export const noteIn = (t: number) => Math.max(0, springAt(t, EV.note, 11, 220));

/** Real cases (parcels and tickets) coming in through the doorway in E11 and landing round the Student. */
export const CASES: { to: V3; kind: "box" | "ticket" }[] = [
  { to: [2.1, FLOOR_Y, -0.6], kind: "box" },
  { to: [2.5, FLOOR_Y, 0.7], kind: "ticket" },
  { to: [0.1, FLOOR_Y, 1.2], kind: "box" },
  { to: [-0.2, FLOOR_Y, -0.55], kind: "ticket" },
];
export const caseAt = (k: number, t: number): { p: V3; o: number; land: number } => {
  const a = EV.cases + k * 0.22;
  const q = EASE_OUT(clamp01((t - a) / 0.55));
  const from: V3 = [GATE[0], FLOOR_Y + 0.6, -H - 0.6];
  const c = CASES[k];
  return {
    p: [lerp(from[0], c.to[0], q), lerp(from[1], c.to[1], q) + Math.sin(Math.PI * q) * 0.7, lerp(from[2], c.to[2], q)],
    o: clamp01((t - a) / 0.15),
    land: q,
  };
};
