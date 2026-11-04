import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";
import timelineJson from "./timeline.json";
import gotaJson from "./timeline-gota.json";

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
  floor: "#0d0a08",
  end: "#0A0A0A",
  orange: "#FF6B1A",
  orangeSoft: "#FFB066",
  white: "#FFFFFF",
  grey: "#8A8A8A",
  cream: "#FFF4EC", // logo only
};

export type Word = { text: string; t: number; hl: boolean };
export type Caption = { lines: Word[][]; start: number; end: number };
export type Leak = { label: string; at: number; drops: number[]; clamp: number };

export const TL = timelineJson as unknown as {
  fps: number;
  durationInFrames: number;
  voiceAt: number;
  scenes: Record<"S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "C" | "END", number>;
  captions: Caption[];
  ev: Record<string, number>;
  words: { w: string; s: number; e: number }[];
  pipe: { fallT: number; leaks: Leak[]; fill: [number, number] };
};

/** Per-frame physics of the countdown, shared with the Cycles plates (scripts/physics.py → scripts/blender_gota.py). */
export type GotaData = {
  fps: number; frames: number; neck: number; pinch: number; brake: number; freeze: number; voice: number;
  rate: number; fpsScene: number; T: number[]; tau0: number;
  hMouth: number; rContact: number; gap: number; R: number; v0: number; vFreeze: number;
  counter: number[];
  dropZ: (number | null)[]; dropTop: number; dropBottom: number; dropHalfWidth: number; satZ: number; satR: number; remTip: number;
  underFreeze: number;
  cam: number[][]; // per frame: camera xyz, target xyz (Blender axes, m), vertical fov (deg), f-stop, focus z
  tension: number[];
  speed: number[];
};
export const GOTA = gotaJson as unknown as GotaData;

export const S = TL.scenes;
export const EV = TL.ev as Record<
  | "freeze" | "voice" | "brake" | "pinch" | "cota" | "cotaLabel" | "noExiste" | "offAgua" | "offGrifo" | "offReflejo" | "relight"
  | "ann1" | "ann2" | "ann3" | "ann4" | "resume" | "impact" | "satImpact" | "sweep" | "lMensaje" | "lLlamada" | "lPresupuesto"
  | "gota1" | "gota2" | "escapan" | "clientes" | "clamp1" | "clamp2" | "clamp3" | "fluye" | "llegar"
  | "cta" | "comenta" | "typeStart" | "typeStep" | "send" | "porDonde" | "crt" | "logo",
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

/** A decaying jolt (0 before `at`, peak 1, oscillating out over ~`len` s). */
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
export const BOTTOM_SAFE = 1580;
