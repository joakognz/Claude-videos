import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";
import timelineJson from "./timeline.json";
import engrJson from "./timeline-engranajes.json";

// Fonts bundled locally (the render browser can't reach Google Fonts)
export const UI = "Inter";
export const MONO = "JetBrains Mono";
export const LOGO = "Sora";
loadFont({ family: UI, url: staticFile("fonts/inter-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: UI, url: staticFile("fonts/inter-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: LOGO, url: staticFile("fonts/Sora-latin.woff2"), weight: "700 800" });

// Strict palette: black studio, brand orange, light orange, white text, grey HUD. No red, blue or green.
export const C = {
  black: "#050505",
  floor: "#1a0d06",
  end: "#0A0A0A",
  orange: "#FF6B1A",
  orangeSoft: "#FFB066",
  white: "#FFFFFF",
  grey: "#8A8A8A",
  cream: "#FFF4EC", // logo only
};

export type Word = { text: string; t: number; hl: boolean };
export type Caption = { lines: Word[][]; start: number; end: number };

export const TL = timelineJson as unknown as {
  fps: number;
  durationInFrames: number;
  voiceAt: number;
  scenes: Record<"S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "C" | "END", number>;
  captions: Caption[];
  ev: Record<string, number>;
  words: { w: string; s: number; e: number }[];
  explode: { part: string; t: number; d: number }[];
  reassemble: { part: string; t: number }[];
  mech: { pops: number[]; grind: number[]; toothStart: number; toothStep: number; teeth: number; slide: number; seat: number; engage: number; spinRate: number };
  toothTicks: number[];
  tickWave: number[];
};

/** Per-frame curves of the countdown, shared with the Cycles plates (scripts/build.py → scripts/blender_engranajes.py). */
export type EngrData = {
  fps: number; frames: number; brake: number; freeze: number; voice: number;
  module: number; zA: number; zB: number;
  beats: number[]; // heartbeat instants, in frames
  counter: number[]; gap: number[]; thetaA: number[]; thetaB: number[];
  cam: number[][]; // per frame: camera xyz, target xyz (Blender axes, metres), vertical fov (deg)
  tension: number[];
};
export const ENGR = engrJson as unknown as EngrData;

export const S = TL.scenes;
export const EV = TL.ev as Record<
  | "freeze" | "voice" | "brake" | "clicEcho" | "scan" | "noExiste" | "waveTick" | "wavePause" | "sweep" | "agenda" | "mensajes"
  | "facturas" | "tu" | "pegamento" | "fabrica" | "faltan" | "encaje" | "solo" | "cta" | "comenta" | "typeStart" | "typeStep"
  | "send" | "cual" | "crt" | "logo",
  number
>;
export const FPS = TL.fps;

export const EASE = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const ramp = (t: number, a: number, b: number, easing: (n: number) => number = EASE) => easing(clamp01((t - a) / (b - a)));

/** Damped spring 0 → 1 (with overshoot) starting at `at`. */
export const springAt = (t: number, at: number, damping = 12, stiffness = 170) => {
  const x = t - at;
  if (x <= 0) return 0;
  const w = Math.sqrt(stiffness);
  const z = Math.min(0.99, damping / (2 * w));
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + (z * w / wd) * Math.sin(wd * x));
};

/** A decaying jolt (0 before `at`, peak 1, oscillating out over ~`len` s) — for knocks and shoves. */
export const jolt = (t: number, at: number, len = 0.35, freq = 16) => {
  const x = t - at;
  if (x < 0 || x > len * 2) return 0;
  return Math.exp((-x / len) * 3) * Math.sin(x * freq * Math.PI * 2 + Math.PI / 2);
};

/** Deterministic pseudo-random in [0, 1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Safe zones: nothing informative above TOP_SAFE or below BOTTOM_SAFE. */
export const TOP_SAFE = 250;
export const BOTTOM_SAFE = 1920 - 340;
