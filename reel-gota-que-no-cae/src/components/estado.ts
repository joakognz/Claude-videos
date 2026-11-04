import { EASE, EASE_IN, EASE_OUT, EV, GOTA, S, clamp01, ramp } from "../theme";
import { Cam, Orbit, V3, fromOrbit, mixOrbit, plateCam, toOrbit } from "./camara";

export const GLITCH_FRAMES = 6;
/** Plate (0) or wire (1) on each glitch frame from «existe». */
const GLITCH_SEQ = [1, 0, 1, 1, 0, 1];
export const DIM = 0.1;

/** Wire state for one frame (three.js axes, metres). */
export type WireState = {
  cam: Cam;
  wire: number; // 0 plate … 1 wire
  solid: number; // plate visible underneath (glitch frames)
  agua: number; // per-element brightness (1 lit, DIM switched off)
  grifo: number;
  reflejo: number;
  gota: number;
  flash: Record<string, number>; // brief over-bright on switching off / relighting
  dropDy: number; // the drop's fall after «mirarla» (m, negative = down)
  dropSquash: number; // 1 … 0 as it merges into the water
  satDy: number;
  satSquash: number;
  impactT: number; // s since the drop hit the water (−1 before)
  satImpactT: number;
};

const FREEZE: Orbit = toOrbit(plateCam(GOTA, GOTA.freeze));
// «ni el grifo»: pull back and tilt up until the tap's mouth is in shot
const PULL: Orbit = { target: [0, 0.0072, 0], dist: 0.27, az: FREEZE.az, el: 0.11, fov: FREEZE.fov };
// «Todo eso lo ha calculado un ordenador»: further back and round to three-quarters, from above
const OPEN: Orbit = { target: [0, 0.008, 0.0], dist: 0.29, az: 0.82, el: 0.36, fov: FREEZE.fov };
// «Y aun así, no podías dejar de mirarla»: down to the water, close, the drop over its grid
const LOW: Orbit = { target: [0, 0.0045, 0], dist: 0.155, az: 0.4, el: 0.13, fov: FREEZE.fov };

export const wireCam = (t: number): Cam => {
  const pull = ramp(t, EV.noExiste + 0.3, EV.offGrifo - 0.1, EASE);
  const open = ramp(t, S.S3 - 0.05, S.S3 + 1.35, EASE);
  const drift = ramp(t, S.S3 + 1.35, S.S4, (x) => x);
  const low = ramp(t, S.S4 - 0.05, EV.resume - 0.15, EASE);
  const push = ramp(t, EV.resume - 0.15, EV.sweep + 0.5, (x) => x);
  let o = mixOrbit(FREEZE, PULL, pull);
  o = mixOrbit(o, OPEN, open);
  o = { ...o, az: o.az + 0.12 * drift, el: o.el - 0.03 * drift };
  o = mixOrbit(o, LOW, low);
  o = { ...o, dist: o.dist * (1 - 0.08 * push), az: o.az + 0.06 * push };
  return fromOrbit(o);
};

const offOn = (t: number, off: number) => {
  const dim = ramp(t, off, off + 0.25, EASE_OUT);
  const back = ramp(t, EV.relight, EV.relight + 0.45, EASE);
  return 1 - (1 - DIM) * dim * (1 - back);
};
const flashAt = (t: number, at: number, len = 0.22) => (t >= at && t < at + 2 * len ? Math.exp(-(t - at) / len) : 0);

export const wireState = (t: number, frame: number): WireState => {
  const fNo = Math.round(EV.noExiste * 30);
  const g = frame - fNo;
  const wireNow = g < 0 ? 0 : g < GLITCH_FRAMES ? GLITCH_SEQ[g] : 1;
  // after «mirarla» the clock runs again: 1 mm to the water in a smooth gravity arc, then it merges
  const fallP = clamp01((t - EV.resume) / (EV.impact - EV.resume));
  const gapM = GOTA.dropBottom - GOTA.underFreeze;
  const dropDy = t < EV.resume ? 0 : -gapM * fallP * fallP - (t > EV.impact ? 0.0035 * EASE_IN(clamp01((t - EV.impact) / 0.18)) : 0);
  const dropSquash = 1 - EASE_OUT(clamp01((t - EV.impact) / 0.16));
  const satP = clamp01((t - EV.resume) / (EV.satImpact - EV.resume));
  const satDy = t < EV.resume ? 0 : -(GOTA.satZ - GOTA.satR) * satP * satP;
  const satSquash = 1 - clamp01((t - EV.satImpact) / 0.08);
  return {
    cam: wireCam(t),
    wire: wireNow,
    solid: 1 - wireNow,
    agua: offOn(t, EV.offAgua),
    grifo: offOn(t, EV.offGrifo),
    reflejo: offOn(t, EV.offReflejo),
    gota: 1,
    flash: {
      agua: flashAt(t, EV.offAgua) + 0.6 * flashAt(t, EV.relight, 0.3) + flashAt(t, EV.impact, 0.3),
      grifo: flashAt(t, EV.offGrifo) + 0.6 * flashAt(t, EV.relight + 0.08, 0.3),
      reflejo: flashAt(t, EV.offReflejo) + 0.6 * flashAt(t, EV.relight + 0.16, 0.3),
      gota: flashAt(t, EV.ann3, 0.25) + flashAt(t, EV.resume, 0.3),
    },
    dropDy,
    dropSquash,
    satDy,
    satSquash,
    impactT: t >= EV.impact ? t - EV.impact : -1,
    satImpactT: t >= EV.satImpact ? t - EV.satImpact : -1,
  };
};

/** World anchors on the freeze pose (three axes), for the 2D overlays. */
export const ANCHOR = {
  dropBottom: [0, GOTA.dropBottom, 0] as V3,
  water: [0, GOTA.underFreeze, 0] as V3,
};
export const easeLin = (x: number) => x;
export { EASE_IN };
