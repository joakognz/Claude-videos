import React from "react";
import { spring } from "remotion";
import { C, FPS, S, SANS, SERIF, Sentence, TL, Word, clamp01, EASE } from "../theme";

type Placement = { id: string; y: number; until?: number };

const cap = TL.captions;
// order of on-screen narration captions and where they sit
const ORDER: Placement[] = [
  { id: "E1", y: 1488 }, { id: "E2", y: 1488 }, { id: "E3", y: 1488 }, { id: "E4", y: 1488, until: S.E5 },
  { id: "E6", y: 360 }, { id: "E7", y: 360 }, { id: "E8", y: 360 }, { id: "E9", y: 360 },
  { id: "E10", y: 360 }, { id: "E11", y: 360 }, { id: "E12", y: 360, until: S.E13 },
  { id: "E14", y: 1490, until: S.E15 },
];

// long sentences are split into pages of max two lines (display-word index where each new page starts)
const PAGES: Record<string, number[]> = { E3: [3], E12: [5], E13: [2], E14: [4] };

type Page = Placement & { sentence: Sentence; key: string; lift?: number };
const PAGED: Page[] = ORDER.flatMap((pl, i) => {
  const s = cap[pl.id];
  const cuts = [0, ...(PAGES[pl.id] ?? []), s.words.length];
  const pages = cuts.slice(0, -1).map((a, k) => {
    const words = s.words.slice(a, cuts[k + 1]);
    return { words, start: words[0].start, end: words[words.length - 1].end };
  });
  return pages.map((sentence, k) => ({
    ...pl, sentence, key: `${pl.id}-${k}`,
    until: k < pages.length - 1 ? pages[k + 1].start : pl.until ?? cap[ORDER[i + 1].id].start,
  }));
});

const EXIT = 10 / FPS;
const HOLD = 10 / FPS;
const SIZE = 72;
const LINE = SIZE * 1.12;

/** Rough line count at SIZE over the 940 px caption box (Montserrat 800 ≈ 21 chars per line). */
const lines = (s: Sentence) => {
  let n = 1;
  let cur = 0;
  for (const w of s.words) {
    const len = w.text.length + (w.kind === "key" ? 1 : 0);
    if (cur > 0 && cur + 1 + len > 21) {
      n++;
      cur = len;
    } else cur += (cur > 0 ? 1 : 0) + len;
  }
  return n;
};

// When the next caption starts before this one has had its 10 frames, it slides up one block
// (still fully readable) instead of overlapping the incoming words.
PAGED.forEach((pg, i) => {
  const nx = PAGED[i + 1];
  if (nx && nx.y === pg.y && pg.until !== undefined && pg.until < pg.sentence.end + HOLD) {
    pg.lift = ((lines(pg.sentence) + lines(nx.sentence)) / 2) * LINE + 18;
  }
});

const emoColor = (t: number) => (t < S.E3 ? C.cold : t < S.E4 ? C.red : C.accent);

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
      <span style={{ ...base, padding: `0 ${size * 0.22}px`, borderRadius: size * 0.2, background: C.accent, color: C.ink, boxShadow: `0 0 ${size * 0.5}px rgba(61,220,151,0.55)` }}>
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

const CaptionBlock: React.FC<{ sentence: Sentence; frame: number; t: number; y: number; exitAt: number; emo: string; liftAt?: number; lift?: number }> = ({
  sentence, frame, t, y, exitAt, emo, liftAt = 0, lift = 0,
}) => {
  const p = EASE(clamp01((t - exitAt) / EXIT));
  const up = lift * EASE(clamp01((t - liftAt) / (7 / FPS)));
  const size = SIZE;
  return (
    <div style={{
      position: "absolute", left: 70, right: 70, top: y - up, translate: `0px ${-50 - p * 90}%`,
      display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline",
      columnGap: size * 0.26, rowGap: size * 0.08, fontFamily: SANS, fontWeight: 800, fontSize: size,
      lineHeight: 1.12, color: C.white, textAlign: "center", opacity: 1 - p, filter: `blur(${p * 14}px)`,
      textShadow: "0 6px 30px rgba(0,0,0,0.55)",
    }}>
      {sentence.words.map((w, i) => (
        <AnimatedWord key={i} w={w} frame={frame} size={size} color={emo} />
      ))}
    </div>
  );
};

export const Captions: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  return (
    <>
      {PAGED.map((pl) => {
        const s = pl.sentence;
        // fully readable for at least 10 frames after the last word, then exits up with blur
        const liftAt = (pl.until ?? s.end) - (pl.lift ? 0.3 : 0.04);
        const exitAt = Math.max(liftAt, s.end + HOLD);
        if (t < s.start - 0.15 || t > exitAt + EXIT) return null;
        return (
          <CaptionBlock key={pl.key} sentence={s} frame={frame} t={t} y={pl.y} exitAt={exitAt} liftAt={liftAt} lift={pl.lift}
            emo={emoColor(cap[pl.key.split("-")[0]].start)} />
        );
      })}
    </>
  );
};
