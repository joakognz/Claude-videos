import React from "react";
import { spring } from "remotion";
import { C, FPS, S, SANS, TL, clamp01, EASE, drift } from "../theme";
import { AnimatedWord } from "./Captions";

const FONT = 42;
const LINE_H = FONT * 1.25;
const MAX_W = 780;
const GAP = 22;
const BOTTOM = 1560;
const TOP_FADE = 1060;

const heightOf = (text: string) => {
  const perLine = Math.floor((MAX_W - 56) / (FONT * 0.6));
  let lines = 1;
  let cur = 0;
  for (const w of text.split(" ")) {
    if (cur + w.length > perLine && cur > 0) {
      lines++;
      cur = w.length + 1;
    } else cur += w.length + 1;
  }
  return 44 + 38 + lines * LINE_H;
};

const LINES = TL.call.map((l) => ({ ...l, h: heightOf(l.words.map((w) => w.text).join(" ")) }));

/** E5: live transcription bubbles, word by word, in sync with the call audio. */
export const CallBubbles: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  if (t < S.E5 - 0.2 || t > S.E6 + 0.8) return null;
  const out = EASE(clamp01((t - S.E6) / 0.6));
  const appear = LINES.map((l) =>
    spring({ frame: frame - (l.start - 0.12) * FPS, fps: FPS, config: { damping: 200, stiffness: 120 } }));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, translate: `0px ${-out * 200}px`, filter: `blur(${out * 16}px)` }}>
      {LINES.map((l, i) => {
        if (appear[i] <= 0.001) return null;
        // push older bubbles up as newer ones arrive
        let lift = 0;
        for (let j = i + 1; j < LINES.length; j++) lift += (LINES[j].h + GAP) * appear[j];
        const top = BOTTOM - l.h - lift + (1 - appear[i]) * 60;
        const fade = clamp01((top - (TOP_FADE - 120)) / 120);
        const lucia = l.speaker === "lucia";
        return (
          <div key={i} style={{
            position: "absolute", top: top + drift(t, i + 20, 4), [lucia ? "left" : "right"]: 80, maxWidth: MAX_W,
            padding: "22px 28px", borderRadius: 34, borderBottomLeftRadius: lucia ? 8 : 34, borderBottomRightRadius: lucia ? 34 : 8,
            background: lucia ? "rgba(17,60,45,0.92)" : "rgba(255,255,255,0.95)",
            border: lucia ? `2px solid ${C.green}` : "2px solid rgba(255,255,255,1)",
            boxShadow: lucia ? "0 0 36px rgba(61,220,151,0.28), 0 18px 40px rgba(0,0,0,0.35)" : "0 18px 40px rgba(0,0,0,0.35)",
            opacity: appear[i] * fade, scale: String(0.94 + 0.06 * appear[i]),
            transformOrigin: lucia ? "left bottom" : "right bottom", fontFamily: SANS,
          }}>
            <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: 1.5, marginBottom: 8, color: lucia ? C.green : "rgba(11,31,26,0.55)" }}>
              {lucia ? "LUCÍA (IA)" : "CLIENTE"}
            </div>
            <div style={{
              display: "flex", flexWrap: "wrap", columnGap: FONT * 0.26, fontWeight: 700, fontSize: FONT,
              lineHeight: `${LINE_H}px`, color: lucia ? C.white : C.bg,
            }}>
              {l.words.map((w, k) => <AnimatedWord key={k} w={w} frame={frame} size={FONT} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
