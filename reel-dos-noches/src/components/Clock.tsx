import React from "react";
import { C, CLOCK_H, CLOCK_Y, PANEL_W, PANEL_X, S, SANS, TL, clamp01, drift, rgba, windowed, EASE } from "../theme";
import { IconMoon, IconSun } from "./Icons";

const NIGHT = TL.night;
const REWIND = 1.0; // E9: 08:00 → 21:00 backwards

const fmt = (mins: number) => {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));

/** Minutes since midnight shown by the shared clock at time t (fractional while it spins). */
export const clockMinutes = (t: number): number => {
  const SPIN = 0.32;
  // 21:00 → each night event → 08:00 next morning (minutes keep counting past midnight)
  const stops = [...NIGHT.map((e) => ({ t: e.t, m: toMin(e.clock) + (toMin(e.clock) < 720 ? 1440 : 0) })), { t: S.E6, m: 1440 + 8 * 60 }];
  let m = 21 * 60;
  for (const s of stops) {
    if (t >= s.t) {
      m = s.m;
    } else {
      if (t >= s.t - SPIN) m += (s.m - m) * EASE(clamp01((t - (s.t - SPIN)) / SPIN));
      break;
    }
  }
  // E9: rewinds from 08:00 back to 21:00 so the loop meets E1
  return m + (21 * 60 - m) * EASE(clamp01((t - S.E9 - 0.05) / REWIND));
};

export const clockText = (t: number) => fmt(clockMinutes(t));

export const Clock: React.FC<{ t: number; y?: number; scale?: number }> = ({ t, y = CLOCK_Y, scale = 1 }) => {
  const mins = clockMinutes(t);
  const text = fmt(mins);
  const spinning = Math.abs(clockMinutes(t + 1 / 30) - mins) > 0.5;
  const dawn = windowed(t, S.E6 + 0.15, 999, 0.6, 0.01) * (1 - windowed(t, S.E9 + 0.4, 999, 0.6, 0.01));
  // barrido de luz across the digits at 08:00
  const sweep = clamp01((t - S.E6 - 0.1) / 0.75);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
  const accent = dawn > 0.5 ? C.warm : C.white;
  return (
    <div style={{
      position: "absolute", left: PANEL_X, top: y, width: PANEL_W, height: CLOCK_H, scale: String(scale),
      borderRadius: 34, overflow: "hidden",
      background: `linear-gradient(180deg, rgba(8,22,18,0.92), rgba(4,14,11,0.96))`,
      border: `2px solid ${rgba(dawn > 0.5 ? C.warm : C.green, 0.18 + 0.1 * pulse)}`,
      boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 ${40 + 30 * dawn}px ${rgba(C.warm, 0.25 * dawn)}`,
      translate: `${drift(t, 21, 3)}px ${drift(t, 22, 2)}px`,
    }}>
      {/* moon / sun on the left */}
      <div style={{ position: "absolute", left: 40, top: 33, opacity: 0.9, rotate: `${drift(t, 23, 8)}deg` }}>
        <div style={{ position: "absolute", opacity: 1 - dawn }}><IconMoon size={64} color="#CFE0FF" stroke={2} /></div>
        <div style={{ position: "absolute", opacity: dawn }}><IconSun size={64} color={C.warm} stroke={2} /></div>
      </div>
      <div style={{
        position: "absolute", left: 128, top: 34, fontFamily: SANS, fontWeight: 800, fontSize: 26, lineHeight: 1.15,
        color: C.muted, letterSpacing: 2,
      }}>
        MISMA<br />NOCHE
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: -6, textAlign: "center", fontFamily: SANS, fontWeight: 800,
        fontSize: 124, letterSpacing: -3, color: accent, fontVariantNumeric: "tabular-nums",
        textShadow: `0 0 ${30 + 20 * pulse}px ${rgba(accent, 0.35)}`,
        filter: spinning ? "blur(1.2px)" : undefined,
      }}>{text}</div>
      {/* right side: tiny progress of the night */}
      <div style={{ position: "absolute", right: 40, top: 40, width: 150, height: 50 }}>
        {new Array(5).fill(0).map((_, i) => {
          const on = t >= (NIGHT[i]?.t ?? 999) ? 1 : 0;
          return (
            <div key={i} style={{
              position: "absolute", left: i * 32, top: 16, width: 18, height: 18, borderRadius: 18,
              background: on ? "#fff" : "rgba(255,255,255,0.16)", boxShadow: on ? "0 0 14px rgba(255,255,255,0.8)" : undefined,
              opacity: 1 - dawn * 0.4,
            }} />
          );
        })}
      </div>
      {sweep > 0 && sweep < 1 && (
        <div style={{
          position: "absolute", top: -20, bottom: -20, width: 260, left: -260 + sweep * (PANEL_W + 520),
          background: "linear-gradient(90deg, rgba(255,214,150,0) 0%, rgba(255,232,190,0.85) 50%, rgba(255,214,150,0) 100%)",
          rotate: "12deg",
        }} />
      )}
    </div>
  );
};
