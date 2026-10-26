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
  accent: "#FF6B1A", // AIgencyx Labs orange
  accentSoft: "#FF9E4A",
  teal: "#3DDC97",
  ink: "#14110F",
  cream: "#FFF4EC",
  red: "#FF5A5F",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.62)",
};

export type Word = { text: string; start: number; end: number; kind?: "emo" | "key" | null };
export type Sentence = { words: Word[]; start: number; end: number };
export type CallLine = { speaker: "lucia" | "cliente"; start: number; end: number; words: Word[] };

export const TL = timelineJson as unknown as {
  fps: number;
  durationInFrames: number;
  scenes: Record<string, number>;
  captions: Record<string, Sentence>;
  call: CallLine[];
  sfx: { t: number; type: string }[];
  envelopes: Record<"narrador" | "lucia" | "cliente", number[]>;
};

export const S = TL.scenes;
export const FPS = TL.fps;

// "Aceleración y frenada suave" for object moves (~0.9 s)
export const EASE = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const MOVE = 0.9;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

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

/** Build tween keys from an initial value and a list of [startTime, target, duration?] moves. */
export const moves = (initial: number, list: [number, number, number?][]): [number, number][] => {
  const keys: [number, number][] = [[0, initial]];
  let prev = initial;
  for (const [t0, v, d = MOVE] of list) {
    keys.push([t0, prev], [t0 + d, v]);
    prev = v;
  }
  return keys;
};

/** Smooth window: 0 before a, ramps to 1 over fadeIn, holds, ramps to 0 ending at b. */
export const windowed = (t: number, a: number, b: number, fadeIn = 0.3, fadeOut = 0.3) =>
  Math.min(EASE_OUT(clamp01((t - a) / fadeIn)), EASE(clamp01((b - t) / fadeOut)));

/** Continuous gentle drift so nothing ever stands still. */
export const drift = (t: number, seed: number, amp = 1) =>
  amp * (Math.sin(t * 0.9 + seed * 1.7) * 0.6 + Math.sin(t * 0.37 + seed * 3.1) * 0.4);

export const envAt = (who: "narrador" | "lucia" | "cliente", t: number) => {
  const arr = TL.envelopes[who];
  const f = t * FPS;
  const i = Math.floor(f);
  const a = arr[Math.max(0, Math.min(arr.length - 1, i))] ?? 0;
  const b = arr[Math.max(0, Math.min(arr.length - 1, i + 1))] ?? 0;
  return a + (b - a) * (f - i);
};
