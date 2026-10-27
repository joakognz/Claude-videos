import React from "react";
import { spring } from "remotion";
import { BOT_Y, C, FPS, PANEL_X, S, SANS, TL, TOP_Y, clamp01, drift, rgba, windowed, EASE, EASE_OUT } from "../theme";
import { ZONE_Y } from "./Captions";
import { IconCheck, IconVoicemail } from "./Icons";
import { BOOKED, LOST } from "./Feed";

const N = TL.night;
const countAt = (t: number, key: "lost" | "booked") => N.filter((e) => t >= e[key]).length;
const lastAt = (t: number, key: "lost" | "booked") => {
  const done = N.filter((e) => t >= e[key]);
  return done.length ? done[done.length - 1][key] : -99;
};
// counters and cards live through the night and leave when the alarm rings
const nightO = (t: number) => windowed(t, S.E5 + 0.1, S.E6 + 0.15, 0.4, 0.4);

const Chip: React.FC<{ label: string; n: number; color: string; bump: number; dim?: boolean }> = ({ label, n, color, bump, dim }) => (
  <div style={{
    display: "flex", alignItems: "baseline", gap: 12, padding: "10px 24px", borderRadius: 22,
    background: dim ? "rgba(255,255,255,0.06)" : rgba(color, 0.14), border: `3px solid ${dim ? "rgba(255,255,255,0.18)" : rgba(color, 0.8)}`,
    fontFamily: SANS, fontWeight: 800, fontSize: 46, color: dim ? "rgba(255,255,255,0.45)" : C.white, scale: String(1 + 0.12 * bump),
    boxShadow: dim ? undefined : `0 0 ${20 + 30 * bump}px ${rgba(color, 0.35 + 0.3 * bump)}`,
  }}>
    {label}
    <span style={{ fontSize: 58, color: dim ? "rgba(255,255,255,0.5)" : color, fontVariantNumeric: "tabular-nums" }}>{n}</span>
  </div>
);

export const NightCounters: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const o = nightO(t);
  if (o <= 0) return null;
  const bump = (key: "lost" | "booked") => {
    const f0 = lastAt(t, key) * FPS;
    const s = spring({ frame: frame - f0, fps: FPS, config: { damping: 9, stiffness: 200 } });
    return frame >= f0 ? Math.sin(Math.min(1, s) * Math.PI) : 0;
  };
  const enter = EASE_OUT(clamp01((t - S.E5 - 0.1) / 0.5));
  const row: React.CSSProperties = {
    position: "absolute", left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22, opacity: o,
    translate: `0px ${-50 + (1 - enter) * 30}%`,
  };
  return (
    <>
      <div style={{ ...row, top: ZONE_Y.top + drift(t, 91, 3) }}>
        <Chip label="sin responder:" n={countAt(t, "lost")} color={C.red} bump={bump("lost")} />
        <Chip label="reservas:" n={0} color="#888" bump={0} dim />
      </div>
      <div style={{ ...row, top: ZONE_Y.bottom + drift(t, 92, 3) }}>
        <Chip label="reservas:" n={countAt(t, "booked")} color={C.green} bump={bump("booked")} />
      </div>
    </>
  );
};

/** One card per event next to each phone; the previous card lifts away when the next arrives. */
export const NightCards: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const o = nightO(t);
  if (o <= 0) return null;
  return (
    <>
      {(["top", "bottom"] as const).map((side) =>
        N.map((e, k) => {
          const top = side === "top";
          const at = top ? e.lost : e.booked;
          if (t < at - 0.05) return null;
          const next = N[k + 1] ? (top ? N[k + 1].lost : N[k + 1].booked) : Infinity;
          const leave = EASE(clamp01((t - next) / 0.4));
          if (leave >= 1) return null;
          const s = spring({ frame: frame - at * FPS, fps: FPS, config: { damping: 13, stiffness: 160 } });
          const pulse = top ? 0 : windowed(t, at, at + 1.0, 0.05, 0.7);
          const call = e.kind === "call";
          const title = top ? (call ? "Llamada perdida" : LOST[k].title) : `${BOOKED[k].title} · reservada`;
          const Icon = top ? (call ? IconVoicemail : LOST[k].icon) : IconCheck;
          const sub = top ? (call ? "→ buzón de voz" : "sin respuesta") : null;
          return (
            <div key={side + k} style={{
              position: "absolute", right: PANEL_X + 22, top: (top ? TOP_Y : BOT_Y) + 296, height: 112, borderRadius: 28,
              display: "flex", alignItems: "center", gap: 18, padding: "0 28px 0 18px", boxSizing: "border-box",
              background: top ? "rgba(26,24,30,0.9)" : "rgba(6,28,19,0.92)",
              border: top ? `3px solid ${rgba(C.redDim, 0.55)}` : `3px solid ${C.green}`,
              boxShadow: top ? "0 18px 40px rgba(0,0,0,0.5)" : `0 18px 40px rgba(0,0,0,0.5), 0 0 ${20 + 50 * pulse}px ${rgba(C.green, 0.3 + 0.4 * pulse)}`,
              fontFamily: SANS, whiteSpace: "nowrap", opacity: o * clamp01(s * 1.5) * (1 - leave),
              translate: `${(1 - s) * 60 + drift(t, 95 + k, 4)}px ${-leave * 120}px`,
              scale: String((0.85 + 0.15 * s) * (1 + 0.05 * pulse)), filter: `blur(${leave * 10}px)`, transformOrigin: "100% 50%",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
                background: top ? rgba(C.redDim, 0.25) : C.green, flexShrink: 0,
              }}>
                <Icon size={46} color={top ? "#E9A3A5" : C.ink} stroke={2.6} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 44, color: top ? "rgba(255,255,255,0.78)" : C.white, lineHeight: 1.05 }}>{title}</div>
                {sub && <div style={{ fontWeight: 700, fontSize: 28, color: "#E9A3A5", marginTop: 2 }}>{sub}</div>}
              </div>
            </div>
          );
        }),
      )}
    </>
  );
};
