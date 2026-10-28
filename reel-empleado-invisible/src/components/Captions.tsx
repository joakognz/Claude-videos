import React from "react";
import { C, EASE, EASE_OUT, FPS, S, SANS, clamp01, rise } from "../theme";

// Captions live between 10 % and 25 % of the height (192-480 px), clear of Instagram's UI.
const TOP = 206;
const SIZE = 78;

type Kind = "pos" | "neg";
/** One caption: lines of words; a word is [text, start, highlight?]. Consecutive highlighted words share one box. */
type Word = [string, number, Kind?];
type Cap = { lines: Word[][]; until: number; small?: { text: string; start: number } };

const CAPS: Cap[] = [
  { lines: [[["Tu", 0.35], ["mejor", 0.5], ["empleado", 0.68]], [["no", 1.75, "pos"], ["cobra", 1.75, "pos"], ["nómina", 1.75, "pos"]]], until: S.E2 - 0.1 },
  { lines: [[["Todo", 4.35], ["a", 4.6, "neg"], ["mano…", 4.6, "neg"]]], until: S.E3 - 0.1 },
  { lines: [[["Ahora", 10.75], ["imagina…", 11.0]]], until: S.E4 - 0.1 },
  { lines: [[["Tu", 14.3], ["empleado", 14.45]], [["invisible", 14.95, "pos"]]], until: S.E5 - 0.12 },
  { lines: [[["A", 19.15, "pos"], ["la", 19.15, "pos"], ["vez", 19.15, "pos"]]], until: S.E6 - 0.12 },
  { lines: [[["Tú,", 33.25]], [["a", 33.5], ["lo", 33.75, "pos"], ["importante", 33.75, "pos"]]], until: S.E8 - 0.12 },
  {
    lines: [[["Comenta", 38.2]], [["AUDITORIA", 38.55, "pos"]]],
    until: S.E9 - 0.05,
    small: { text: "y vemos qué podemos automatizar\nen tu negocio.", start: 39.2 },
  },
];
const OUT = 0.22;

/** Split a line into runs: plain words, or a group of consecutive highlighted words sharing one box. */
const runs = (line: Word[]) => {
  const out: { kind?: Kind; words: Word[] }[] = [];
  for (const w of line) {
    const last = out[out.length - 1];
    if (w[2] && last && last.kind === w[2]) last.words.push(w);
    else out.push({ kind: w[2], words: [w] });
  }
  return out;
};

const appear = (t: number, a: number) => rise(t, a - 2 / FPS, 0.22);

const Plain: React.FC<{ w: Word; t: number }> = ({ w, t }) => {
  const p = appear(t, w[1]);
  return <span style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>{w[0]}</span>;
};

/** Highlighter box that wipes in from the left: orange (text dark, glowing) or dark red (text white, flat). */
const Marked: React.FC<{ words: Word[]; kind: Kind; t: number }> = ({ words, kind, t }) => {
  const a = words[0][1];
  const p = appear(t, a);
  const hp = EASE_OUT(clamp01((t - a - 0.02) / 0.28));
  const pos = kind === "pos";
  const text = words.map((w) => w[0]).join(" ");
  const clean = text.replace(/[.,…]+$/, "");
  const tail = text.slice(clean.length);
  return (
    <span style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 24}px)`, whiteSpace: "nowrap" }}>
      <span style={{ position: "relative", display: "inline-block", padding: "0 0.16em", color: pos && hp > 0.5 ? C.ink : C.white }}>
        <span style={{
          position: "absolute", left: 0, right: 0, top: "0.06em", bottom: "0.02em", background: pos ? C.orange : C.red2,
          transform: `scaleX(${hp})`, transformOrigin: "left center", borderRadius: 8, zIndex: -1,
          boxShadow: pos ? `0 0 ${44 * hp}px rgba(255,107,26,0.6)` : "none",
        }} />
        {clean}
      </span>
      {tail}
    </span>
  );
};

const Block: React.FC<{ c: Cap; t: number }> = ({ c, t }) => {
  const q = EASE(clamp01((t - c.until) / OUT));
  const start = c.lines[0][0][1];
  const life = clamp01((t - start) / Math.max(1, c.until - start));
  return (
    <div style={{
      position: "absolute", left: 56, right: 56, top: TOP - q * 40, opacity: 1 - q, display: "flex", flexDirection: "column", alignItems: "center",
      transform: `scale(${1 + 0.035 * life})`, transformOrigin: "50% 0%",
    }}>
      {c.lines.map((line, li) => (
        <div key={li} style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.24em",
          fontFamily: SANS, fontWeight: 800, fontSize: SIZE, lineHeight: 1.16, letterSpacing: "-0.02em", color: C.white, textAlign: "center",
          textShadow: "0 4px 24px rgba(0,0,0,0.85)", isolation: "isolate",
        }}>
          {runs(line).map((r, i) => (r.kind ? <Marked key={i} words={r.words} kind={r.kind} t={t} /> : <Plain key={i} w={r.words[0]} t={t} />))}
        </div>
      ))}
      {c.small && (
        <div style={{
          marginTop: 18, fontFamily: SANS, fontWeight: 600, fontSize: 36, lineHeight: 1.25, color: "rgba(255,255,255,0.94)", textAlign: "center", whiteSpace: "pre-line",
          opacity: rise(t, c.small.start, 0.35), transform: `translateY(${(1 - rise(t, c.small.start, 0.35)) * 16}px)`,
          textShadow: "0 4px 20px rgba(0,0,0,0.9)",
        }}>
          {c.small.text}
        </div>
      )}
    </div>
  );
};

export const Captions: React.FC<{ t: number }> = ({ t }) => (
  <>
    {CAPS.map((c, i) => {
      if (t < c.lines[0][0][1] - 0.1 || t > c.until + OUT) return null;
      return <Block key={i} c={c} t={t} />;
    })}
  </>
);
