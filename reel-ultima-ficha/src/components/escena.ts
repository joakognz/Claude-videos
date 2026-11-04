import { EASE, EASE_OUT, EV, FICHAS, S, TL, clamp01, ramp } from "../theme";
import { Cam, Orbit, fromOrbit, mixOrbit, plateCam, tiltsAt, toOrbit } from "./camara";

export const GLITCH_FRAMES = 6;
/** Photo (0) or wire (1) for the last tile on each glitch frame from «existe». */
const GLITCH_SEQ = [1, 0, 1, 1, 0, 1];
export const N = FICHAS.N;
export const HERO = N - 1;


const FREEZE: Orbit = toOrbit(plateCam(FICHAS, FICHAS.freeze));
// S3: pulled back, up and round to three-quarters: the whole curve of the chain from above
const T36 = FICHAS.tiles[36].c;
const OPEN: Orbit = { target: [T36[0], 0.015, T36[2]], dist: 1.3, az: 0.25, el: 0.4, fov: 20 };
// S4: lower and closer on the end of the chain, where the last tile will finally fall
const END: Orbit = { target: [T36[0] + 0.012, 0.015, T36[2] + 0.012], dist: 1.12, az: 0.38, el: 0.36, fov: 20 };

export const wireCam = (t: number): Cam => {
  const open = ramp(t, EV.todo - 0.05, EV.ordenador + 0.5, EASE);
  const drift = ramp(t, EV.ordenador + 0.5, EV.fall1, (x) => x);
  const close = ramp(t, EV.fall1 - 0.2, EV.solas - 0.25, EASE);
  const after = ramp(t, EV.solas - 0.25, S.S5 + 0.6, (x) => x);
  let o = mixOrbit(FREEZE, OPEN, open);
  o = { ...o, az: o.az + 0.12 * drift };
  o = mixOrbit(o, END, close);
  o = { ...o, az: o.az + 0.08 * after, dist: o.dist * (1 - 0.06 * after) };
  return fromOrbit(o);
};

/** Real simulation time shown by the wire chain on a frame (held, rewound, falling again, landing). */
export const wireTau = (frame: number) => {
  const W = TL.wireClock;
  const i = Math.min(W.tau.length - 1, Math.max(0, Math.round(frame) - W.f0));
  return W.tau[i];
};

export type Escena = {
  cam: Cam;
  tilts: number[];
  tau: number;
  wire: number; // tile edges
  overlay: { hero: number; tiles: number; table: number; all: number } | null; // photo reveal (S2)
  grid: number; // table structure
  sound: { show: number; draw: number }; // the clac as a 3D spectrogram
  land: number; // glow when the last tile lands (S4)
};

/** Everything the three.js layer needs on a frame from «existe» to the 2D sweep. */
export const escena = (t: number, frame: number): Escena => {
  const fNo = Math.round(EV.noExiste * 30);
  const g = frame - fNo;
  const hero = g < 0 ? 0 : g < GLITCH_FRAMES ? GLITCH_SEQ[g] : 1;
  const tau = wireTau(frame);
  return {
    cam: wireCam(t),
    tilts: tiltsAt(tau),
    tau,
    wire: 1,
    overlay: t < S.S3 + 0.25
      ? {
        hero,
        tiles: ramp(t, EV.fichas, EV.fichas + 0.7, EASE),
        table: ramp(t, EV.mesa, EV.mesa + 0.75, EASE),
        all: ramp(t, S.S3 - 0.05, S.S3 + 0.25),
      }
      : null,
    grid: ramp(t, EV.mesa, EV.mesa + 0.2) * (1 - ramp(t, EV.rew0 - 0.1, EV.rew0 + 0.5)),
    sound: {
      show: ramp(t, EV.sonido, EV.sonido + 0.25, EASE_OUT) * (1 - ramp(t, EV.todo + 0.4, EV.calculado + 0.4)),
      draw: clamp01((t - EV.clacEcho) / 0.32),
    },
    land: t >= EV.land ? Math.exp(-(t - EV.land) / 0.25) : 0,
  };
};
