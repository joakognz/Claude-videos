/** Barra de progreso fina arriba: se va llenando con el tiempo del reel. */
import React from "react";
import { C, clamp01 } from "../nucleo";

export const BarraProgreso: React.FC<{ t: number; duracion: number }> = ({ t, duracion }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 10, background: "rgba(255,255,255,0.08)" }}>
    <div style={{ width: `${clamp01(t / duracion) * 100}%`, height: "100%", background: C.acento, boxShadow: `0 0 14px ${C.acento}`, borderRadius: "0 6px 6px 0" }} />
  </div>
);
