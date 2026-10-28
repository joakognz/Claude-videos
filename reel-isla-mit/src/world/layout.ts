import { V3 } from "../camera";
import { EASE, EASE_IN, EASE_OUT, EV, S, clamp01, lerp } from "../theme";

// Island-local coordinates (see L2W): +x to the right of the screen, +z towards the camera, y up.
export const ISLAND_RX = 5.6;
export const ISLAND_RZ = 6.0;

export const PICO: V3 = [2.0, 0, -4.0];
export const PICO_H = 4.5;
export const PEAK2: V3 = [-0.4, 0, -4.6];
export const PEAK2_H = 2.4;
export const ROCK: V3 = [-3.6, 0, -2.6];
export const ROCK_TOP = 1.15;
export const RING_ROCK: V3 = [4.2, 0, -2.0];
export const TEMPLE: V3 = [-1.4, 0, -3.0];
export const MANDALA: V3 = [0.6, 0, -0.9];
export const BEACH: V3 = [0.2, 0, 4.6];
export const PILE: V3 = [1.7, 0, 2.3];
export const LETTERS: V3 = [-1.9, 0, 3.0];
export const BOWL_FROM: V3 = [0.7, 0, 3.6];
export const BOWL_TARGET: V3 = [3.6, 0, 3.0];
export const THROW_SPOT: V3 = [-4.4, 0, 1.0];
export const LAND1: V3 = [-2.2, 0, 1.0];
export const LAND2: V3 = [4.4, 0, 1.0];
export const TOWER_L: V3 = [-2.7, 0, -0.7];
export const TOWER_R: V3 = [2.9, 0, -0.5];
export const EKO_GROUP_SPOT: V3 = [-2.75, 0, 1.25];
export const EKO_SCALE = 1.35;

export const BLOCK = 0.34;
export const TOWER_L_N = 9;
export const TOWER_R_N = 3;

export const PLAYED: V3[] = [[-4.1, 0, 0.1], [-3.7, 0, 0.9], [-1.8, 0, 0.9], [-1.3, 0, 0.1], [-1.4, 0, -0.8]];
export const NOT_PLAYED: V3[] = [[1.6, 0, 0.2], [2.1, 0, 0.95], [2.95, 0, 1.25], [3.8, 0, 0.95], [4.3, 0, 0.2], [4.35, 0, -0.65]];

// 3x5 pixel letters, row 0 is the far row
const GLYPHS: Record<string, string[]> = {
  E: ["111", "100", "111", "100", "111"],
  K: ["101", "110", "100", "110", "101"],
  O: ["111", "101", "101", "101", "111"],
};
export const CELL = 0.3;
export const LETTER_CELLS: { p: V3; letter: number; k: number }[] = (() => {
  const out: { p: V3; letter: number; k: number }[] = [];
  ["E", "K", "O"].forEach((ch, li) => {
    let k = 0;
    GLYPHS[ch].forEach((row, r) => {
      [...row].forEach((v, c) => {
        if (v !== "1") return;
        out.push({ p: [LETTERS[0] + (li - 1) * 4 * CELL + (c - 1) * CELL, 0, LETTERS[2] + (r - 2) * CELL], letter: li, k: k++ });
      });
    });
  });
  return out;
})();

// Temple: 3x3 base, 2x2, 1 on top
export const TEMPLE_SLOTS: V3[] = (() => {
  const out: V3[] = [];
  const s = 0.36;
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) out.push([TEMPLE[0] + i * s, BLOCK / 2, TEMPLE[2] + j * s]);
  for (const i of [-0.5, 0.5]) for (const j of [-0.5, 0.5]) out.push([TEMPLE[0] + i * s, BLOCK * 1.5, TEMPLE[2] + j * s]);
  out.push([TEMPLE[0], BLOCK * 2.5, TEMPLE[2]]);
  return out;
})();
export const templeLand = (i: number) => EV.temple0 + 0.3 + i * EV.templeStep;
export const TEMPLE_DONE = templeLand(TEMPLE_SLOTS.length - 1);

export const towerLand = (side: "L" | "R", i: number) =>
  EV.work + 0.3 + i * (side === "L" ? EV.leftStep : EV.rightStep);

