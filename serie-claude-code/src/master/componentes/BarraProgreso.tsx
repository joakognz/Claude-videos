/** Barra de progreso fina pegada al borde superior: se llena con el reel (función del tiempo, sin transiciones CSS). */
import React from "react";
import { C, clamp01, ramp } from "../nucleo";

export const BarraProgreso: React.FC<{ t: number; duracion: number; alto?: number }> = ({ t, duracion, alto = 6 }) => {
  const p = clamp01(t / duracion);
  const entra = ramp(t, 0, 0.5);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: alto, opacity: entra }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.08)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, height: alto, width: 1080 * p, background: C.acento, boxShadow: `0 0 14px ${C.acento}` }} />
      {/* punta luminosa */}
      <div style={{ position: "absolute", left: 1080 * p - 5, top: -3, width: 10, height: alto + 6, borderRadius: 5, background: C.acentoSuave, opacity: p < 0.999 ? 0.9 : 0 }} />
    </div>
  );
};
