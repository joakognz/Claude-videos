import { Easing } from "remotion";
import { EV, clamp01, lerp } from "./theme";

const DOLLY = Easing.bezier(0.33, 0.12, 0.25, 1);

export type V3 = [number, number, number];

type Pose = { target: V3; zoom: number; elev: number; off: number };

// One continuous dolly-in from high above the street to the working shot, then the camera stays locked.
const FAR: Pose = { target: [0, 0, 0], zoom: 38, elev: 62, off: 60 };
export const WORK: Pose = { target: [0, 1.0, 0], zoom: 118, elev: 35.3, off: 230 };

export const poseAt = (t: number): Pose => {
  const p = DOLLY(clamp01(t / EV.dolly));
  return {
    target: [lerp(FAR.target[0], WORK.target[0], p), lerp(FAR.target[1], WORK.target[1], p), lerp(FAR.target[2], WORK.target[2], p)],
    zoom: Math.exp(lerp(Math.log(FAR.zoom), Math.log(WORK.zoom), p)),
    elev: lerp(FAR.elev, WORK.elev, p),
    off: lerp(FAR.off, WORK.off, p),
  };
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
  const k = p.off / p.zoom;
  const T: V3 = [p.target[0] + up[0] * k, p.target[1] + up[1] * k, p.target[2] + up[2] * k];
  return { T, d, right, up, zoom: p.zoom };
};

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** World point → screen pixels (1080x1920). */
export const project = (p: V3, cam: Cam): [number, number] => {
  const v: V3 = [p[0] - cam.T[0], p[1] - cam.T[1], p[2] - cam.T[2]];
  return [540 + dot(v, cam.right) * cam.zoom, 960 - dot(v, cam.up) * cam.zoom];
};
