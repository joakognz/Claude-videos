import React from "react";
import { C, COND, Caption, EASE, EASE_OUT, MONO, TL, clamp01, rand } from "../theme";

export const CAPTION_TOP = 330;

const HL: Record<"o" | "g", { bg: string; fg: string }> = {
  o: { bg: C.orange, fg: C.ink },
  g: { bg: C.grey, fg: C.white },
};

/** Keyword on a highlighter box that wipes in from the left; the text turns dark once the box is under it. */
export const Highlight: React.FC<{ text: string; kind: "o" | "g"; t: number; at: number; size: number; fadeLetters?: number }> = ({ text, kind, t, at, size, fadeLetters = 0 }) => {
  const wipe = EASE_OUT(clamp01((t - at) / 0.28));
  const hl = HL[kind];
  const ink = clamp01((wipe - 0.45) / 0.3);
  return (
    <span style={{ position: "relative", display: "inline-block", padding: `0 ${size * 0.14}px`, margin: `0 ${size * 0.04}px` }}>
      <span style={{
        position: "absolute", left: 0, right: 0, top: "8%", bottom: "4%", background: hl.bg,
        transformOrigin: "left center", scale: `${wipe} 1`,
        boxShadow: kind === "o" ? `0 0 ${size * 0.5}px rgba(255,122,0,${0.45 * wipe})` : "none",
        opacity: 1 - fadeLetters,
      }} />
      <span style={{ position: "relative", color: kind === "o" ? `rgb(${255 - 245 * ink},${255 - 245 * ink},${255 - 245 * ink})` : C.white }}>
        {fadeLetters > 0
          ? [...text].map((ch, i) => {
            const k = clamp01(fadeLetters * 1.6 - rand(i + 3) * 0.6);
            return <span key={i} style={{ opacity: 1 - k, filter: `blur(${k * 10}px)`, display: "inline-block", translate: `0px ${-k * 18}px` }}>{ch}</span>;
          })
          : text}
      </span>
    </span>
  );
};

const CaptionView: React.FC<{ cap: Caption; t: number }> = ({ cap, t }) => {
  const size = cap.big ? 190 : 112;
  const out = cap.cut ? 0 : EASE(clamp01((t - (cap.end - 0.25)) / 0.25));
  const fade = cap.fade ? clamp01((t - (cap.end - 1.0)) / 0.95) : 0;
  // E14: the sentence is cut off with a short glitch, then gone
  const glitch = cap.cut ? clamp01((t - (cap.end - 0.14)) / 0.14) : 0;
  if (t < cap.start || (cap.cut ? t > cap.end : out >= 1)) return null;
  const gx = glitch > 0 ? (rand(Math.floor(t * 60)) - 0.5) * 60 : 0;
  return (
    <div style={{
      position: "absolute", left: 70, right: 70, top: CAPTION_TOP, textAlign: "center", fontFamily: COND, fontWeight: 800,
      fontSize: size, lineHeight: 1.04, color: C.white, letterSpacing: cap.big ? -2 : 0, opacity: 1 - out,
      filter: `blur(${out * 12}px)`, translate: `${gx}px ${-out * 30}px`,
      textShadow: glitch > 0 ? `${-8 * glitch}px 0 rgba(255,60,60,0.8), ${8 * glitch}px 0 rgba(60,200,255,0.8)` : "0 4px 30px rgba(0,0,0,0.65)",
      clipPath: glitch > 0 ? `inset(${rand(Math.floor(t * 60) + 1) * 40}% 0 ${rand(Math.floor(t * 60) + 2) * 40}% 0)` : undefined,
    }}>
      {cap.chunks.map((ch, i) => {
        const p = EASE_OUT(clamp01((t - (ch.t - 0.08)) / 0.26));
        const isLast = i === cap.chunks.length - 1;
        return (
          <React.Fragment key={i}>
            <span style={{ display: "inline-block", opacity: p, translate: `0px ${(1 - p) * 34}px`, filter: `blur(${(1 - p) * 8}px)` }}>
              {ch.hl ? <Highlight text={ch.text} kind={ch.hl} t={t} at={ch.t} size={size} fadeLetters={fade} /> : (
                <span style={{ opacity: 1 - fade * 0.6 }}>{ch.text}</span>
              )}
            </span>
            {!isLast && " "}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const Captions: React.FC<{ t: number }> = ({ t }) => (
  <>
    {Object.entries(TL.captions).map(([k, cap]) => <CaptionView key={k} cap={cap} t={t} />)}
  </>
);

/** Small monospaced HUD micro-text. */
export const Micro: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = "rgba(255,255,255,0.7)", size = 22, style }) => (
  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.22, textTransform: "uppercase", color, ...style }}>{children}</span>
);
