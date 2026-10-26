import React from "react";
import { spring } from "remotion";
import { C, FPS, S, SANS, SERIF, Sentence, TL, Word, clamp01, EASE } from "../theme";

type Placement = { id: string; y: number; until?: number };

const cap = TL.captions;
// order of on-screen narration captions and where they sit
const ORDER: Placement[] = [
  { id: "S1", y: 1490 }, { id: "S2", y: 1490 }, { id: "S3", y: 1490 }, { id: "S4", y: 1490, until: S.E5 },
  { id: "S5", y: 360 }, { id: "S6", y: 360 }, { id: "S7", y: 360 }, { id: "S8", y: 360 },
  { id: "S9", y: 360 }, { id: "S10", y: 360 }, { id: "S11", y: 360, until: S.E13 },
  { id: "S13", y: 1490, until: S.E15 },
];

const EXIT = 10 / FPS;

const emoColor = (t: number) => (t < S.E3 ? "#CFE0FF" : t < S.E4 ? C.red : C.accent);

export const AnimatedWord: React.FC<{ w: Word; frame: number; size: number; color?: string }> = ({ w, frame, size, color = C.white }) => {
  const f0 = w.start * FPS - 2;
  const emo = w.kind === "emo";
  const key = w.kind === "key";
  const s = spring({ frame: frame - f0, fps: FPS, config: emo || key ? { damping: 9, stiffness: 160, mass: 0.8 } : { damping: 200, stiffness: 180 } });
  const appear = clamp01((frame - f0) / 4);
  const base: React.CSSProperties = {
    display: "inline-block", opacity: appear, translate: `0px ${(1 - s) * 46}px`,
    scale: String(0.82 + 0.18 * s), filter: `blur(${(1 - appear) * 8}px)`,
  };
  if (key) {
    return (
      <span style={{ ...base, padding: `0 ${size * 0.22}px`, borderRadius: size * 0.2, background: C.accent, color: C.ink, boxShadow: `0 0 ${size * 0.5}px rgba(255,107,26,0.55)` }}>
        {w.text.replace(/[.,]$/, "")}
      </span>
    );
  }
  if (emo) {
    return (
      <span style={{ ...base, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: size * 1.14, color, letterSpacing: 0 }}>
        {w.text}
      </span>
    );
  }
  return <span style={{ ...base }}>{w.text}</span>;
};

const CaptionBlock: React.FC<{ sentence: Sentence; frame: number; t: number; y: number; exitAt: number }> = ({ sentence, frame, t, y, exitAt }) => {
  const p = EASE(clamp01((t - exitAt) / EXIT));
  const size = 76;
  return (
    <div style={{
      position: "absolute", left: 80, right: 80, top: y, translate: `0px ${-50 - p * 90}%`,
      display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline",
      columnGap: size * 0.26, rowGap: size * 0.08, fontFamily: SANS, fontWeight: 800, fontSize: size,
      lineHeight: 1.12, color: C.white, textAlign: "center", opacity: 1 - p, filter: `blur(${p * 14}px)`,
      textShadow: "0 6px 30px rgba(0,0,0,0.55)",
    }}>
      {sentence.words.map((w, i) => (
        <AnimatedWord key={i} w={w} frame={frame} size={size} color={emoColor(sentence.start)} />
      ))}
    </div>
  );
};

export const Captions: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  return (
    <>
      {ORDER.map((pl, i) => {
        const s = cap[pl.id];
        const next = pl.until ?? cap[ORDER[i + 1].id].start;
        // stay on screen at least 10 frames after the last word
        const exitAt = Math.max(next - 0.04, s.end + 4 / FPS);
        if (t < s.start - 0.15 || t > exitAt + EXIT) return null;
        return <CaptionBlock key={pl.id} sentence={s} frame={frame} t={t} y={pl.y} exitAt={exitAt} />;
      })}
    </>
  );
};
