import React from "react";
import { spring } from "remotion";
import { BOT_Y, C, CAP, FPS, S, SANS, SERIF, Sentence, TOP_Y, Word, clamp01, rgba, EASE } from "../theme";

// caption zones: the upper strip of each panel (above the window and the phone)
export const ZONE_Y = { top: TOP_Y + 102, bottom: BOT_Y + 102 };
type Zone = keyof typeof ZONE_Y;
type Placement = { id: string; zone: Zone; emo?: string; until?: number; y?: number };

const ORDER: Placement[] = [
  { id: "S1a", zone: "bottom" }, { id: "S1b", zone: "bottom", emo: "#FF8A8D", until: S.E2 + 0.15 },
  { id: "S2a", zone: "top" }, { id: "S2b", zone: "top", until: S.E3 + 0.15 },
  { id: "S3a", zone: "bottom" }, { id: "S3b", zone: "bottom", emo: C.green, until: S.E4 + 0.15 },
  { id: "S4", zone: "top", until: S.E5 },
  { id: "S6a", zone: "top", until: S.E7 }, { id: "S6b", zone: "bottom", until: S.E7 + 0.1 },
  { id: "S7", zone: "top", emo: C.red, y: 334 }, { id: "S8", zone: "top", until: S.E9, y: 334 },
  { id: "S9a", zone: "top", until: 999 },
];

const EXIT = 10 / FPS;

export const AnimatedWord: React.FC<{ w: Word; frame: number; size: number; emoColor?: string }> = ({ w, frame, size, emoColor = C.white }) => {
  const f0 = w.start * FPS - 2;
  const emo = w.kind === "emo";
  const key = w.kind === "key";
  const s = spring({
    frame: frame - f0, fps: FPS,
    config: emo ? { damping: 8, stiffness: 170, mass: 0.8 } : key ? { damping: 11, stiffness: 180, mass: 0.8 } : { damping: 200, stiffness: 180 },
  });
  const appear = clamp01((frame - f0) / 4);
  const base: React.CSSProperties = {
    display: "inline-block", opacity: appear, translate: `0px ${(1 - s) * 46}px`,
    scale: String(0.8 + 0.2 * s), filter: `blur(${(1 - appear) * 8}px)`,
  };
  if (key) {
    return (
      <span style={{
        ...base, padding: `0 ${size * 0.2}px`, borderRadius: size * 0.2, background: C.green, color: C.ink,
        boxShadow: `0 0 ${size * 0.55}px ${rgba(C.green, 0.55)}`,
      }}>
        {w.text.replace(/[.,]$/, "")}
      </span>
    );
  }
  if (emo) {
    return (
      <span style={{ ...base, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: size * 1.16, color: emoColor, letterSpacing: 0 }}>
        {w.text}
      </span>
    );
  }
  return <span style={base}>{w.text}</span>;
};

export const CaptionBlock: React.FC<{ sentence: Sentence; frame: number; t: number; y: number; exitAt: number; emo?: string; size?: number }> = ({
  sentence, frame, t, y, exitAt, emo, size = 66,
}) => {
  const p = EASE(clamp01((t - exitAt) / EXIT));
  return (
    <div style={{
      position: "absolute", left: 70, right: 70, top: y, translate: `0px ${-50 - p * 80}%`,
      display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline",
      columnGap: size * 0.26, rowGap: size * 0.06, fontFamily: SANS, fontWeight: 800, fontSize: size,
      lineHeight: 1.1, color: C.white, textAlign: "center", opacity: 1 - p, filter: `blur(${p * 14}px)`,
      textShadow: "0 6px 30px rgba(0,0,0,0.7)",
    }}>
      {sentence.words.map((w, i) => (
        <AnimatedWord key={i} w={w} frame={frame} size={size} emoColor={emo} />
      ))}
    </div>
  );
};

export const Captions: React.FC<{ frame: number; t: number }> = ({ frame, t }) => (
  <>
    {ORDER.map((pl, i) => {
      const s = CAP[pl.id];
      const next = ORDER.slice(i + 1).find((o) => o.zone === pl.zone);
      const nextStart = next ? CAP[next.id].start : Infinity;
      // stays on screen at least 10 frames after its last word
      const exitAt = Math.max(Math.min(nextStart - 0.04, pl.until ?? Infinity), s.end + 10 / FPS);
      if (t < s.start - 0.15 || t > exitAt + EXIT) return null;
      return <CaptionBlock key={pl.id} sentence={s} frame={frame} t={t} y={pl.y ?? ZONE_Y[pl.zone]} exitAt={exitAt} emo={pl.emo} />;
    })}
  </>
);
