import partesJson from "../partes.json";
import { EASE, EASE_IN, EASE_OUT, ENGR, EV, S, TL, clamp01, ramp } from "../theme";
import { Orbit, V3, fromOrbit, mixOrbit, plateCam, toOrbit } from "./camara";
import { WireState } from "./Engranajes3D";

export const GLITCH_FRAMES = 6;
/** Plate (0) or wire (1) on each glitch frame from «existen». */
const GLITCH_SEQ = [1, 0, 1, 1, 0, 1];
const TRAVEL = 0.32; // reassembly: each part flies home in 0.32 s and lands on its syllable
const SPREAD = 1.5; // exploded distances × this (partes.json holds the minimum clear distances)

type Parte = { name: string; center: V3; dir: V3; dist: number };
export const PARTES = (partesJson as unknown as { parts: Parte[] }).parts;
const group = (name: string) => name.split("_")[0];

const FREEZE: Orbit = toOrbit(plateCam(ENGR, ENGR.freeze));
// exploded view: three-quarter, far enough back to hold both gears whole with their parts fanned out toward us
const OPEN: Orbit = { target: [0, -0.004, 0.009], dist: 0.26, az: 0.92, el: 0.24, fov: 15 };
// reassembled hero view
const HERO: Orbit = { target: [0, -0.0015, 0.004], dist: 0.17, az: 0.62, el: 0.2, fov: 15 };

export const wireCam = (t: number) => {
  const open = ramp(t, S.S3 - 0.1, S.S3 + 1.25, EASE);
  const drift = ramp(t, S.S3 + 1.25, S.S4 + 0.3, (x) => x);
  const back = ramp(t, S.S4 + 0.35, TL.reassemble[TL.reassemble.length - 1].t - 0.25, EASE);
  const push = ramp(t, TL.reassemble[TL.reassemble.length - 1].t, EV.sweep + 0.5, (x) => x);
  let o = mixOrbit(FREEZE, OPEN, open);
  o = { ...o, az: o.az + 0.1 * drift, el: o.el - 0.03 * drift };
  o = mixOrbit(o, HERO, back);
  o = { ...o, dist: o.dist * (1 - 0.06 * push), az: o.az - 0.05 * push };
  return fromOrbit(o);
};

/** How far each part group is out of place (0 home … 1 fully exploded), and the landing flash. */
export const groupState = (t: number) => {
  const out: Record<string, number> = {};
  const flash: Record<string, number> = {};
  for (const e of TL.explode) out[e.part] = ramp(t, e.t, e.t + e.d, EASE_OUT);
  for (const r of TL.reassemble) {
    if (t >= r.t - TRAVEL) out[r.part] = 1 - EASE_IN(clamp01((t - (r.t - TRAVEL)) / TRAVEL));
    if (t >= r.t) flash[r.part] = Math.exp(-(t - r.t) / 0.2);
  }
  return { out, flash };
};

/** Wireframe from «existen» to the sweep: glitch → frozen-frame wire → exploded view → reassembly on «encajen». */
export const wireState = (t: number, frame: number): WireState & { solid: number } => {
  const fNo = Math.round(EV.noExiste * 30);
  const g = frame - fNo;
  const wireNow = g < 0 ? 0 : g < GLITCH_FRAMES ? GLITCH_SEQ[g] : 1;
  const { out, flash } = groupState(t);
  const offsets: Record<string, V3> = {};
  for (const p of PARTES) {
    const k = (out[group(p.name)] ?? 0) * p.dist * SPREAD;
    offsets[p.name] = [p.dir[0] * k, p.dir[1] * k, p.dir[2] * k];
  }
  return {
    solid: 1 - wireNow,
    cam: wireCam(t),
    wire: wireNow,
    xray: 0.35 + 0.65 * ramp(t, S.S3, S.S3 + 0.6) * (1 - ramp(t, S.S4 + 0.5, S.S4 + 1.5)),
    pitch: ramp(t, S.S3 + 0.25, S.S3 + 0.7) * (1 - ramp(t, EV.waveTick - 0.95, EV.waveTick - 0.6)),
    offsets,
    flash,
  };
};

