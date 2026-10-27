import React from "react";
import { COLORS, prog } from "./anim";

export const card: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(28,31,37,0.96), rgba(17,19,23,0.96))",
  border: "1.5px solid rgba(255,255,255,0.09)",
  borderRadius: 34,
  boxShadow: "0 30px 90px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
};

/** Entrada estándar: opacidad + desenfoque + desplazamiento, asentada en ~0.3 s. */
export const enter = (t: number, at: number, dy = 30, dur = 0.32): React.CSSProperties => {
  const e = prog(t, at, dur);
  return { opacity: e, filter: `blur(${(1 - e) * 12}px)`, translate: `0 ${(1 - e) * dy}px` };
};

export const Icon: React.FC<{ name: string; size?: number; color?: string; stroke?: number }> = ({
  name, size = 40, color = COLORS.lime, stroke = 5,
}) => {
  const p = { fill: "none", stroke: color, strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    calendar: (
      <>
        <rect x={14} y={20} width={72} height={66} rx={12} {...p} />
        <path d="M14 40 H86 M32 12 V28 M68 12 V28" {...p} />
        <path d="M34 62 l8 8 l16 -16" {...p} />
      </>
    ),
    bag: (
      <>
        <path d="M20 34 H80 L74 88 H26 Z" {...p} />
        <path d="M36 42 V28 a14 14 0 0 1 28 0 V42" {...p} />
      </>
    ),
    truck: (
      <>
        <path d="M8 26 H60 V70 H8 Z M60 42 H78 L92 56 V70 H60" {...p} />
        <circle cx={28} cy={76} r={9} {...p} />
        <circle cx={76} cy={76} r={9} {...p} />
      </>
    ),
    clock: (
      <>
        <circle cx={50} cy={52} r={36} {...p} />
        <path d="M50 32 V52 L64 62" {...p} />
      </>
    ),
    invoice: (
      <>
        <path d="M24 10 H64 L80 26 V90 H24 Z" {...p} />
        <path d="M36 44 H68 M36 58 H68 M36 72 H56" {...p} />
      </>
    ),
    chat: <path d="M14 22 H86 V68 H46 L28 84 V68 H14 Z" {...p} />,
    phone: <path d="M30 12 L42 14 L48 34 L38 42 C44 56 52 64 62 70 L70 60 L88 66 L88 80 C88 86 82 90 76 90 C42 86 14 58 12 24 C12 18 18 12 24 12 Z" {...p} />,
    globe: (
      <>
        <circle cx={50} cy={50} r={36} {...p} />
        <path d="M14 50 H86 M50 14 C32 32 32 68 50 86 C68 68 68 32 50 14" {...p} />
      </>
    ),
    check: <path d="M22 52 L42 72 L80 30" {...p} />,
    star: <path d="M50 10 L61 37 L90 39 L67 57 L75 86 L50 70 L25 86 L33 57 L10 39 L39 37 Z" {...p} />,
    moon: <path d="M64 14 A38 38 0 1 0 86 62 A30 30 0 1 1 64 14 Z" {...p} />,
    user: (
      <>
        <circle cx={50} cy={34} r={16} {...p} />
        <path d="M18 88 C20 64 34 56 50 56 C66 56 80 64 82 88" {...p} />
      </>
    ),
    fork: (
      <>
        <path d="M34 12 V40 C34 48 46 48 46 40 V12 M40 12 V88" {...p} />
        <path d="M66 12 C56 22 56 46 66 50 V88" {...p} />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", overflow: "visible" }}>
      {paths[name]}
    </svg>
  );
};

export const Bubble: React.FC<{ side: "in" | "out"; children: React.ReactNode; style?: React.CSSProperties }> = ({ side, children, style }) => (
  <div
    style={{
      alignSelf: side === "in" ? "flex-start" : "flex-end",
      maxWidth: "82%",
      padding: "18px 24px",
      borderRadius: 28,
      borderBottomLeftRadius: side === "in" ? 8 : 28,
      borderBottomRightRadius: side === "out" ? 8 : 28,
      background: side === "in" ? "#262A31" : COLORS.lime,
      color: side === "in" ? COLORS.white : COLORS.ink,
      fontSize: 29,
      fontWeight: 600,
      lineHeight: 1.25,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Typing: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ alignSelf: "flex-end", display: "flex", gap: 8, padding: "20px 24px", borderRadius: 28, background: "#2D3A12" }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          background: COLORS.lime,
          opacity: 0.4 + 0.6 * Math.max(0, Math.sin(t * 12 - i * 0.9)),
          translate: `0 ${-5 * Math.max(0, Math.sin(t * 12 - i * 0.9))}px`,
        }}
      />
    ))}
  </div>
);

/** "I" mayúscula con remates: en Inter la I y la l son casi iguales ("AIgencyx", "IA"). */
export const SerifI: React.FC = () => (
  <span style={{ display: "inline-block", position: "relative", width: "0.4em", height: "0.727em", verticalAlign: "baseline" }}>
    <span style={{ position: "absolute", left: "0.145em", width: "0.11em", top: 0, bottom: 0, background: "currentColor" }} />
    <span style={{ position: "absolute", left: "0.04em", right: "0.04em", top: 0, height: "0.1em", background: "currentColor" }} />
    <span style={{ position: "absolute", left: "0.04em", right: "0.04em", bottom: 0, height: "0.1em", background: "currentColor" }} />
  </span>
);

/** Sustituye la I mayúscula en palabras con minúsculas o en "IA". */
export const withSerifI = (text: string): React.ReactNode =>
  text.split(/(\s+)/).map((word, wi) => {
    const needs = /^IA[.,]?$/.test(word) || (/I/.test(word) && /[a-záéíóúñ]/.test(word));
    if (!needs) return word;
    return (
      <React.Fragment key={wi}>
        {word.split("I").map((chunk, ci) => (
          <React.Fragment key={ci}>
            {ci > 0 ? <SerifI /> : null}
            {chunk}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  });
