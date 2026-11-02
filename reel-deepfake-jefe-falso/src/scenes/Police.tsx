import React from "react";
import { C, EV, MONO, UI } from "../theme";
import { Card, BarLines } from "../components/UiBits";
import { Silhouette } from "../components/Tile";

/** 6.5–10.4: the police briefing (true → gray and white). */
export const Police: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Card x={40} y={680} w={1000} h={800} style={{ overflow: "hidden", background: C.room }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 994, height: 740, background: C.tile }}>
        <Silhouette w={994} hh={740} color={C.dark} />
        {/* podium + two generic microphones */}
        <div style={{ position: "absolute", left: 340, top: 540, width: 314, height: 200, background: C.ink }} />
        <div style={{ position: "absolute", left: 410, top: 500, width: 8, height: 50, background: C.mid }} />
        <div style={{ position: "absolute", left: 576, top: 500, width: 8, height: 50, background: C.mid }} />
        <div style={{ position: "absolute", left: 404, top: 478, width: 20, height: 28, borderRadius: 10, background: C.ink }} />
        <div style={{ position: "absolute", left: 570, top: 478, width: 20, height: 28, borderRadius: 10, background: C.ink }} />
        {t >= EV.policeLabel && (
          <div style={{ position: "absolute", left: 30, top: 28, padding: "6px 22px", background: C.ink, color: C.tile, fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: "0.12em" }}>POLICÍA</div>
        )}
        {t >= EV.feb && (
          <div style={{ position: "absolute", right: 30, top: 28, padding: "6px 22px", border: `4px solid ${C.ink}`, background: C.tile, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.ink }}>
            FEB{t >= EV.year ? " 2024" : ""}
          </div>
        )}
      </div>
      {t >= EV.hk && (
        <div style={{ position: "absolute", left: 0, bottom: 0, width: 994, height: 60, background: C.ink, color: C.tile, display: "flex", alignItems: "center", paddingLeft: 30, fontFamily: UI, fontWeight: 700, fontSize: 32, letterSpacing: "0.14em" }}>
          HONG KONG · RUEDA DE PRENSA
        </div>
      )}
    </Card>
    <BarLines x={60} y={1510} w={960} n={3} />
  </>
);
