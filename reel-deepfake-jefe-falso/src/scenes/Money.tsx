import React from "react";
import { C, EV, MONO, UI, ramp, EASE_OUT, rnd } from "../theme";
import { Card } from "../components/UiBits";

const AccountIcon: React.FC<{ s: number; color?: string }> = ({ s, color = C.ink }) => (
  <svg width={s} height={s * 0.72} viewBox="0 0 50 36"><rect x={2} y={2} width={46} height={32} rx={6} fill="none" stroke={color} strokeWidth={4} /><circle cx={16} cy={18} r={6} fill={color} /><path d="M28 14h14M28 22h10" stroke={color} strokeWidth={4} strokeLinecap="round" /></svg>
);

/** 26.5–29.4: the transfers list fills row by row, five accounts, the odometer climbs to the total (orange = money leaving). */
export const Money: React.FC<{ t: number }> = ({ t }) => {
  const rows = 15;
  const v = Math.floor(25 * EASE_OUT(ramp(t, EV.odo0, EV.odo1)));
  const jump = (t - EV.odo0) % 0.09 < 0.045 && t > EV.odo0 && t < EV.odo1;
  const done = t >= EV.odo1;
  return (
    <>
      <div style={{ position: "absolute", left: 50, top: 668, fontFamily: UI, fontWeight: 700, fontSize: 36, letterSpacing: "0.1em", color: C.ink }}>TRANSFERENCIAS</div>
      {t >= EV.rows - 0.1 && <div style={{ position: "absolute", right: 56, top: 650, fontFamily: MONO, fontWeight: 700, fontSize: 72, color: C.ink, lineHeight: 1 }}>15</div>}
      <Card x={40} y={740} w={1000} h={rows * 31 + 18} style={{ borderRadius: 14 }}>
        {Array.from({ length: rows }, (_, i) => {
          const at = EV.rows + i * EV.rowStep;
          const p = ramp(t, at, at + 0.12);
          const y = 10 + i * 31;
          return (
            <div key={i} style={{ position: "absolute", left: 22, top: y, width: 950, height: 26 }}>
              <div style={{ position: "absolute", left: 0, top: 0 }}><AccountIcon s={36} color={p > 0 ? C.ink : C.border} /></div>
              <div style={{ position: "absolute", left: 60, top: 6, width: 600, height: 14, borderRadius: 7, background: C.border }} />
              <div style={{ position: "absolute", left: 60, top: 6, width: 600 * p, height: 14, borderRadius: 7, background: C.orange }} />
              <div style={{ position: "absolute", left: 690, top: 6, width: 160, height: 14, borderRadius: 7, background: p > 0.5 ? C.mid : C.border }} />
              <div style={{ position: "absolute", right: 0, top: 0, fontFamily: MONO, fontWeight: 700, fontSize: 26, lineHeight: "26px", color: C.orange, opacity: p > 0.8 ? 1 : 0 }}>→</div>
            </div>
          );
        })}
      </Card>
      <div style={{ position: "absolute", left: 40, top: 1250, width: 1000, display: "flex", gap: 16, alignItems: "center" }}>
        {Array.from({ length: 5 }, (_, i) => {
          const on = t >= EV.accounts + i * 0.1;
          return (
            <div key={i} style={{ flex: 1, height: 96, background: C.tile, border: `3px solid ${on ? C.ink : C.border}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", opacity: on ? 1 : 0.35 }}>
              <AccountIcon s={64} color={on ? C.ink : C.mid} />
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 40, top: 1370, width: 1000, height: 190, background: C.tile, border: `3px solid ${C.ink}`, borderRadius: 18, boxSizing: "border-box", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 30, top: 18, fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: "0.12em", color: C.mid }}>MÁS DE</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 36, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 124, lineHeight: 1.25, color: C.orange, whiteSpace: "nowrap",
          transform: `translateY(${jump ? -5 : 0}px)` }}>
          {t < EV.odo0 ? "0" : String(v).padStart(2, " ").replace(" ", " ")} M $
        </div>
        {jump && <div style={{ position: "absolute", inset: 0, background: C.orangeSoft, opacity: 0.25 + 0.2 * rnd(Math.floor(t * 100)) }} />}
        {done && <div style={{ position: "absolute", inset: 0, border: `8px solid ${C.orange}`, boxSizing: "border-box" }} />}
      </div>
    </>
  );
};
