import { EASE, S, clamp01, drift, lerp } from "./theme";

export type V3 = [number, number, number];

// Shop layout (world units). Grey = Peluquería 1 (no system), orange = Peluquería 2 (with system).
export const SHOP_W = 4.4;
export const SHOP_D = 3.6;
export const SHOP_H = 2.5;
export const GREY_C: V3 = [-2.6, 0, -2.0];
export const ORANGE_C: V3 = [2.6, 0, -2.0];
export const at = (c: V3, x: number, y: number, z: number): V3 => [c[0] + x, c[1] + y, c[2] + z];

// Interior layout, in shop-local coordinates (same for both shops: same services)
export const CHAIRS: [number, number][] = [[-1.3, -0.85], [0, -0.85], [1.3, -0.85]];
export const SIGN_Y = SHOP_H + 0.42;

type Pose = { target: V3; zoom: number; elev: number; off: number };

const P = {
  city: { target: [0, 0, -5], zoom: 13, elev: 56, off: 0 },
  both: { target: [0, 0.9, -2.0], zoom: 98, elev: 35.3, off: 250 },
  both2: { target: [0.25, 0.9, -2.1], zoom: 105, elev: 35.3, off: 250 },
  orange: { target: at(ORANGE_C, 0, 1.0, 0.1), zoom: 160, elev: 35.3, off: 190 },
  orange2: { target: at(ORANGE_C, 0.1, 1.0, 0.0), zoom: 170, elev: 35.3, off: 190 },
  chairs: { target: at(ORANGE_C, 0.05, 0.9, -0.55), zoom: 214, elev: 35.3, off: 200 },
  chairs2: { target: at(ORANGE_C, 0.25, 0.9, -0.6), zoom: 232, elev: 35.3, off: 200 },
  grey: { target: at(GREY_C, -0.85, 0.9, 0.5), zoom: 232, elev: 35.3, off: 230 },
  grey2: { target: at(GREY_C, -0.95, 0.9, 0.6), zoom: 262, elev: 35.3, off: 230 },
  cityEnd: { target: [0.6, 0, -3], zoom: 19, elev: 52, off: 60 },
  cityEnd2: { target: [0.6, 0, -3], zoom: 16, elev: 54, off: 60 },
} satisfies Record<string, Pose>;

// [time, pose]; between keys the pose is eased (zoom in log space)
const KEYS: [number, Pose][] = [
  [0, P.city],
  [2.9, P.both],
  [S.E4, P.both2],
  [S.E4 + 1.25, P.orange],
  [S.E7, P.orange2],
  [S.E7 + 1.0, P.chairs],
  [S.E12 + 0.2, P.chairs2],
  [S.E13 - 0.05, P.grey],
  [S.E15, P.grey2],
  [S.E16 - 0.15, P.cityEnd],
  [S.END, P.cityEnd2],
];

const lerpPose = (a: Pose, b: Pose, p: number): Pose => ({
  target: [lerp(a.target[0], b.target[0], p), lerp(a.target[1], b.target[1], p), lerp(a.target[2], b.target[2], p)],
  zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), p)),
  elev: lerp(a.elev, b.elev, p),
  off: lerp(a.off, b.off, p),
});

// segments that are slow drifts use a gentler curve than the camera moves
const DRIFTS = new Set([1, 3, 5, 7, 9]);
const TRAVEL = 6; // orange → grey: lateral travel with a zoom-out dip

export const poseAt = (t: number): Pose => {
  if (t <= KEYS[0][0]) return KEYS[0][1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [ta, a] = KEYS[i];
    const [tb, b] = KEYS[i + 1];
    if (t <= tb) {
      const raw = clamp01((t - ta) / (tb - ta));
      let p: number;
      if (i === 0) p = 1 - Math.pow(1 - EASE(raw), 1.6); // aerial dive: fast start, long settle
      else if (DRIFTS.has(i)) p = raw * (0.85 + 0.15 * raw);
      else p = EASE(raw);
      const pose = lerpPose(a, b, p);
      if (i === TRAVEL) pose.zoom *= 1 - 0.32 * Math.sin(Math.PI * p);
      return pose;
    }
  }
  return KEYS[KEYS.length - 1][1];
};

export type Cam = { T: V3; d: V3; right: V3; up: V3; zoom: number };

/** Camera basis at time t: azimuth 45° (looking from +x +z), elevation from the pose. */
export const camAt = (t: number): Cam => {
  const p = poseAt(t);
  const e = (p.elev * Math.PI) / 180;
  const c = Math.cos(e);
  const s = Math.sin(e);
  const r2 = Math.SQRT1_2;
  const d: V3 = [c * r2, s, c * r2];
  const right: V3 = [r2, 0, -r2];
  const up: V3 = [-s * r2, c, -s * r2];
  // handheld-free micro drift so the frame breathes
  const dx = drift(t, 3, 0.05);
  const dz = drift(t, 7, 0.05);
  const k = p.off / p.zoom;
  const T: V3 = [p.target[0] + dx + up[0] * k, p.target[1] + up[1] * k, p.target[2] + dz + up[2] * k];
  return { T, d, right, up, zoom: p.zoom };
};

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** World point → screen pixels (1080x1920). */
export const project = (p: V3, cam: Cam): [number, number] => {
  const v: V3 = [p[0] - cam.T[0], p[1] - cam.T[1], p[2] - cam.T[2]];
  return [540 + dot(v, cam.right) * cam.zoom, 960 - dot(v, cam.up) * cam.zoom];
};
