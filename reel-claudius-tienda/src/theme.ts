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

// Strict palette: warm dark background, orange for everything that is AI, cream for objects
export const C = {
  orange: "#FF6B1A",
  orangeSoft: "#FFB066",
  cream: "#FFF4EC",
  ink: "#14110F",
  bg: "#0E0C0B",
  bg2: "#1A1613",
  floor: "#2A211B",
  white: "#FFFFFF",
};

export type Chunk = { text: string; t: number; hl: "o" | null; br?: boolean };
export type Caption = {
  chunks: Chunk[]; start: number; end: number;
  micro?: [string, number][]; microEnd?: number; sub?: [string, number][];
};

export const TL = timelineJson as unknown as {
  fps: number;
  durationInFrames: number;
  scenes: Record<string, number>;
  captions: Record<string, Caption>;
  cta: { comenta: number; keyword: number; revisa: number; tuia: number; sin: number };
  ev: Record<string, number>;
  sfx: { t: number; type: string }[];
};

type SceneKey = "E1" | "E2" | "E3" | "E4" | "E5" | "E6" | "E7" | "E8" | "E9" | "E10" | "FIN" | "END";
type EvKey =
  | "dolly" | "name" | "sale" | "chart0" | "down0" | "down1" | "chartOff" | "fly0" | "flyStep" | "tags" | "card" | "glitch"
  | "dissolve" | "qmark" | "human" | "humanFull" | "doc" | "docAway" | "skip" | "tower" | "boss" | "up0" | "up1" | "chartOn"
  | "deal" | "reach" | "barrier" | "tools" | "rails" | "lens0" | "lens" | "dark" | "typeStart" | "typeStep";
export const S = TL.scenes as Record<SceneKey, number>;
export const EV = TL.ev as Record<EvKey, number>;
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
