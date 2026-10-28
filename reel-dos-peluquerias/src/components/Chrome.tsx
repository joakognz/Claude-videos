import React from "react";
import { C, EASE, MONO, S, clamp01, windowed } from "../theme";

/** Instagram glyph (outline), drawn in currentColor. */
export const IgGlyph: React.FC<{ size: number; stroke?: number }> = ({ size, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden="true">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
    <circle cx="12" cy="12" r="4.4" />
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

/** Instagram app icon with its gradient. */
export const IgIcon: React.FC<{ size: number }> = ({ size }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.27, color: C.white, display: "flex", alignItems: "center", justifyContent: "center",
    background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
    boxShadow: `0 ${size * 0.12}px ${size * 0.4}px rgba(214,36,159,0.35)`,
  }}>
    <IgGlyph size={size * 0.72} stroke={2.1} />
  </div>
);

const STAGES: [string, number][] = [["RESERVA", S.E5], ["AGENDA", S.E6], ["ESPERA", S.E8], ["PUNTOS", S.E10]];
const BAR_IN = S.E5 - 0.35;
const BAR_OUT = S.E12 + 0.35;

/** Top-left progress bar: RESERVA · AGENDA · ESPERA · PUNTOS (active stage in orange). */
export const Progress: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, BAR_IN, BAR_OUT, 0.4, 0.4);
  if (o <= 0) return null;
  const active = STAGES.reduce((acc, [, at], i) => (t >= at ? i : acc), 0);
  const fill = clamp01((t - S.E5) / (S.E12 - S.E5));
  return (
    <div style={{ position: "absolute", left: 64, top: 252, opacity: o, translate: `${(1 - o) * -30}px 0px` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontWeight: 700, fontSize: 21, letterSpacing: 3.5 }}>
        {STAGES.map(([name, at], i) => {
          const on = i === active;
          const k = EASE(clamp01((t - at) / 0.25));
          return (
            <React.Fragment key={name}>
              {i > 0 && <span style={{ color: "#4a4a4a" }}>·</span>}
              <span style={{
                color: on ? C.orange : i < active ? "#7a7a7a" : "#555555",
                textShadow: on ? `0 0 ${16 * k}px rgba(255,122,0,0.7)` : "none",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                {on && <span style={{ width: 9, height: 9, background: C.orange, display: "inline-block", scale: String(k), boxShadow: "0 0 10px #FF7A00" }} />}
                {name}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ marginTop: 10, width: 560, height: 3, background: "#2a2a2a", borderRadius: 2 }}>
        <div style={{ width: `${fill * 100}%`, height: "100%", background: C.orange, borderRadius: 2, boxShadow: "0 0 10px rgba(255,122,0,0.8)" }} />
      </div>
    </div>
  );
};

/** Darkens the top of the frame so the captions always read. */
export const TopShade: React.FC = () => (
  <div style={{
    position: "absolute", left: 0, right: 0, top: 0, height: 760,
    background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.18) 75%, rgba(0,0,0,0) 100%)",
  }} />
);
