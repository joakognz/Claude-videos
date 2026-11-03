import { LapizData } from "../theme";
import { LapizState } from "./Lapices3D";

// wide: both pencils, three-quarter view · close: long-lens macro on the two graphite tips
export const WIDE = { dist: 9, elev: 0.1, az: 0.45, ty: -0.17, fov: 20 };
export const CLOSE = { dist: 3.3, elev: 0.07, az: 0.35, ty: -0.04, fov: 13 };

export const camBetween = (mix: number, push: number) => {
  const dist = Math.exp(Math.log(WIDE.dist) + (Math.log(CLOSE.dist) - Math.log(WIDE.dist)) * mix) * (1 - push);
  const lerp = (a: number, b: number) => a + (b - a) * mix;
  return { dist, elev: lerp(WIDE.elev, CLOSE.elev), az: lerp(WIDE.az, CLOSE.az), ty: lerp(WIDE.ty, CLOSE.ty), fov: lerp(WIDE.fov, CLOSE.fov) };
};

/** Per-frame curve sampled at a fractional frame (linear between frames), for the motion-blur subframes. */
const at = (arr: number[], f: number) => {
  const i = Math.floor(f);
  const p = f - i;
  const a = arr[Math.min(arr.length - 1, Math.max(0, i))];
  const b = arr[Math.min(arr.length - 1, Math.max(0, i + 1))];
  return a + (b - a) * p;
};

/** Countdown state for (possibly fractional) frame f; everything is frozen from data.freeze on. */
export const countdownState = (data: LapizData, f: number): LapizState => {
  const fz = Math.min(Math.max(0, f), data.freeze);
  return {
    gap: at(data.gap, fz),
    cam: camBetween(at(data.camMix, fz), at(data.camPush, fz)),
    solid: 1, wire: 0, redraw: Infinity, grey: 0, wireAlpha: 1, ripple: 0, ripplePhase: 0, gauge: 0,
    t: fz / data.fps,
  };
};
