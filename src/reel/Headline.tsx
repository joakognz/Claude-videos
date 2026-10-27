import React from "react";
import { clamp, COLORS, easeInCubic, easeOutCubic, prog, vis } from "./anim";
import { CUES, Cue, LABELS, Part, T } from "./timeline";
import { fontFamily } from "./fonts";
import { withSerifI } from "./ui";

const ENTER = 0.25;
const EXIT = 0.15;

const PartView: React.FC<{ p: Part; t: number; start: number; size: number }> = ({ p, t, start, size }) => {
  const at = p.at ?? start;
  const e = prog(t, at, ENTER, easeOutCubic);
  const style: React.CSSProperties = {
    display: "inline-block",
    opacity: e,
    filter: `blur(${(1 - e) * 14}px)`,
    translate: `0 ${(1 - e) * 26}px`,
    margin: "0 0.12em",
    whiteSpace: "nowrap",
  };
  if (!p.hl) return <span style={style}>{withSerifI(p.text)}</span>;
  const w = prog(t, at + 0.1, 0.32, easeOutCubic);
  const bg = p.hl === "amber" ? COLORS.amber : COLORS.lime;
  return (
    <span style={{ ...style, position: "relative", padding: "0 0.16em" }}>
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "0.08em",
          bottom: "0.02em",
          background: bg,
          borderRadius: size * 0.16,
          transformOrigin: "left center",
          scale: `${w} 1`,
          boxShadow: `0 0 ${size * 0.5}px ${bg}55`,
        }}
      />
      <span style={{ position: "relative", color: w > 0.55 ? COLORS.ink : COLORS.white, textShadow: w > 0.55 ? "none" : undefined }}>
        {withSerifI(p.text)}
      </span>
    </span>
  );
};

const CueView: React.FC<{ cue: Cue; t: number }> = ({ cue, t }) => {
  const out = prog(t, cue.end - EXIT, EXIT, easeInCubic);
  const size = cue.size ?? 96;
  const lines: Part[][] = [[]];
  cue.parts.forEach((p) => {
    if (p.br && lines[lines.length - 1].length) lines.push([]);
    lines[lines.length - 1].push(p);
  });
  if (cue.brand) {
    const e = prog(t, cue.start, ENTER + 0.15);
    return (
      <div
        style={{
          opacity: e * (1 - out),
          filter: `blur(${(1 - e) * 16 + out * 12}px)`,
          scale: `${0.92 + 0.08 * e}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          fontSize: 100,
          letterSpacing: "-0.03em",
        }}
      >
        <BrandMark size={92} t={t} start={cue.start} />
        <span>
          {withSerifI("AIgencyx")} <span style={{ color: COLORS.lime }}>Labs</span>
        </span>
      </div>
    );
  }
  return (
    <div
      style={{
        opacity: 1 - out,
        filter: `blur(${out * 12}px)`,
        translate: `0 ${-out * 18}px`,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: "-0.03em",
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>
          {l.map((p, j) => (
            <PartView key={j} p={p} t={t} start={cue.start} size={size} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const BrandMark: React.FC<{ size: number; t: number; start: number }> = ({ size, t, start }) => {
  const p = prog(t, start + 0.1, 0.5);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x={6} y={6} width={88} height={88} rx={24} fill={COLORS.lime} opacity={p} />
      <path d="M30 70 L50 28 L70 70 M38 56 H62" stroke={COLORS.ink} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={p} />
      <circle cx={74} cy={28} r={7} fill={COLORS.ink} opacity={p} />
    </svg>
  );
};

const Eyebrow: React.FC<{ t: number }> = ({ t }) => {
  const shown = vis(t, T.s3, T.s10, 0.3, 0.25);
  if (shown <= 0) return null;
  const idx = CUES.filter((c) => c.label).findIndex((c) => t >= c.start && t < c.end);
  const active = CUES.find((c) => c.label && t >= c.start && t < c.end);
  const e = active ? prog(t, active.start, 0.3) : 0;
  const out = active ? prog(t, active.end - 0.18, 0.18, easeInCubic) : 1;
  return (
    <div style={{ opacity: shown, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, marginBottom: 22 }}>
      <div style={{ display: "flex", gap: 10 }}>
        {LABELS.map((l, i) => {
          const on = i === idx ? 1 : i < idx ? 0.45 : 0.14;
          return (
            <div
              key={l}
              style={{
                width: i === idx ? 54 : 26,
                height: 7,
                borderRadius: 4,
                background: i <= idx ? COLORS.lime : "#FFFFFF",
                opacity: on,
                boxShadow: i === idx ? `0 0 16px ${COLORS.lime}` : "none",
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "0.34em",
          color: COLORS.lime,
          opacity: e * (1 - out),
          filter: `blur(${(1 - e) * 8 + out * 8}px)`,
          textShadow: `0 0 20px ${COLORS.lime}66`,
          paddingLeft: "0.34em",
        }}
      >
        {active?.label ?? ""}
      </div>
    </div>
  );
};

export const Headlines: React.FC<{ t: number }> = ({ t }) => {
  const cue = CUES.find((c) => t >= c.start && t < c.end);
  return (
    <div
      style={{
        position: "absolute",
        top: 262,
        left: 70,
        right: 70,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        color: COLORS.white,
        fontFamily,
        fontWeight: 800,
        textShadow: "0 6px 30px rgba(0,0,0,0.55)",
      }}
    >
      <Eyebrow t={t} />
      {cue ? <CueView key={cue.start} cue={cue} t={t} /> : null}
      {/* reservar espacio estable */}
      <div style={{ height: clamp(0) }} />
    </div>
  );
};
