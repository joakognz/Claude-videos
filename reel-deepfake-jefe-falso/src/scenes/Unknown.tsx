import React from "react";
import { C, EV, UI, ANTON, ramp } from "../theme";
import { Card } from "../components/UiBits";
import { Silhouette, STRIP } from "../components/Tile";

/** 33.1–36.4: the police have not said who it was, nor which company (pixelated, names hidden). */
export const Unknown: React.FC<{ t: number }> = ({ t }) => {
  const pe = ramp(t, EV.unkEmp - 0.1, EV.unkEmp + 0.5), pc = ramp(t, EV.unkCo - 0.1, EV.unkCo + 0.5);
  const cell = (p: number) => 6 + p * 56;
  const co = [0, 1, 2, 3].map((i) => i);
  return (
    <>
      <Card x={40} y={720} w={490} h={470}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 484, height: 410, overflow: "hidden" }}>
          <Silhouette w={484} hh={410} color={C.dark} pix={t >= EV.unkEmp - 0.1 ? cell(pe) : 0} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: STRIP, background: C.dark, borderRadius: "0 0 15px 15px", display: "flex", alignItems: "center", paddingLeft: 20 }}>
          <div style={{ width: 230, height: 20, background: C.mid }} />
        </div>
        {pe > 0.5 && <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: ANTON, fontSize: 220, color: C.orange, lineHeight: 1 }}>?</div>}
      </Card>
      <Card x={550} y={720} w={490} h={470}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 484, height: 410, overflow: "hidden" }}>
          <svg width={484} height={410}>
            <g>{co.map((i) => <rect key={i} x={70} y={90 + i * 52} width={i === 0 ? 120 : 340 - i * 40} height={20} fill={C.border} />)}</g>
            <circle cx={380} cy={140} r={70} fill={C.mid} />
            {pc > 0 && Array.from({ length: Math.ceil(484 / cell(pc)) * Math.ceil(410 / cell(pc)) }, (_, k) => {
              const n = Math.ceil(484 / cell(pc)), cs = cell(pc);
              const x = (k % n) * cs, y = Math.floor(k / n) * cs;
              return <rect key={k} x={x} y={y} width={cs} height={cs} fill={(k * 7 + Math.floor(k / n) * 3) % 3 === 0 ? C.mid : (k % 2 ? C.border : "#E2E2E2")} opacity={Math.min(1, pc * 1.6)} />;
            })}
          </svg>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: STRIP, background: C.ink, borderRadius: "0 0 15px 15px", display: "flex", alignItems: "center", paddingLeft: 20 }}>
          <div style={{ width: 230, height: 20, background: C.mid }} />
        </div>
        {pc > 0.5 && <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: ANTON, fontSize: 220, color: C.orange, lineHeight: 1 }}>?</div>}
      </Card>
      <div style={{ position: "absolute", left: 40, top: 1240, width: 1000, display: "flex", gap: 20, justifyContent: "center", alignItems: "center", fontFamily: UI, fontWeight: 700, fontSize: 40, letterSpacing: "0.1em", color: C.ink }}>
        <span style={{ padding: "10px 30px", border: `4px solid ${C.ink}`, background: C.tile }}>POLICÍA</span>
        <span style={{ color: C.mid }}>→</span>
        <span style={{ padding: "10px 30px", border: `4px solid ${C.mid}`, color: C.mid, background: C.tile }}>SIN DATOS</span>
      </div>
    </>
  );
};
