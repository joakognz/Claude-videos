import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";
import timelineJson from "./timeline.json";

export const ANTON = "Anton";
export const UI = "Inter";
export const MONO = "JetBrains Mono";
loadFont({ family: ANTON, url: staticFile("fonts/anton-latin-400-normal.woff2"), weight: "400" });
loadFont({ family: UI, url: staticFile("fonts/inter-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: UI, url: staticFile("fonts/inter-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: UI, url: staticFile("fonts/inter-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-700-normal.woff2"), weight: "700" });

// «Sala falsa»: gray and white = true; orange = false / altered / happening. No red, blue or green.
export const C = {
  orange: "#FF6B1A",
  orangeSoft: "#FFB066",
  room: "#EDEDED",
  tile: "#FFFFFF",
  border: "#D2D2D2",
  ink: "#111111",
  mid: "#8A8A8A",
  dark: "#3A3A3A",
  black: "#0A0A0A",
  cream: "#FFF4EC",
};

export type Chunk = { text: string; t: number; hl: boolean };
export type Caption = { chunks: Chunk[]; start: number; end: number; sub?: [string, number][] };
export type Trans = { t: number; type: "glitch" | "slices" | "tab" | "pixel" | "zoom" | "bar"; to: string };

export const TL = timelineJson as unknown as {
  fps: number;
  durationInFrames: number;
  scenes: { id: string; t: number }[];
  trans: Trans[];
  punch: number[];
  captions: Caption[];
  ev: Record<string, number>;
  voiceEnd: number;
};
export const EV = TL.ev;
export const FPS = TL.fps;
export const sceneStart = (id: string) => TL.scenes.find((s) => s.id === id)!.t;

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE = Easing.bezier(0.65, 0, 0.35, 1);
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0→1 between a and b (seconds), clamped */
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const GRID = {
  cols: [40, 550],
  rows: [680, 962, 1244],
  w: 490,
  h: 262,
};
export const tilePos = (i: number) => ({ x: GRID.cols[i % 2], y: GRID.rows[Math.floor(i / 2)], w: GRID.w, h: GRID.h });
