import { L2W, V3 } from "../camera";
import { EASE, EASE_OUT, EV, S, TL, act, beat, clamp01, lerp, rand, springAt } from "../theme";

// Screen-local coordinates (see L2W): +x to the right of the screen, +z towards the camera, y up.
// The plaza floor is y = 0; the office floats above it, its floor at PLAT_Y.
export const PLAT_Y = 1.0;
export const PLAT_HALF = 3.7; // half side of the (world-axis) square platform: a diamond on screen
export const CTR: V3 = [0, 0, -0.35];
export const ORB_R = 2.85;
export const ORB_Y = PLAT_Y + 1.35;
export const ORB_SIZE = [0.5, 0.4, 0.56, 0.46, 0.42];
export const DESK_R = 2.3;
export const TENT: V3 = [CTR[0], PLAT_Y + 3.35, CTR[2]];
export const HUMAN_DESK: V3 = [0, PLAT_Y, 3.85];
export const HUMAN_HOME: V3 = [0, PLAT_Y, 4.4];
export const HUMAN_EDGE: V3 = [3.75, PLAT_Y, 1.05];
export const HUMAN_CENTRE: V3 = [0, PLAT_Y, 2.55];
export const BOARD: V3 = [-1.85, PLAT_Y, -3.05];

const ang = (k: number) => Math.PI / 2 + (k * 2 * Math.PI) / 5;
export const orbHome = (k: number): V3 => [CTR[0] + ORB_R * Math.cos(ang(k)), ORB_Y, CTR[2] - ORB_R * Math.sin(ang(k))];
export const deskSpot = (k: number): V3 => [CTR[0] + DESK_R * Math.cos(ang(k)), PLAT_Y, CTR[2] - DESK_R * Math.sin(ang(k))];
/** Yaw that turns a desk (and its monitor) to face away from the centre, towards its orb. */
export const deskYaw = (k: number) => ang(k);

/** Each orb's light: dim and idle before the drop, lit and on the beat after it, out when the money runs out. */
export const orbGlow = (k: number, t: number) => {
  const idle = 0.16 + 0.05 * Math.sin(t * 1.3 + k * 1.9);
  const on = act(t);
  const lit = 1.05 + 0.55 * beat(t) + 0.12 * Math.sin(t * 5 + k);
  let g = lerp(idle, lit, on);
  // a media frase: flicker and drop when the credits run out
  const out = clamp01((t - EV.drain1 - 0.05 - k * 0.09) / 0.25);
  const flick = t > EV.drain1 - 0.4 && t < EV.drain1 + 0.4 ? 0.5 + 0.5 * Math.sign(Math.sin(t * 60 + k * 3)) : 1;
  g = lerp(g * flick, 0.3 + 0.05 * Math.sin(t * 2 + k), out);
  // "hasta morir": out one by one
  g = lerp(g, 0.1, clamp01((t - EV.die - k * 0.12) / 0.3));
  // the tokens bring them back, the cap keeps them steady
  const back = clamp01((t - EV.deal - 0.35 - k * 0.18) / 0.3);
  const steady = 0.75 + 0.35 * beat(t) * (1 - 0.6 * clamp01((t - EV.cap) / 0.3));
  g = lerp(g, steady, back);
  // a flash each time this orb sends a message
  for (const m of TL.msgs) {
    if (m.a !== k || m.t > t) continue;
    if (t - m.t < 0.3) g += 0.6 * (1 - (t - m.t) / 0.3);
  }
  return g;
};

/** Orb position (local): bobbing, leaning to the offsite bubble while they plan, sinking when they die. */
export const orbAt = (k: number, t: number): V3 => {
  const h = orbHome(k);
  const on = act(t);
  const bob = lerp(0.06 * Math.sin(t * 1.1 + k * 1.3), 0.1 * Math.sin(t * 3.2 + k * 1.3), on) + 0.09 * beat(t) * on;
  const lean = 0.42 * EASE(clamp01((t - EV.turn) / 0.8)) * (1 - EASE(clamp01((t - EV.drain1) / 0.8)));
  const sink = 0.5 * EASE(clamp01((t - EV.die - k * 0.12) / 0.6)) * (1 - EASE(clamp01((t - EV.deal - 0.35 - k * 0.18) / 0.5)));
  const pop = (springAt(t, EV.drop + k * 0.03, 9, 260) - 1) * 0.25 * (t > EV.drop ? 1 : 0);
  const dx = CTR[0] - h[0];
  const dz = CTR[2] - h[2];
  const dl = Math.hypot(dx, dz);
  return [h[0] + (dx / dl) * lean, h[1] + bob - sink + pop, h[2] + (dz / dl) * lean];
};
export const orbScale = (k: number, t: number) => ORB_SIZE[k] * (1 + 0.28 * Math.max(0, Math.sin(Math.PI * clamp01((t - EV.drop - k * 0.03) / 0.45))));

