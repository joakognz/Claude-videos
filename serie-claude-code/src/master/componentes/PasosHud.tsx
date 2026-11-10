/**
 * Pasos de un tutorial (desde "pasos" en el JSON): al empezar cada paso cae un sello «PASO N» con golpe en el centro
 * y vuela a su casilla de la fila de pasos (bajo los subtítulos); al completarse, la casilla se llena con un tick.
 * Va en coordenadas de pantalla, por encima de los bloques, así que sobrevive a las transiciones entre bloques.
 */
import React from "react";
import { C, EASE, EASE_IN, TITULO, clamp01, ramp, sp } from "../nucleo";
import type { Evento, Linea } from "../nucleo";
import type { EpisodioMaster } from "../tipos";

export type PasoT = { n: number; ini: number; fin: number };
export const tiemposPasos = (L: Linea, ep: EpisodioMaster): PasoT[] =>
  (ep.pasos ?? []).map((p) => ({ n: p.n, ini: L.ini(p.escena) - 0.05, fin: L.finDe(p.fin.escena, p.fin.en) + 0.05 }));

const PILL = { w: 168, h: 58, hueco: 14, y: 590 };
const STAMP = { x: 540, y: 1000 };

export const PasosHud: React.FC<{ t: number; pasos: PasoT[] }> = ({ t, pasos }) => {
  if (!pasos.length) return null;
  const a = pasos[0].ini;
  const b = pasos[pasos.length - 1].fin + 1.4;
  const op = ramp(t, a - 0.1, a + 0.3) * (1 - ramp(t, b - 0.4, b, EASE_IN));
  if (op <= 0.001) return null;
  const total = pasos.length * PILL.w + (pasos.length - 1) * PILL.hueco;
  const x0 = 540 - total / 2;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {pasos.map((p, i) => {
        const cx = x0 + i * (PILL.w + PILL.hueco) + PILL.w / 2;
        const activo = t >= p.ini && t < p.fin;
        const hecho = clamp01((t - p.fin) / 0.3);
        const llego = ramp(t, p.ini + 0.75, p.ini + 1.15, EASE);
        const visible = t >= p.ini + 0.75;
        return (
          <React.Fragment key={p.n}>
            {/* casilla */}
            <div
              style={{
                position: "absolute", left: cx - PILL.w / 2, top: PILL.y - PILL.h / 2, width: PILL.w, height: PILL.h, borderRadius: 999, boxSizing: "border-box",
                opacity: op * (visible ? 1 : 0.55), border: `3px solid ${activo || hecho > 0 ? C.acento : C.borde}`,
                background: hecho > 0 ? `color-mix(in srgb, ${C.acento} ${Math.round(hecho * 100)}%, ${C.panel})` : "rgba(20,24,33,0.92)",
                boxShadow: activo ? `0 0 ${18 + 8 * Math.sin(t * 6)}px ${C.acento}88` : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${1 + 0.15 * Math.sin(clamp01((t - p.fin) / 0.35) * Math.PI)})`,
                fontFamily: TITULO, fontWeight: 800, fontSize: 28, color: hecho > 0.5 ? C.oscuro : visible ? C.texto : C.gris, letterSpacing: 1,
              }}
            >
              {hecho > 0 ? (
                <svg width={30} height={30} viewBox="0 0 24 24">
                  <path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={C.oscuro} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - hecho)} />
                </svg>
              ) : null}
              PASO {p.n}
            </div>
            {/* sello grande que cae y vuela a su casilla */}
            {t >= p.ini && t < p.ini + 1.2 && (() => {
              const s = sp(t, p.ini, { damping: 11, stiffness: 230 });
              const esc = (1.9 - 0.9 * s) * (1 - 0.72 * llego);
              const x = STAMP.x + (cx - STAMP.x) * llego;
              const y = STAMP.y + (PILL.y - STAMP.y) * llego;
              const imp = t - p.ini;
              const sac = imp > 0.12 && imp < 0.45 ? Math.sin(imp * 70) * (0.45 - imp) * 18 : 0;
              return (
                <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
                  <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateX(${sac}px) scale(${esc}) rotate(${-4 * (1 - llego)}deg)`, opacity: Math.min(1, s * 2.5) * (1 - ramp(t, p.ini + 1.0, p.ini + 1.2)), whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 800, fontSize: 100, letterSpacing: 2, color: C.acento, padding: "18px 42px", borderRadius: 24, border: `8px solid ${C.acento}`, background: "rgba(11,13,18,0.9)", boxShadow: `0 0 60px ${C.acento}55` }}>
                    PASO {p.n}
                  </div>
                </div>
              );
            })()}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const eventosPasos = (L: Linea, ep: EpisodioMaster): Evento[] =>
  tiemposPasos(L, ep).flatMap((p) => [
    { t: p.ini + 0.1, sfx: "golpe" as const, vol: 0.55 },
    { t: p.fin, sfx: "tick" as const, vol: 0.6 },
  ]);
