import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";
import timelineJson from "./timeline.json";

// Google Fonts bundled locally (Montserrat is a variable font: one file covers 500-800)
export const SANS = "Montserrat";
export const SERIF = "Playfair Display";
export const LOGO_FONT = "Sora";
loadFont({ family: SANS, url: staticFile("fonts/Montserrat-latin.woff2"), weight: "500 800" });
loadFont({ family: SERIF, url: staticFile("fonts/PlayfairDisplay-Italic700-latin.woff2"), weight: "700", style: "italic" });
loadFont({ family: LOGO_FONT, url: staticFile("fonts/Sora-latin.woff2"), weight: "700 800" });

export const C = {
  bg: "#0B1F1A",
  bgDeep: "#06130F",
  green: "#3DDC97",
  greenDeep: "#1F8F60",
  red: "#FF5A5F",
  redDim: "#B8585B", // desaturated red for the "apagado" panel
  warm: "#FFB86B",
  brand: "#FF6B1A", // AIgencyx Labs orange (logo only)
  ink: "#0B1F1A",
  inkDark: "#14110F",
  cream: "#FFF4EC",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.62)",
};

export type Word = { text: string; start: number; end: number; kind?: "emo" | "key" | null };
export type Sentence = { words: Word[]; start: number; end: number };
export type NightEvent = { t: number; clock: string; kind: "call" | "chat" | "form"; arrive: number; lost: number; booked: number };

export const TL = timelineJson as unknown as {
  fps: number;
  durationInFrames: number;
  scenes: Record<string, number>;
  captions: Record<string, Sentence>;
  night: NightEvent[];
  sfx: { t: number; type: string }[];
};

export const S = TL.scenes;
export const FPS = TL.fps;
export const CAP = TL.captions;
/** start time of word k of caption id */
export const W = (id: string, k: number) => CAP[id].words[k].start;

// ── layout (inside the safe zone: 250 px top, 340 px bottom) ─────────────
export const PANEL_X = 24;
export const PANEL_W = 1032;
export const PANEL_H = 600;
export const TOP_Y = 250;
export const CLOCK_Y = 850;
export const CLOCK_H = 130;
export const BOT_Y = 980;

// "Aceleración y frenada suave" for object moves (~0.9 s)
export const EASE = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const MOVE = 0.9;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** 0→1 eased ramp starting at t0 over d seconds. */
export const ramp = (t: number, t0: number, d = MOVE, easing: (n: number) => number = EASE) => easing(clamp01((t - t0) / d));

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

/** Smooth window: 0 before a, ramps to 1 over fadeIn, holds, ramps to 0 ending at b. */
export const windowed = (t: number, a: number, b: number, fadeIn = 0.3, fadeOut = 0.3) =>
  Math.min(EASE_OUT(clamp01((t - a) / fadeIn)), EASE(clamp01((b - t) / fadeOut)));

/** Continuous gentle drift so nothing ever stands still. */
export const drift = (t: number, seed: number, amp = 1) =>
  amp * (Math.sin(t * 0.9 + seed * 1.7) * 0.6 + Math.sin(t * 0.37 + seed * 3.1) * 0.4);

/** Rgba helper for hex colours. */
export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
