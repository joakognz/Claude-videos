import React from "react";
import { C, EV, UI, MONO, ramp, EASE_OUT } from "../theme";
import { Card, Cross } from "../components/UiBits";
import { Silhouette, STRIP } from "../components/Tile";

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

/** 29.4–33.1: a week of boxes (no numerals) ticked off, then the notice to the company. */
export const Time: React.FC<{ t: number }> = ({ t }) => {
  const arrow = ramp(t, EV.alert, EV.alert + 0.5);
  const glow = t >= EV.company;
  return (
    <>
      <div style={{ position: "absolute", left: 50, top: 668, fontFamily: UI, fontWeight: 700, fontSize: 36, letterSpacing: "0.1em", color: C.ink }}>SEMANA</div>
      <div style={{ position: "absolute", left: 40, top: 740, width: 1000, display: "flex", gap: 8 }}>
        {DAYS.map((d, i) => {
          const at = EV.cells0 + i * EV.cellStep;
          const p = ramp(t, at, at + 0.2);
          return (
            <div key={i} style={{ position: "relative", width: 136, height: 230, background: C.tile, border: `3px solid ${p > 0 ? C.ink : C.border}`, borderRadius: 14, boxSizing: "border-box" }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 14, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 34, color: p > 0 ? C.mid : C.ink }}>{d}</div>
              <Cross x={22} y={70} w={90} h={130} p={p} width={11} />
            </div>
          );
        })}
      </div>
      <Card x={40} y={1030} w={420} h={330}><div style={{ position: "absolute", left: 0, top: 0, width: 414, height: 270 }}><Silhouette w={414} hh={270} color={C.dark} /></div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: STRIP, background: C.dark, color: C.tile, fontFamily: UI, fontWeight: 700, fontSize: 26, letterSpacing: "0.06em", display: "flex", alignItems: "center", paddingLeft: 20, borderRadius: "0 0 15px 15px" }}>EMPLEADO</div>
      </Card>
      <svg width={180} height={60} style={{ position: "absolute", left: 450, top: 1165 }}>
        <line x1={4} y1={30} x2={4 + 150 * EASE_OUT(arrow)} y2={30} stroke={C.orange} strokeWidth={10} strokeLinecap="round" />
        {arrow > 0.9 && <path d="M140 8l30 22-30 22" fill="none" stroke={C.orange} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
      <Card x={620} y={1030} w={420} h={330} style={{ border: `3px solid ${glow ? C.orange : C.border}` }}>
        <div style={{ position: "absolute", left: 40, top: 40, width: 340, height: 190, border: `5px solid ${C.ink}`, borderRadius: 16, boxSizing: "border-box" }}>
          <div style={{ position: "absolute", left: 28, top: 30, width: 70, height: 70, borderRadius: 35, background: C.mid }} />
          <div style={{ position: "absolute", left: 120, top: 40, width: 180, height: 14, borderRadius: 7, background: C.border }} />
          <div style={{ position: "absolute", left: 120, top: 72, width: 120, height: 14, borderRadius: 7, background: C.border }} />
          <div style={{ position: "absolute", left: 28, top: 124, width: 270, height: 14, borderRadius: 7, background: C.border }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: STRIP, background: glow ? C.orange : C.ink, color: C.tile, fontFamily: UI, fontWeight: 700, fontSize: 26, letterSpacing: "0.06em", display: "flex", alignItems: "center", paddingLeft: 20, borderRadius: "0 0 15px 15px" }}>EMPRESA</div>
      </Card>
      <div style={{ position: "absolute", left: 40, top: 1400, width: 1000, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 38, color: C.mid, letterSpacing: "0.1em" }}>{t >= EV.alert ? "AVISO →" : ""}</div>
    </>
  );
};
