/** Flecha curva que se dibuja (trazo animado) y paquete de archivos que viaja por ella. */
import React from "react";
import { C, enCurva, largoCurva, tangente } from "../nucleo";
import type { Curva } from "../nucleo";

export const Flecha: React.FC<{ curva: Curva; p: number; color?: string; ancho?: number; opacity?: number; discontinua?: boolean; brillo?: number }> = ({
  curva, p, color = C.acento, ancho = 10, opacity = 1, discontinua = false, brillo = 0,
}) => {
  if (p <= 0) return null;
  const { a, c, b } = curva;
  const L = largoCurva(curva);
  const d = `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`;
  const punta = enCurva(curva, Math.min(1, p));
  const ang = (tangente(curva, Math.min(0.999, Math.max(0.001, p))) * 180) / Math.PI;
  const tp = Math.min(1, Math.max(0, (p - 0.05) / 0.2));
  const x0 = Math.min(a.x, b.x, c.x) - 60;
  const y0 = Math.min(a.y, b.y, c.y) - 60;
  const w = Math.max(a.x, b.x, c.x) - x0 + 60;
  const h = Math.max(a.y, b.y, c.y) - y0 + 60;
  return (
    <svg style={{ position: "absolute", left: x0, top: y0, overflow: "visible", opacity }} width={w} height={h} viewBox={`${x0} ${y0} ${w} ${h}`}>
      {brillo > 0 && <path d={d} fill="none" stroke={color} strokeWidth={ancho * 3.2} strokeLinecap="round" opacity={0.18 * brillo} strokeDasharray={L} strokeDashoffset={L * (1 - p)} />}
      {discontinua ? (
        <path d={d} fill="none" stroke={color} strokeWidth={ancho} strokeLinecap="round" strokeDasharray={`${ancho * 1.8} ${ancho * 2.2}`} opacity={p} />
      ) : (
        <path d={d} fill="none" stroke={color} strokeWidth={ancho} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} />
      )}
      <g transform={`translate(${punta.x} ${punta.y}) rotate(${ang}) scale(${tp})`}>
        <path d={`M ${ancho * 0.6} 0 L ${-ancho * 2.4} ${-ancho * 2.1} L ${-ancho * 1.6} 0 L ${-ancho * 2.4} ${ancho * 2.1} Z`} fill={color} stroke={color} strokeWidth={ancho * 0.5} strokeLinejoin="round" />
      </g>
    </svg>
  );
};
