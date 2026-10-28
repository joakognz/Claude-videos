import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";
import timelineJson from "./timeline.json";

// Google Fonts bundled locally
export const COND = "Barlow Condensed";
export const MONO = "JetBrains Mono";
export const LOGO_FONT = "Sora";
for (const w of [600, 700, 800]) {
  loadFont({ family: COND, url: staticFile(`fonts/barlow-condensed-latin-${w}-normal.woff2`), weight: String(w) });
}
for (const w of [500, 700]) {
  loadFont({ family: MONO, url: staticFile(`fonts/jetbrains-mono-latin-${w}-normal.woff2`), weight: String(w) });
}
loadFont({ family: LOGO_FONT, url: staticFile("fonts/Sora-latin.woff2"), weight: "700 800" });

export const C = {
  night: "#050506",
  b0: "#0A0A0A", // buildings
  b1: "#0F0F0F",
  b2: "#141414",
  street: "#08080A",
  walk: "#111113",
  grey0: "#3A3A3A", // ANTES
  grey1: "#474747",
  grey2: "#555555",
  orange: "#FF7A00", // DESPUÉS
  orangeHi: "#FFA040",
  orangeLo: "#C25A00",
  ink: "#0B0B0B",
  white: "#FFFFFF",
  cold: "#DCE6F2",
};

export type Word = { text: string; start: number; end: number; kind?: "neg" | "pos" | null };
export type Caption = { words: Word[]; start: number; end: number; small?: { text: string; start: number } | null };

export const TL = timelineJson as unknown as {
  fps: number;
  durationInFrames: number;
  scenes: Record<string, number>;
  captions: Record<string, Caption>;
  events: Record<string, number & number[]>;
  phrases: Record<string, [number, number]>;
  sfx: { t: number; type: string }[];
};

export const S = TL.scenes;
export const EV = TL.events as unknown as {
  ring: number[]; scribble: number[]; mobileBuzz: number[]; signFlash: number;
  phoneIn: number[]; phoneOut: number[]; msgIn: number; typing: number; autoReply: number; line: number;
  list: number[]; listOut: number; web: number; webOut: number; bubbles: number[]; core: number;
  grey: number; wave: number; confirm: number; notifs: number[]; counters: number[];
  bar: number; typeStart: number; typeEnd: number;
};
export const FPS = TL.fps;

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

/** Piecewise tween over [time, value] keys, eased per segment, clamped at both ends. */
export const tween = (t: number, keys: [number, number][], easing: (n: number) => number = EASE) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, va] = keys[i];
    const [b, vb] = keys[i + 1];
    if (t <= b) {
      const p = b === a ? 1 : easing((t - a) / (b - a));
      return va + (vb - va) * p;
    }
  }
  return keys[keys.length - 1][1];
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** Mix two #RRGGBB colours. */
export const mix = (a: string, b: string, p: number) => {
  const A = hex(a);
  const B = hex(b);
  const q = clamp01(p);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * q)).join(",")})`;
};

/** Deterministic pseudo-random in [0, 1). */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ── state of the business over time ─────────────────────────────────────
// orange: 0 = grey (no automation) · 1 = fully automated (after the wave in E11)
export const WAVE_DUR = 1.6;
// Hook: the reel opens on the business lit up (orange), then it powers down to grey before "Llamadas…".
export const INTRO_OFF = 2.2;
export const introAt = (t: number) => {
  if (t < INTRO_OFF) return 1;
  const p = (t - INTRO_OFF) / 0.35;
  if (p >= 1) return 0;
  const flicker = Math.sin(t * 70) > 0 ? 1 : 0.25;
  return (1 - p) * flicker;
};
export const afterAt = (t: number) => clamp01((t - S.E11 - 0.35) / 0.9);
export const orangeAt = (t: number) => Math.max(introAt(t), afterAt(t));

// Opening move: far → close over the first seconds, then the camera stays fixed.
export const CAM_END = 2.4;
const CAM_EASE = Easing.bezier(0.33, 0, 0.15, 1);
export const camScale = (t: number) => 0.42 + 0.58 * CAM_EASE(clamp01(t / CAM_END));
export const CAM_PIVOT: [number, number] = [540, 930];

/**
 * Single shop elements that light up before the full switch: 0 computer, 1 notebook, 2 landline, 3 counter.
 * They light with each item of the E6 list, go dark for the web (E7-E8), and light again with the core (E9).
 */
export const elemAt = (t: number, k: number) => {
  const a = windowed(t, EV.list[k] - 0.05, S.E7 - 0.1, 0.3, 0.3);
  const b = windowed(t, EV.core - 0.15 + k * 0.12, EV.grey, 0.3, 0.2);
  return Math.max(orangeAt(t), a, b);
};
/** Chaos (rings, notes, buzzing): E2 and the E10 flashback. */
export const chaosAt = (t: number) => Math.max(windowed(t, S.E2, S.E3 + 0.6, 0.4, 0.8), windowed(t, S.E10, S.E11 + 0.2, 0.25, 0.3));
