/** Rejilla de la serie: 50 casillas (10 x 5) con esquinas redondeadas. Anteriores encendidas, la actual late. */
import React from "react";
import { C, sp } from "../nucleo";

export type RejillaGeo = { cx: number; cy: number; celda: number; hueco: number; cols: number; filas: number };
export const GEO_REJILLA: RejillaGeo = { cx: 540, cy: 1060, celda: 74, hueco: 16, cols: 10, filas: 5 };

export const posCasilla = (g: RejillaGeo, n: number) => {
  const i = n - 1;
  const col = i % g.cols;
  const fila = Math.floor(i / g.cols);
  const paso = g.celda + g.hueco;
  const w = g.cols * g.celda + (g.cols - 1) * g.hueco;
  const h = g.filas * g.celda + (g.filas - 1) * g.hueco;
  return { x: g.cx - w / 2 + g.celda / 2 + col * paso, y: g.cy - h / 2 + g.celda / 2 + fila * paso, col, fila };
};

export type EstadoCasilla = { opacity: number; escala: number; encendida: number; latido: number; contorno: number; check: number };

export const Rejilla: React.FC<{
  g?: RejillaGeo;
  total: number;
  estado: (n: number) => EstadoCasilla;
}> = ({ g = GEO_REJILLA, total, estado }) => (
  <>
    {Array.from({ length: total }, (_, k) => {
      const n = k + 1;
      const { x, y } = posCasilla(g, n);
      const e = estado(n);
      if (e.opacity <= 0.001) return null;
      const r = g.celda * 0.22;
      const on = e.encendida;
      return (
        <div
          key={n}
          style={{
            position: "absolute", left: x - g.celda / 2, top: y - g.celda / 2, width: g.celda, height: g.celda, borderRadius: r,
            opacity: e.opacity, transform: `scale(${e.escala * (1 + e.latido)})`,
            background: on > 0 ? `color-mix(in srgb, ${C.acento} ${Math.round(on * 100)}%, ${C.panel2})` : C.panel2,
            border: `${Math.max(2, g.celda * 0.035)}px solid ${e.contorno > 0 ? C.acento : on > 0.5 ? C.acento : C.borde}`,
            boxShadow: on > 0 || e.contorno > 0 ? `0 0 ${g.celda * 0.5 * Math.max(on, e.contorno)}px ${C.acento}${on > 0.5 ? "AA" : "66"}` : "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {e.check > 0 && (
            <svg width={g.celda * 0.6} height={g.celda * 0.6} viewBox="0 0 24 24" style={{ opacity: Math.min(1, e.check * 2) }}>
              <path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={C.oscuro} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - e.check)} />
            </svg>
          )}
        </div>
      );
    })}
  </>
);

/** Entrada escalonada en ola (desde la esquina superior izquierda). */
export const olaEntrada = (t: number, at: number, g: RejillaGeo, n: number) => {
  const { col, fila } = posCasilla(g, n);
  const s = sp(t, at + (col + fila * 1.4) * 0.022, { damping: 12, stiffness: 190 });
  return { s, opacity: Math.min(1, s * 2) };
};
