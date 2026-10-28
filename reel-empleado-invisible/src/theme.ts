import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

// Google Fonts bundled locally
export const SANS = "Sora";
export const MONO = "JetBrains Mono";
loadFont({ family: SANS, url: staticFile("fonts/Sora-latin.woff2"), weight: "100 800" });
for (const w of [500, 700]) {
  loadFont({ family: MONO, url: staticFile(`fonts/jetbrains-mono-latin-${w}-normal.woff2`), weight: String(w) });
}

export const C = {
  night: "#070605",
  b0: "#0E0C0B", // buildings: warm near-black
  b1: "#14110F",
  b2: "#1A1613",
  street: "#090807",
  walk: "#12100E",
  red0: "#5A0F0F", // ANTES: dark red, matte, never emits light
  red1: "#6A1212",
  red2: "#7A1414",
  orange: "#FF6B1A", // DESPUÉS: always emissive
  orangeHi: "#FFB066",
  orangeLo: "#D9530C",
  ink: "#14110F",
  cream: "#FFF4EC", // owner
  client: "#C9C7C5", // customers
  white: "#FFFFFF",
  lamp: "#FFF1DC",
};

export const FPS = 30;
export const DURATION = 45;

// ── scenes (seconds) ─────────────────────────────────────────────────────
export const S = { E1: 0, E2: 4, E3: 10, E4: 14, E5: 19, E6: 27, E7: 33, E8: 38, E9: 42.5, END: DURATION };

// ── events (seconds) ─────────────────────────────────────────────────────
export const EV = {
  // E2 chaos
  ring: [4.5, 6.9, 8.6],
  scribble: [4.9, 5.6, 6.3, 7.2, 7.9, 8.8],
  chatIn: [5.2, 6.4, 7.7],
  // E3
  chatClear: 10.0,
  // E4 the invisible employee
  ghostIn: 14.25,
  split: 16.0,
  ghostLabels: 17.0,
  ghostLabelsOut: 18.75,
  // E5 tasks: tag appears, then its check lights a part of the shop
  tag: [19.4, 21.2, 23.0, 24.8],
  check: [20.2, 22.0, 23.8, 25.6],
  tagsOut: 26.55,
  msgIn: 19.95,
  typing: 20.35,
  reply: 20.8,
  msgOk: 21.8,
  confirm: 22.6,
  notifs: [23.9, 25.6],
  // E6 comparison cards
  cardRed: 27.2,
  cardOrange: 27.65,
  redOff: 30.3,
  orangeOn: 30.75,
  cardsOut: 32.7,
  // E7 all on
  allOn: 33.0,
  counters: [34.0, 34.6],
  // E8 CTA
  bar: 38.35,
  typeStart: 39.0,
  typeEnd: 40.3,
  // the white phone mockup, always bottom-right: [in, out]
  phone: [[4.7, 10.55], [19.25, 26.15], [33.7, 37.95]] as [number, number][],
};

export const EASE = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** 0 before a, eases to 1 over `d` seconds. */
export const rise = (t: number, a: number, d = 0.4, e = EASE_OUT) => e(clamp01((t - a) / d));

/** Smooth window: 0 before a, ramps to 1 over fadeIn, holds, ramps to 0 ending at b. */
export const windowed = (t: number, a: number, b: number, fadeIn = 0.3, fadeOut = 0.3) =>
  Math.min(EASE_OUT(clamp01((t - a) / fadeIn)), EASE(clamp01((b - t) / fadeOut)));

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** Mix two #RRGGBB colours. */
export const mix = (a: string, b: string, p: number) => {
  const A = hex(a);
  const B = hex(b);
  const q = clamp01(p);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * q).toString(16).padStart(2, "0")).join("");
};

/** Deterministic pseudo-random in [0, 1). */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Switch-on curve for a shop part: 0 (dark red, matte) → 1 (orange, emissive) in ~0.3 s with a
 * short neon-style stutter, so the two states never sit half-mixed on screen.
 */
export const switchOn = (t: number, a: number) => {
  const p = (t - a) / 0.32;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const stutter = p < 0.55 ? (Math.sin(p * 40) > 0 ? 1 : 0.15) : 1;
  return EASE_OUT(p) * stutter;
};

// ── state of the business over time ─────────────────────────────────────
/** Whole shop: dark red until E7, then orange for good. */
export const orangeAt = (t: number) => switchOn(t, EV.allOn);
/** Single parts lit by each task's check in E5: 0 computer, 1 notebook, 2 landline, 3 counter. */
export const partAt = (t: number, k: number) => Math.max(orangeAt(t), switchOn(t, EV.check[k]));
/** Chaos (rings, notes, unread messages): E2. */
export const chaosAt = (t: number) => windowed(t, S.E2, S.E3 + 0.3, 0.4, 0.6);
/** E8: the city dims around the shop so it reads as a lighthouse. */
export const beaconAt = (t: number) => rise(t, S.E8 + 0.2, 1.4, EASE);

// ── camera: one far → close dolly over 0-4 s, then locked ───────────────
export const CAM_END = 4;
export const CAM_FROM = 0.17;
const CAM_EASE = Easing.bezier(0.45, 0, 0.2, 1);
/** Scale interpolated in log space so the push-in feels continuous from the air to the street. */
export const camScale = (t: number) => Math.exp(Math.log(CAM_FROM) * (1 - CAM_EASE(clamp01(t / CAM_END))));
export const CAM_PIVOT: [number, number] = [540, 930];
