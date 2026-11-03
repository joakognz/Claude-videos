import React from "react";
import { C, EV, MONO, S, clamp01, ramp, springAt } from "../theme";

const REDRAW_DUR = 2.7;

/** Height from the tips up to which the mesh is drawn: from the points outwards, vertex by vertex. */
export const redrawY = (t: number) => {
  if (t < EV.redraw || t > EV.redraw + REDRAW_DUR) return Infinity;
  const p = (t - EV.redraw) / REDRAW_DUR;
  return 0.002 + 5.6 * p ** 1.6;
};

const TAGS: { label: string; at: keyof typeof EV }[] = [
  { label: "MADERA", at: "madera" },
  { label: "GRAFITO", at: "grafito" },
  { label: "CÁMARA", at: "camara" },
];

/** MADERA · GRAFITO · CÁMARA, each struck through in orange the moment the voice says it. */
export const EtiquetasTachadas: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.tagsIn - 0.05 || t >= S.S4) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1100, display: "flex", justifyContent: "center", gap: 22 }}>
      {TAGS.map((tag, i) => {
        const inAt = EV.tagsIn + i * 0.09;
        const sp = springAt(t, inAt, 14, 220);
        if (t < inAt) return <div key={tag.label} style={{ width: 270 }} />;
        const strike = ramp(t, EV[tag.at] + 0.04, EV[tag.at] + 0.22);
        return (
          <div key={tag.label} style={{
            width: 270, height: 76, position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${strike > 0 ? C.orange : C.grey}`, background: "rgba(5,5,5,0.78)", borderRadius: 6,
            fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: 4, paddingLeft: 4,
            color: strike > 0.99 ? C.grey : C.white, translate: `0px ${(1 - clamp01(sp)) * 18}px`, opacity: clamp01(sp * 1.4),
          }}>
            {tag.label}
            <div style={{
              position: "absolute", left: 22, top: 35, height: 6, width: `${strike * 226}px`, background: C.orange,
              boxShadow: `0 0 12px ${C.orange}`, borderRadius: 3,
            }} />
          </div>
        );
      })}
    </div>
  );
};