// ── Eko's path ────────────────────────────────────────────────────────────
type Key = { t: number; p: V3; yaw?: number; circle?: boolean };
const FACE_CAM = -Math.PI / 2;
const MANDALA_R = 1.95;
export const MANDALA_END = EV.mandala0 + 8 * EV.mandalaStep + 0.1;

const KEYS: Key[] = [
  { t: 0, p: BEACH, yaw: FACE_CAM },
  { t: S.E2 + 0.2, p: BEACH, yaw: FACE_CAM },
  { t: S.E2 + 1.2, p: [3.2, 0, 2.2] },
  { t: S.E2 + 1.55, p: [3.2, 0, 2.2], yaw: 0.6 },
  { t: S.E2 + 2.4, p: [1.0, 0, -1.9] },
  { t: S.E2 + 2.65, p: [1.0, 0, -1.9], yaw: 2.2 },
  { t: S.E2 + 3.4, p: [-2.55, 0, -2.0] },
  { t: S.E2 + 3.95, p: [ROCK[0] + 0.05, ROCK_TOP, ROCK[2] + 0.1] },
  { t: EV.bowl - 0.75, p: [ROCK[0] + 0.05, ROCK_TOP, ROCK[2] + 0.1], yaw: FACE_CAM },
  { t: EV.bowl - 0.3, p: BOWL_FROM },
  { t: EV.bowl + 0.45, p: BOWL_FROM, yaw: Math.atan2(BOWL_FROM[2] - BOWL_TARGET[2], BOWL_TARGET[0] - BOWL_FROM[0]) },
  { t: EV.temple0 - 0.05, p: [-0.35, 0, -2.25] },
  { t: TEMPLE_DONE, p: [-0.35, 0, -2.25], yaw: Math.PI * 0.9 },
  { t: EV.mandala0 - 0.15, p: [MANDALA[0] + MANDALA_R, 0, MANDALA[2]] },
  { t: MANDALA_END, p: [MANDALA[0] + MANDALA_R, 0, MANDALA[2]], circle: true },
  { t: S.E4 + 0.3, p: [0.35, 0, 3.4] },
  { t: EV.lettersGlow + 0.1, p: [0.35, 0, 3.4], yaw: Math.PI },
  { t: S.E5 + 0.3, p: [0.35, 0, 3.4], yaw: FACE_CAM },
  { t: S.E5 + 1.7, p: THROW_SPOT },
  { t: S.E6 + 0.1, p: THROW_SPOT, yaw: 0 },
  { t: S.E6 + 0.9, p: EKO_GROUP_SPOT },
  { t: S.E7 + 0.05, p: EKO_GROUP_SPOT, yaw: Math.PI / 2 },
  { t: S.E7 + 0.55, p: [MANDALA[0], 0, MANDALA[2]] },
  { t: S.END, p: [MANDALA[0], 0, MANDALA[2]], yaw: FACE_CAM },
];

const dirYaw = (dx: number, dz: number) => Math.atan2(-dz, dx);

const rawState = (t: number): { p: V3; yaw: number; moving: number } => {
  if (t <= KEYS[0].t) return { p: KEYS[0].p, yaw: KEYS[0].yaw ?? 0, moving: 0 };
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (t > b.t) continue;
    const raw = clamp01((t - a.t) / (b.t - a.t));
    if (b.circle) {
      // one lap around the mandala, counter-clockwise seen from above
      const ang = raw * Math.PI * 2;
      const p: V3 = [MANDALA[0] + Math.cos(ang) * MANDALA_R, 0, MANDALA[2] + Math.sin(-ang) * MANDALA_R];
      return { p, yaw: dirYaw(-Math.sin(ang), -Math.cos(ang)), moving: 1 };
    }
    const dx = b.p[0] - a.p[0];
    const dz = b.p[2] - a.p[2];
    const dist = Math.hypot(dx, dz, b.p[1] - a.p[1]);
    if (dist < 1e-3) return { p: a.p, yaw: b.yaw ?? a.yaw ?? 0, moving: 0 };
    const p = EASE(raw);
    const pos: V3 = [lerp(a.p[0], b.p[0], p), lerp(a.p[1], b.p[1], p), lerp(a.p[2], b.p[2], p)];
    // climbing: rise late in the segment so it walks up the rock face
    if (b.p[1] > a.p[1]) pos[1] = lerp(a.p[1], b.p[1], EASE_IN(raw));
    return { p: pos, yaw: Math.hypot(dx, dz) > 1e-3 ? dirYaw(dx, dz) : (a.yaw ?? 0), moving: Math.sin(Math.PI * raw) > 0.05 ? 1 : 0 };
  }
  const k = KEYS[KEYS.length - 1];
  return { p: k.p, yaw: k.yaw ?? 0, moving: 0 };
};

