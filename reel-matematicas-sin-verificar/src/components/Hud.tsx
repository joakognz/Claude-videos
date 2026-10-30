import React from "react";
import { Cam, F2W, project } from "../camera";
import { C, EASE, EV, MONO, S, clamp01, springAt, windowed } from "../theme";
import { rowPoint, sheetsRise, shiftAt } from "../world/Stage";

/** E3: a clock spins fast over the cube while the hours run 0 → 88. */
const Clock: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, EV.clock0 - 0.1, S.E4 - 0.05, 0.3, 0.3);
  if (o <= 0) return null;
  const p = EASE(clamp01((t - EV.clock0) / (EV.clock1 - EV.clock0)));
  const hours = Math.floor(p * 88);
  const done = p >= 1;
  const s = springAt(t, EV.clock0 - 0.1, 13, 190);
  // the hand turns once per "hour block" — fast
  const hand = p * 88 * 30;
  const R = 54;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", justifyContent: "center", alignItems: "center", gap: 30, opacity: o, scale: String(0.85 + 0.15 * s) }}>
      <svg width={R * 2 + 12} height={R * 2 + 12} viewBox={`${-R - 6} ${-R - 6} ${R * 2 + 12} ${R * 2 + 12}`} style={{ filter: "drop-shadow(0 0 14px rgba(255,107,26,0.6))" }}>
        <circle r={R} fill="rgba(20,17,15,0.8)" stroke={C.cream} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, k) => {
          const a = (k / 12) * Math.PI * 2;
          return <line key={k} x1={Math.sin(a) * (R - 10)} y1={-Math.cos(a) * (R - 10)} x2={Math.sin(a) * (R - 4)} y2={-Math.cos(a) * (R - 4)} stroke={C.cream} strokeWidth={3} opacity={0.6} />;
        })}
        {[1, 2, 3].map((k) => (
          // motion blur of the hand
          <line key={k} x1={0} y1={0} x2={0} y2={-R + 14} stroke={C.orange} strokeWidth={5} strokeLinecap="round" opacity={done ? 0 : 0.25 / k}
            transform={`rotate(${hand - k * 9})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-R + 14} stroke={C.orange} strokeWidth={5} strokeLinecap="round" transform={`rotate(${hand})`} />
        <circle r={6} fill={C.orange} />
      </svg>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 70, color: done ? C.orange : C.cream, minWidth: 250, textShadow: done ? "0 0 24px rgba(255,107,26,0.7)" : "0 2px 16px rgba(0,0,0,0.6)" }}>
        {String(hours).padStart(2, "0")} H
      </div>
    </div>
  );
};

/** E6–E7: lines joining each row of the written proof to its row in the Lean code; they stop lining up. */
const Connectors: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const r = sheetsRise(t);
  const o = windowed(t, EV.scrolls + 0.5, S.E8 + 0.05, 0.4, 0.3) * clamp01(r);
  if (o <= 0) return null;
  const lift = (1 - r) * 3.2;
  const shift = shiftAt(t);
  const slipped = t > EV.shift;
  const fade = 1 - 0.55 * EASE(clamp01((t - EV.leanOn) / 0.4));
  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o * fade }}>
      {rows.map((i, k) => {
        const a = project(F2W(rowPoint(-1, i, 0, lift)), cam);
        const b = project(F2W(rowPoint(1, i, shift, lift)), cam);
        const fl = slipped && Math.floor(t * 12 + k * 3) % 5 === 0 ? 0.3 : 1;
        const draw = clamp01((t - EV.scrolls - 0.5 - k * 0.05) / 0.3);
        return (
          <line key={i} x1={a[0] + 6} y1={a[1]} x2={a[0] + 6 + (b[0] - 6 - a[0] - 6) * draw} y2={a[1] + (b[1] - a[1]) * draw}
            stroke={C.cream} strokeWidth={2.5} strokeDasharray={slipped ? "6 7" : undefined} opacity={0.75 * fl} />
        );
      })}
    </svg>
  );
};

export const Hud: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <>
    <Clock t={t} />
    <Connectors t={t} cam={cam} />
  </>
);
