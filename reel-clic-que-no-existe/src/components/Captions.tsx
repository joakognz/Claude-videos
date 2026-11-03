import React from "react";
import { C, EASE_OUT, TL, UI, clamp01 } from "../theme";

export const CAPTION_TOP = 1250;
const SMALL = 46;
const BIG = 92;

/** One word: rises 14 px and sharpens from a soft blur in 4 frames, starting on its own syllable. */
export const Word: React.FC<{ t: number; at: number; hl: boolean; size: number; last: boolean; children: React.ReactNode }> = ({ t, at, hl, size, last, children }) => {
  const p = EASE_OUT(clamp01((t - at) / 0.14));
  return (
    <span style={{
      display: "inline-block", opacity: p, translate: `0px ${(1 - p) * 14}px`, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
      color: hl ? C.orange : C.white, marginRight: last ? 0 : size * 0.26,
      textShadow: hl ? "0 0 28px rgba(255,107,26,0.45), 0 4px 24px rgba(0,0,0,0.6)" : "0 4px 24px rgba(0,0,0,0.65)",
    }}>{children}</span>
  );
};

/** Two-tier captions: a small lead-in line, then the punch line big and bold with its keyword in orange. */
export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cap = TL.captions.find((c) => t >= c.start && t < c.end);
  if (!cap) return null;
  const two = cap.lines.length > 1;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: CAPTION_TOP }}>
      <div style={{
        position: "absolute", left: -50, right: -50, top: -110, height: 420,
        background: "radial-gradient(ellipse 62% 48% at 50% 50%, rgba(5,5,5,0.62), rgba(5,5,5,0))",
      }} />
      {cap.lines.map((ln, i) => {
        const big = !two || i === 1;
        const size = big ? BIG : SMALL;
        return (
          <div key={i} style={{
            position: "relative", textAlign: "center", fontFamily: UI, fontWeight: big ? 700 : 600, fontSize: size,
            lineHeight: big ? 1.08 : 1.3, letterSpacing: big ? -2.5 : -0.3, color: C.white, opacity: big ? 1 : 0.92,
          }}>
            {ln.map((w, k) => (
              <Word key={k} t={t} at={w.t} hl={w.hl} size={size} last={k === ln.length - 1}>{w.text}</Word>
            ))}
          </div>
        );
      })}
    </div>
  );
};