/** Eko at time t: position, smoothed heading, walk amount, jump, claw raise, held block. */
export const ekoAt = (t: number) => {
  const st = rawState(t);
  // heading smoothed over the last 0.25 s (no snap turns)
  let sx = 0;
  let sz = 0;
  for (let k = 0; k < 6; k++) {
    const y = rawState(t - k * 0.05).yaw;
    sx += Math.cos(y);
    sz += Math.sin(y);
  }
  const yaw = Math.atan2(sz, sx);
  // walk amount: speed over the last frame
  const prev = rawState(t - 1 / 30).p;
  const speed = Math.hypot(st.p[0] - prev[0], st.p[2] - prev[2]) * 30;
  // the jump
  const jp = clamp01((t - EV.jump) / 0.85);
  const jumpY = jp > 0 && jp < 1 ? 1.35 * Math.sin(Math.PI * jp) : 0;
  const crouch = Math.max(
    Math.sin(Math.PI * clamp01((t - EV.jump + 0.18) / 0.2)) * (t < EV.jump ? 1 : 0),
    Math.sin(Math.PI * clamp01((t - EV.jump - 0.85) / 0.22)),
  );
  // claw raise: throws and block placing
  const throwPulse = (at: number, wind = 0.25, follow = 0.25) =>
    t < at - wind || t > at + follow ? 0 : t < at ? EASE_OUT((t - at + wind) / wind) : 1 - EASE((t - at) / follow);
  let claw = Math.max(throwPulse(EV.bowl, 0.3, 0.3), throwPulse(EV.throw1), throwPulse(EV.release, 0.3, 0.3));
  for (let i = 0; i < 14; i++) claw = Math.max(claw, 0.6 * throwPulse(templeLand(i) - 0.3, 0.06, 0.08));
  if (t > S.E7 + 0.6 && t < EV.morph) claw = Math.max(claw, 0.5 + 0.5 * Math.sin((t - S.E7) * 3)); // waves on the network
  const holding = (t > S.E5 + 1.5 && t < EV.throw1) || (t > EV.land1 + 0.25 && t < EV.release);
  // appear: materialise on the beach; leave: dissolve as the island sinks
  const appear = clamp01((t - EV.eko) / 0.6);
  const leave = clamp01((t - EV.morph - 0.1) / 0.6);
  return {
    p: [st.p[0], st.p[1] + jumpY, st.p[2]] as V3,
    yaw,
    walk: Math.min(1, speed / 2),
    speed,
    claw,
    crouch,
    holding,
    appear,
    leave,
  };
};

/** Claw tip of Eko (where held / thrown blocks start), island-local. */
export const clawTip = (t: number): V3 => {
  const e = ekoAt(t);
  const c = Math.cos(e.yaw);
  const s = Math.sin(e.yaw);
  const fx = 0.62 * EKO_SCALE;
  const up = (0.35 + 0.35 * e.claw) * EKO_SCALE;
  return [e.p[0] + c * fx, e.p[1] + up, e.p[2] - s * fx];
};

/** Ballistic arc from a to b over [t0, t1] with an extra apex height. */
export const arc = (a: V3, b: V3, t0: number, t1: number, h: number, t: number): V3 => {
  const p = clamp01((t - t0) / (t1 - t0));
  return [lerp(a[0], b[0], p), lerp(a[1], b[1], p) + h * 4 * p * (1 - p), lerp(a[2], b[2], p)];
};

/** The island sinking into the sea in E8. */
export const sinkY = (t: number) => -4.2 * EASE_IN(clamp01((t - EV.morph) / 1.1));
