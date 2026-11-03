import { GloboData } from "../theme";
import { GloboState } from "./Globo3D";
import { TOP_Y } from "./geometry";

export const WIDE = { dist: 17.6, elev: 0.035, ty: -0.42 };
// close shot of the crown: 2.7x closer than the wide shot (no extreme macro)
export const CLOSE = { dist: 6.5, elev: 0.26, ty: TOP_Y * 1.06 - 0.06 };
const FOV = 20;

export const camBetween = (mix: number, push: number) => {
  const dist = Math.exp(Math.log(WIDE.dist) + (Math.log(CLOSE.dist) - Math.log(WIDE.dist)) * mix) * (1 - push);
  return { dist, elev: WIDE.elev + (CLOSE.elev - WIDE.elev) * mix, az: 0, ty: WIDE.ty + (CLOSE.ty - WIDE.ty) * mix, fov: FOV };
};

/** World units per screen pixel at the camera's target distance. */
export const pxToWorld = (dist: number) => (2 * dist * Math.tan(((FOV / 2) * Math.PI) / 180)) / 1920;

/** Per-frame curve sampled at a fractional frame (linear between frames), for the motion-blur subframes. */
const at = (arr: number[], f: number) => {
  const i = Math.floor(f);
  const p = f - i;
  const a = arr[Math.min(arr.length - 1, Math.max(0, i))];
  const b = arr[Math.min(arr.length - 1, Math.max(0, i + 1))];
  return a + (b - a) * p;
};

/** Countdown state for (possibly fractional) frame f; everything is frozen from data.freeze on. */
export const countdownState = (data: GloboData, f: number): GloboState => {
  const fz = Math.min(Math.max(0, f), data.freeze);
  const t = fz / data.fps;
  const mix = at(data.camMix, fz);
  const cam = camBetween(mix, at(data.camPush, fz));
  const grow = Math.min(1, Math.max(0, (fz - 10) / 160));
  const bobAmp = 6 * Math.max(0, 1 - Math.max(0, fz - 10) / 30); // ±6 px, 0.4 Hz, settles once the needle moves
  const bob = Math.sin(2 * Math.PI * 0.4 * t) * bobAmp * pxToWorld(WIDE.dist);
  return {
    deform: { inflate: 0.06 * grow * grow * (3 - 2 * grow), dimple: data.dimpleDepth * at(data.dimple, fz), ripple: 0, ripplePhase: 0, bob },
    needleGap: data.gap0 * (1 - at(data.needle, fz)),
    needleShake: 0,
    needleOn: 1,
    cam,
    solid: 1, wire: 0, dense: 1, redraw: Infinity, grey: 0,
    floor: 1 - mix,
    shapes: 0,
    t,
  };
};
