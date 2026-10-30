import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";
import timelineJson from "./timeline.json";

// Fonts bundled locally (the render browser can't reach Google Fonts)
export const TITLE = "Sora";
export const MONO = "JetBrains Mono";
export const UI = "Inter";
loadFont({ family: TITLE, url: staticFile("fonts/Sora-latin.woff2"), weight: "700 800" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: UI, url: staticFile("fonts/inter-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: UI, url: staticFile("fonts/inter-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: UI, url: staticFile("fonts/inter-latin-700-normal.woff2"), weight: "700" });

// Strict palette: warm dark background, orange for everything that is AI, cream for blocks and objects
export const C = {
  orange: "#FF6B1A",
  orangeSoft: "#FFB066",
  cream: "#FFF4EC",
  ink: "#14110F",
  sea: "#0E0C0B",
  sea2: "#1A1613",
  sand: "#2A211B",
  white: "#FFFFFF",
};

export type Chunk = { text: string; t: number; hl: "o" | null };
export type Caption = {
  chunks: Chunk[]; start: number; end: number;
  micro?: [string, number][]; microEnd?: number; sub?: [string, number][];
};

export const TL = timelineJson as unknown as {
  fps: number;
  durationInFrames: number;
  scenes: Record<string, number>;
  captions: Record<string, Caption>;
  cta: { comenta: number; keyword: number };
  ev: Record<string, number>;
  sfx: { t: number; type: string }[];
};

export const S = TL.scenes as {
  E1: number; E2: number; E3: number; E4: number; E5: number; E6: number; E7: number; E8: number; E9: number; E10: number;
  E11: number; END: number;
};
export const EV = TL.ev as {
  dolly: number; lupa: number; layers: number; sign: number; logIn: number; underline1: number; stamp: number; underline2: number;
  logOut: number; packet: number; hit: number; tagFall: number; tagEntry: number; restore: number; notches: number; notchStep: number;
  doubt: number; orbA: number; found: number; orbB: number; missed: number; cracks: number; crackStep: number; balance: number;
  morph: number; scan: number; findings: number; findStep: number; review: number; reviewStep: number; dark: number;
  typeStart: number; typeStep: number;
};
export const FPS = TL.fps;
export const TOTAL = TL.durationInFrames / FPS;

export const EASE = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** 0 → 1 between a and b, eased. */
export const ramp = (t: number, a: number, b: number, easing: (n: number) => number = EASE) =>
  easing(clamp01((t - a) / (b - a)));

/** Smooth window: 0 before a, ramps to 1 over fadeIn, holds, ramps to 0 ending at b. */
export const windowed = (t: number, a: number, b: number, fadeIn = 0.3, fadeOut = 0.3) =>
  Math.min(EASE_OUT(clamp01((t - a) / fadeIn)), EASE(clamp01((b - t) / fadeOut)));

/** Damped spring 0 → 1 (with overshoot) starting at `at`. */
export const springAt = (t: number, at: number, damping = 12, stiffness = 170) => {
  const x = t - at;
  if (x <= 0) return 0;
  const w = Math.sqrt(stiffness);
  const z = Math.min(0.99, damping / (2 * w));
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + (z * w / wd) * Math.sin(wd * x));
};

/** Continuous gentle drift so nothing ever stands still. */
export const drift = (t: number, seed: number, amp = 1) =>
  amp * (Math.sin(t * 0.9 + seed * 1.7) * 0.6 + Math.sin(t * 0.37 + seed * 3.1) * 0.4);

/** Deterministic pseudo-random in [0, 1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
