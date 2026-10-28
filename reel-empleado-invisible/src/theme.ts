import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";
import timelineJson from "./timeline.json";

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

// ── voice timeline (scripts/build.py): phrase spans and word start times, in seconds ──
type TLWord = { text: string; start: number; end: number };
const TLJ = timelineJson as unknown as { phrases: Record<string, [number, number]>; words: Record<string, TLWord[]> };
export const PH = TLJ.phrases;
/** Start of the i-th word of a phrase. */
export const W = (pid: string, i: number) => TLJ.words[pid][i].start;

// ── scenes (seconds), set by the voice ──────────────────────────────────
export const S = { E1: 0, E2: 4, E3: 9.85, E4: 12.55, E5: 17.8, E6: 25.55, E7: 36.1, E8: 38.75, E9: 42.85, END: DURATION };

// ── events (seconds) ─────────────────────────────────────────────────────
export const EV = {
  // E2 chaos ("…llamadas, mensajes, citas apuntadas en una libreta")
  ring: [4.3, W("a3", 0) + 0.1, 8.4],
  scribble: [4.6, 5.3, 6.0, 6.9, W("a3", 6) - 0.2, W("a3", 6) + 0.3],
  chatIn: [5.0, W("a3", 1), 7.9],
  // E3
  chatClear: 9.8,
  // E4 the invisible employee: copies labelled as the voice names them
  ghostIn: 12.65,
  split: W("a6", 0),
  ghostLabel: [W("a6", 10), W("a6", 6), W("a6", 3)], // agenda, mostrador, móvil
  ghostLabelsOut: 17.55,
  // E5 tasks: each tag appears with its phrase and is checked when the phrase ends
  tag: [PH.b1[0], PH.b2[0], PH.b3[0], PH.b4[0]],
  check: [PH.b1[1] - 0.05, PH.b2[1] - 0.05, PH.b3[1] - 0.05, PH.b4[1] - 0.05],
  tagsOut: S.E6 - 0.15,
  msgIn: 18.4,
  typing: 18.8,
  reply: 19.2,
  msgOk: 20.1,
  confirm: 20.9,
  notifs: [PH.b3[1], PH.b4[1]],
  // E6 comparison cards: rows appear as they are said
  cardRed: PH.b6[0],
  cardOrange: PH.b6[0] + 0.45,
  redRows: [W("b6", 2), W("b6", 4), W("b6", 5), W("b6", 7)],
  orangeRows: [W("b7", 2), W("b7", 4), W("b7", 7)],
  redOff: PH.b7[0] - 0.15,
  orangeOn: PH.b7[0] + 0.1,
  cardsOut: PH.b7[1] - 0.05,
  // E7 all on
  allOn: 36.1,
  counters: [36.85, 37.3],
  // E8 CTA
  bar: 38.75,
  typeStart: W("c2", 1),
  typeEnd: W("c2", 1) + 0.6,
  // the white phone mockup, always bottom-right: [in, out]
  phone: [[4.55, 10.25], [17.75, 25.3], [36.45, 38.5]] as [number, number][],
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
