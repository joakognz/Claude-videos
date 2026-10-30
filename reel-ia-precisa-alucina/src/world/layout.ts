import { V3 } from "../camera";
import { EASE, EASE_OUT, EV, clamp01, rand, springAt } from "../theme";

// World = plaza coordinates: the grid runs along x and z, so the camera (azimuth 45°) sees it as a diamond.
export const PLAZA = 4.6; // half side of the paved square
export const TILE = 0.44;
export const PITCH = 0.52;
export const AISLE = 1.1; // the 10×10 grid is four 5×5 blocks around the plinth
export const GRID_Y = 0.45;
export const PLINTH_H = 1.25;
export const ORACLE_Y = 2.55;
export const ORACLE_R = 0.85;

/** Centre of grid line i (0–9) along an axis. */
export const lineAt = (i: number) => {
  const q = i < 5 ? -1 : 1;
  const j = i < 5 ? 4 - i : i - 5;
  return q * (AISLE / 2 + PITCH / 2 + j * PITCH);
};
export const GRID_HALF = lineAt(9) + TILE / 2;

// ── the 100 tiles: 67 right (in six waves), 24 invented, 9 left blank ──────
export type Tile = { i: number; r: number; c: number; p: V3; lit: number; fake: number; seed: number };
const WAVE_CUM = [8, 19, 33, 47, 58, 67];
export const NOSE_RC: [number, number] = [8, 6]; // the tile that tries to say "NO LO SÉ" (front, in view)

export const TILES: Tile[] = (() => {
  const all = Array.from({ length: 100 }, (_, i) => {
    const r = Math.floor(i / 10);
    const c = i % 10;
    return { i, r, c, p: [lineAt(c), GRID_Y, lineAt(r)] as V3, lit: Infinity, fake: Infinity, seed: i * 7.31 };
  });
  // misses: 33 tiles spread over the grid (the nose tile always among them)
  const byRand = [...all].sort((a, b) => rand(a.i + 101) - rand(b.i + 101));
  const nose = all[NOSE_RC[0] * 10 + NOSE_RC[1]];
  const misses = [nose, ...byRand.filter((x) => x !== nose).slice(0, 32)];
  const hits = all.filter((x) => !misses.includes(x));
  // the hits light up in waves from the oracle outwards
  const d = (x: Tile) => Math.hypot(x.p[0], x.p[2]) + rand(x.i + 7) * 0.9;
  hits.sort((a, b) => d(a) - d(b));
  hits.forEach((x, k) => {
    const w = WAVE_CUM.findIndex((n) => k < n);
    const prev = w ? WAVE_CUM[w - 1] : 0;
    x.lit = EV.wave0 + w * EV.waveStep + ((k - prev) / (WAVE_CUM[w] - prev)) * 0.28 - 0.05;
  });
  // 24 of the 33 misses fill with an invented answer (the nose tile first); 9 stay blank
  misses.slice(0, 24).forEach((x, k) => (x.fake = EV.fake0 + k * EV.fakeStep));
  return all;
})();
export const NOSE = TILES[NOSE_RC[0] * 10 + NOSE_RC[1]];

export const litCount = (t: number) => TILES.filter((x) => t >= x.lit).length;

/** Review line (scene 7): sweeps the grid front-left → back-right; returns its x+z coordinate. */
export const scanAt = (t: number) => -GRID_HALF * 2.4 + EASE(clamp01((t - EV.scan) / EV.scanDur)) * GRID_HALF * 4.8;
export const scanned = (p: V3, t: number) => t > EV.scan && scanAt(t) > p[0] + p[2];

// ── the oracle ────────────────────────────────────────────────────────────

/** Motion clock of the oracle: runs, stops dead while it "doesn't know", restarts with the invented answers. */
export const oracleClock = (t: number) => {
  if (t < EV.freeze) return t;
  const stopped = EV.freeze + 0.25 * (1 - Math.exp(-(Math.min(t, EV.fake0) - EV.freeze) / 0.25));
  return t < EV.fake0 ? stopped : stopped + (t - EV.fake0);
};
export const oracleSpin = (t: number) => oracleClock(t) * 0.35;
/** 1 while frozen. */
export const frozen = (t: number) => clamp01((t - EV.freeze) / 0.35) * (1 - clamp01((t - EV.fake0) / 0.15));

/** The split: halves part along the screen's horizontal. */
export const splitAmt = (t: number) => Math.max(0, springAt(t, EV.split, 9, 120));

/** Plaza lights dim before the call to action. */
export const darkAt = (t: number) => EASE(clamp01((t - EV.dark) / 0.6));

/** The main set (grid, plinth, oracle) steps back while the other models are on stage. */
export const mainScale = (t: number) => {
  const out = EASE(clamp01((t - EV.orbs + 0.2) / 0.6));
  const back = EASE_OUT(clamp01((t - (EV.split - 0.55)) / 0.5));
  return 1 - 0.28 * out * (1 - back);
};

// ── the other models (scene 5) ─────────────────────────────────────────────
// Four smaller orbs, each over its own 10×10 grid with more invented tiles than the oracle (no names, no logos).
export type Mini = { p: V3; lit: number[]; fake: number[]; k: number };
export const MINI_TILE = 0.15;
export const MINI_PITCH = 0.19;
const MINI_FAKES = [36, 41, 31, 45];
export const MINIS: Mini[] = ([[-5.05, 1.6, 0.05], [0.05, 1.6, -5.05], [0.15, 0.45, 5.25], [5.25, 0.45, 0.15]] as V3[]).map((p, k) => {
  const order = Array.from({ length: 100 }, (_, i) => i).sort((a, b) => rand(a + 300 + k * 100) - rand(b + 300 + k * 100));
  const fake = order.slice(0, MINI_FAKES[k]);
  const blank = order.slice(MINI_FAKES[k], MINI_FAKES[k] + 6);
  const lit = order.filter((i) => !fake.includes(i) && !blank.includes(i));
  return { p, lit, fake, k };
});
export const miniIn = (t: number, k: number) => Math.max(0, springAt(t, EV.orbs + k * EV.orbStep, 11, 140));
export const miniOut = (t: number) => EASE(clamp01((t - (EV.split - 0.6)) / 0.5));
/** When mini tile `j` (index in the fake list) starts inventing. */
export const miniFakeAt = (k: number, j: number, n: number) => EV.orbFake + k * 0.08 + (j / n) * (EV.hit2 - EV.orbFake - 0.3);
