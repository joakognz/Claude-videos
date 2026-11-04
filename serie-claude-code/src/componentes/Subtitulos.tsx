/** Subtítulos arriba (regla 2): palabra a palabra, y la que suena va dentro de un recuadro del color de acento. */
import React from "react";
import { TOP, UI, clamp01 } from "../tema";
import type { Chunk } from "../tipos";
import { useEstilo } from "./estilo";

export const SUB_Y = TOP + 100;
const SIZE = 74;

export const Subtitulos: React.FC<{ chunks: Chunk[]; t: number }> = ({ chunks, t }) => {
  const E = useEstilo();
  const c = chunks.find((ch) => t >= ch.inicio && t < ch.fin);
  if (!c) return null;
  const todas = c.lineas.flat();
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: SUB_Y, textAlign: "center" }}>
      {c.lineas.map((ln, i) => (
        <div key={i} style={{ fontFamily: UI, fontWeight: 700, fontSize: SIZE, lineHeight: 1.22, letterSpacing: -1.2, whiteSpace: "nowrap" }}>
          {ln.map((w, k) => {
            const idx = todas.indexOf(w);
            const sig = todas[idx + 1];
            const visible = t >= w.inicio - 0.03;
            const activa = visible && t < (sig ? sig.inicio - 0.02 : w.fin + 0.25);
            const p = clamp01((t - w.inicio + 0.03) / 0.1);
            return (
              <span key={k} style={{
                display: "inline-block", padding: "0px 14px", margin: "0px 1px", borderRadius: 14,
                background: activa ? E.acento : "rgba(0,0,0,0)", color: activa ? E.oscuro : E.texto,
                opacity: visible ? 1 : 0, scale: String(visible ? 0.86 + 0.14 * p : 1),
                textShadow: activa ? "none" : "0 4px 20px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
                boxShadow: activa ? `0 6px 26px ${E.acento}66` : "none",
              }}>{w.texto}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Degradado oscuro detrás de la franja superior (insignia + subtítulos) para que se lean sobre cualquier plano. */
export const VeloSuperior: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 740, background: "linear-gradient(180deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.9) 58%, rgba(0,0,0,0) 100%)", pointerEvents: "none" }} />
);
