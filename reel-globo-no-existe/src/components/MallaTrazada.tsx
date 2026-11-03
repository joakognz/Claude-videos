import React from "react";
import { C, EV, MONO, S, clamp01, ramp, springAt } from "../theme";

const REDRAW_DUR = 2.7;

/** Crown angle up to which the mesh is drawn: from the dimple outwards, vertex by vertex. */
export const redrawAngle = (t: number) => {
  if (t < EV.redraw || t > EV.redraw + REDRAW_DUR) return Infinity;
  const p = (t - EV.redraw) / REDRAW_DUR;
  return 0.005 + 2.2 * p ** 1.35;
};

const TAGS: { label: string; at: keyof typeof EV }[] = [
  { label: "GOMA", at: "goma" },
  { label: "AIRE", at: "aire" },
  { label: "FOTO", at: "foto" },
];

/** GOMA · AIRE · FOTO, each struck through in orange the moment the voice says it. */
export const EtiquetasTachadas: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.tagsIn - 0.05 || t >= S.S4) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1100, display: "flex", justifyContent: "center", gap: 34 }}>
      {TAGS.map((tag, i) => {
        const inAt = EV.tagsIn + i * 0.09;
        const sp = springAt(t, inAt, 14, 220);
        if (t < inAt) return <div key={tag.label} style={{ width: 200 }} />;
        const strike = ramp(t, EV[tag.at] + 0.04, EV[tag.at] + 0.22);
        return (
          <div key={tag.label} style={{
            width: 200, height: 76, position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${strike > 0 ? C.orange : C.grey}`, background: "rgba(5,5,5,0.78)", borderRadius: 6,
            fontFamily: MONO, fontWeight: 700, fontSize: 38, letterSpacing: 6, paddingLeft: 6,
            color: strike > 0.99 ? C.grey : C.white, translate: `0px ${(1 - clamp01(sp)) * 18}px`, opacity: clamp01(sp * 1.4),
          }}>
            {tag.label}
            <div style={{
              position: "absolute", left: 22, top: 35, height: 6, width: `${strike * 156}px`, background: C.orange,
              boxShadow: `0 0 12px ${C.orange}`, borderRadius: 3,
            }} />
          </div>
        );
      })}
    </div>
  );
};
