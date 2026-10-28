import React from "react";
import { C, COND, Caption, EASE, EASE_OUT, FPS, MONO, S, TL, Word, clamp01, rise } from "../theme";

const cap = TL.captions;
const TOP = 268; // first line's top edge (clear of the 250 px unsafe strip)
const SIZE = 94;

// order on screen and until when each caption stays (it then lifts and fades in 0.22 s)
const ORDER: { id: string; until: number }[] = [
  { id: "E1", until: S.E2 - 0.05 },
  { id: "E2", until: cap.E3.start - 0.12 },
  { id: "E3", until: cap.E4.start - 0.12 },
  { id: "E4", until: cap.E5.start - 0.12 },
  { id: "E5", until: S.E6 },
  { id: "E7", until: cap.E8a.start - 0.12 },
  { id: "E8a", until: cap.E8b.start - 0.12 },
  { id: "E8b", until: cap.E9a.start - 0.12 },
  { id: "E9a", until: cap.E9b.start - 0.12 },
  { id: "E9b", until: S.E10 + 0.2 },
  { id: "E10", until: S.E11 + 0.3 },
  { id: "E11", until: cap.E12.start - 0.12 },
  { id: "E12", until: S.E13 - 0.05 },
  { id: "E13", until: S.OUTRO + 0.1 },
];
const OUT = 0.22;

const WordSpan: React.FC<{ w: Word; t: number }> = ({ w, t }) => {
  const a = w.start - 2 / FPS;
  const p = rise(t, a, 0.2);
  const style: React.CSSProperties = {
    display: "inline-block", position: "relative", opacity: p, transform: `translateY(${(1 - p) * 24}px)`,
  };
  if (!w.kind) return <span style={style}>{w.text}</span>;
  // highlighter: the box wipes in from the left as the word lands
  const hp = EASE_OUT(clamp01((t - a - 0.04) / 0.22));
  const pos = w.kind === "pos";
  const clean = w.text.replace(/[.,…]+$/, "");
  const tail = w.text.slice(clean.length);
  return (
    <span style={style}>
      <span style={{ position: "relative", display: "inline-block", padding: "0 0.13em", color: pos && hp > 0.5 ? C.ink : C.white }}>
        <span style={{
          position: "absolute", left: 0, right: 0, top: "0.08em", bottom: "0.02em", background: pos ? C.orange : C.grey2,
          transform: `scaleX(${hp})`, transformOrigin: "left center", borderRadius: 6, zIndex: -1,
          boxShadow: pos ? `0 0 ${36 * hp}px rgba(255,122,0,0.55)` : "none",
        }} />
        {clean}
      </span>
      {tail}
    </span>
  );
};

const Block: React.FC<{ c: Caption; t: number; until: number }> = ({ c, t, until }) => {
  const q = EASE(clamp01((t - until) / OUT));
  // slow push-in while the caption is on screen (the camera itself never moves)
  const life = clamp01((t - c.start) / Math.max(1, until - c.start));
  return (
    <div style={{
      position: "absolute", left: 64, right: 64, top: TOP - q * 40, opacity: 1 - q, display: "flex", flexDirection: "column", alignItems: "center",
      transform: `scale(${1 + 0.045 * life})`, transformOrigin: "50% 0%",
    }}>
      <div style={{
        display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.22em", rowGap: "0.04em",
        fontFamily: COND, fontWeight: 800, fontSize: SIZE, lineHeight: 1.04, color: C.white, textAlign: "center",
        textShadow: "0 4px 24px rgba(0,0,0,0.85)", isolation: "isolate",
      }}>
        {c.words.map((w, i) => (
          <WordSpan key={i} w={w} t={t} />
        ))}
      </div>
      {c.small && (
        <div style={{
          marginTop: 22, fontFamily: COND, fontWeight: 600, fontSize: 50, color: "rgba(255,255,255,0.92)", textAlign: "center",
          opacity: rise(t, c.small.start - 0.05, 0.3), transform: `translateY(${(1 - rise(t, c.small.start - 0.05, 0.3)) * 16}px)`,
          textShadow: "0 4px 20px rgba(0,0,0,0.85)",
        }}>
          {c.small.text}
        </div>
      )}
    </div>
  );
};

/** Mono micro-label for E6 (the list speaks for itself). */
const Micro: React.FC<{ t: number }> = ({ t }) => {
  const p = Math.min(rise(t, S.E6 + 0.05, 0.3), 1 - EASE(clamp01((t - (S.E7 - 0.3)) / 0.25)));
  if (p <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: TOP + 34, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 30,
      letterSpacing: "0.22em", color: C.white, opacity: p, textShadow: "0 4px 20px rgba(0,0,0,0.85)",
    }}>
      LO QUE HACE SOLO
    </div>
  );
};

export const Captions: React.FC<{ t: number }> = ({ t }) => (
  <>
    {ORDER.map(({ id, until }) => {
      const c = cap[id];
      if (t < c.start - 0.1 || t > until + OUT) return null;
      return <Block key={id} c={c} t={t} until={until} />;
    })}
    <Micro t={t} />
  </>
);