// ── the human ─────────────────────────────────────────────────────────────
type Key = { t: number; p: V3; yaw?: number };
const FACE_BACK = Math.PI / 2; // facing -z (towards the orbs)
const KEYS: Key[] = [
  { t: 0, p: HUMAN_HOME, yaw: FACE_BACK },
  { t: EV.walk, p: HUMAN_HOME, yaw: FACE_BACK },
  { t: EV.walk + 1.5, p: HUMAN_EDGE },
  { t: EV.walk + 1.9, p: HUMAN_EDGE, yaw: -0.35 }, // back to the room, looking out over the plaza
  { t: EV.back, p: HUMAN_EDGE, yaw: -0.35 },
  { t: EV.back + 1.5, p: HUMAN_CENTRE },
  { t: EV.back + 1.9, p: HUMAN_CENTRE, yaw: FACE_BACK },
  { t: S.END, p: HUMAN_CENTRE, yaw: FACE_BACK },
];
const dirYaw = (dx: number, dz: number) => Math.atan2(-dz, dx);

const rawHuman = (t: number): { p: V3; yaw: number } => {
  if (t <= KEYS[0].t) return { p: KEYS[0].p, yaw: KEYS[0].yaw ?? 0 };
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (t > b.t) continue;
    const raw = clamp01((t - a.t) / (b.t - a.t));
    const dx = b.p[0] - a.p[0];
    const dz = b.p[2] - a.p[2];
    if (Math.hypot(dx, dz) < 1e-3) return { p: a.p, yaw: lerpAngle(a.yaw ?? 0, b.yaw ?? a.yaw ?? 0, EASE(raw)) };
    const p = EASE(raw);
    return { p: [lerp(a.p[0], b.p[0], p), a.p[1], lerp(a.p[2], b.p[2], p)], yaw: dirYaw(dx, dz) };
  }
  const k = KEYS[KEYS.length - 1];
  return { p: k.p, yaw: k.yaw ?? 0 };
};

const lerpAngle = (a: number, b: number, p: number) => {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * p;
};

export const humanAt = (t: number) => {
  const st = rawHuman(t);
  let sx = 0;
  let sz = 0;
  for (let k = 0; k < 6; k++) {
    const y = rawHuman(t - k * 0.05).yaw;
    sx += Math.cos(y);
    sz += Math.sin(y);
  }
  const prev = rawHuman(t - 1 / 30).p;
  const speed = Math.hypot(st.p[0] - prev[0], st.p[2] - prev[2]) * 30;
  // arm up: dropping the bubble, and dealing the tokens
  const pulse = (at: number, len: number) => Math.sin(Math.PI * clamp01((t - at) / len));
  const arm = Math.max(pulse(EV.stand - 0.1, 0.8), pulse(EV.deal - 0.15, 1.2));
  return { p: st.p, yaw: Math.atan2(sz, sx), walk: Math.min(1, speed / 1.6), arm };
};

// ── messages (the orange chat bubbles) ────────────────────────────────────
export const FLIGHT = 0.75;
const TOWER_MSGS = TL.msgs.filter((m) => m.k === "tower");
export const towerIndex = (m: (typeof TL.msgs)[number]) => TOWER_MSGS.indexOf(m);
export const TOWER_N = TOWER_MSGS.length;
/** Spiral slot i of the message tower over the meeting table (local). */
export const towerSlot = (i: number): V3 => {
  const a = i * 0.85;
  const r = 1.15 - i * 0.03;
  return [CTR[0] + Math.cos(a) * r, PLAT_Y + 0.85 + i * (1.75 / Math.max(1, TOWER_N - 1)), CTR[2] + Math.sin(a) * r];
};

/** Top of an orb, where its bubbles leave from (world). */
export const orbTop = (k: number, t: number): V3 => {
  const p = orbAt(k, t);
  return L2W([p[0], p[1] + ORB_SIZE[k] + 0.25, p[2]]);
};

/** Ballistic arc a → b with an apex lift. */
export const arc = (a: V3, b: V3, p: number, h: number): V3 => [
  lerp(a[0], b[0], p), lerp(a[1], b[1], p) + h * 4 * p * (1 - p), lerp(a[2], b[2], p),
];

/** Motes drifting up around the office (local), faster once the music drops. */
export const MOTES = Array.from({ length: 70 }, (_, i) => ({
  x: (rand(i + 1) - 0.5) * 12, z: (rand(i + 2) - 0.5) * 12, ph: rand(i + 3), sp: 0.4 + rand(i + 4) * 0.6, s: 0.02 + rand(i + 5) * 0.03,
}));
/** Time-warp for the motes: slow before the drop, three times faster after it (continuous). */
export const moteClock = (t: number) => (t < EV.drop ? t * 0.08 : EV.drop * 0.08 + (t - EV.drop) * 0.3);

export const shockwave = (t: number) => EASE_OUT(clamp01((t - EV.drop) / 1.1));
