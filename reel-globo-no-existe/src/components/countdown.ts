import { GloboData, rand } from "../theme";
import { GloboState } from "./Globo3D";
import { TOP_Y } from "./geometry";

export const GAP0 = 0.5; // needle tip height above the crown at frame 0 (world units)
export const DIMPLE = 0.16; // dimple depth at the freeze
export const WIDE = { dist: 17.6, elev: 0.035, ty: -0.42 };
export const MACRO = { dist: 3.0, elev: 0.3, ty: TOP_Y + 0.03 };
const FOV = 20;

export const camBetween = (mix: number, push: number) => {
  const dist = Math.exp(Math.log(WIDE.dist) + (Math.log(MACRO.dist) - Math.log(WIDE.dist)) * mix) * (1 - push);
  return { dist, elev: WIDE.elev + (MACRO.elev - WIDE.elev) * mix, az: 0, ty: WIDE.ty + (MACRO.ty - WIDE.ty) * mix, fov: FOV };
};

/** World units per screen pixel at the camera's target distance. */
export const pxToWorld = (dist: number) => (2 * dist * Math.tan(((FOV / 2) * Math.PI) / 180)) / 1920;

/** Countdown state for frame f (everything is frozen from data.freeze on). */
export const countdownState = (data: GloboData, f: number): GloboState => {
  const fz = Math.min(Math.max(0, f), data.freeze);
  const t = fz / data.fps;
  const cam = camBetween(data.camMix[fz], data.camPush[fz]);
  const grow = Math.min(1, Math.max(0, (fz - 10) / 160));
  const bobAmp = 6 * Math.max(0, 1 - Math.max(0, fz - 10) / 30); // ±6 px, 0.4 Hz, settles once the needle moves
  const bob = Math.sin(2 * Math.PI * 0.4 * t) * bobAmp * pxToWorld(WIDE.dist);
  const shake = data.vib[fz] ? (rand(fz * 3.1) < 0.5 ? -1 : 1) * pxToWorld(cam.dist) : 0;
  return {
    deform: { inflate: 0.06 * grow * grow * (3 - 2 * grow), dimple: DIMPLE * data.dimple[fz], ripple: 0, ripplePhase: 0, bob },
    needleGap: GAP0 * (1 - data.needle[fz]),
    needleShake: shake,
    needleOn: 1,
    cam,
    solid: 1, wire: 0, dense: 1, redraw: Infinity, grey: 0,
    floor: 1 - data.camMix[fz],
    shapes: 0,
    t,
  };
};
