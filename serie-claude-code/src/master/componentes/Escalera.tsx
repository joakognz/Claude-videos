/**
 * Escalera de etapas (0 IDEA · 1 DESARROLLO · 2 STAGING · 3 PRODUCCIÓN).
 *  - Escalera: los peldaños en el lienzo, cada uno con su estado (aparece, encendido, hecho). La cámara sube por ellos.
 *  - EscaleraMini: marcador fijo arriba, entre la insignia y la marca de agua, mientras duran las etapas.
 */
import React from "react";
import { C, MONO, TITULO, UI, clamp01, ramp, sp } from "../nucleo";
import { Check } from "./Iconos";

export const NOMBRES_ETAPA = ["IDEA", "DESARROLLO", "STAGING", "PRODUCCIÓN"];

/** Geometría de la escalera en el lienzo (coordenadas de 1080 x 1920). */
export const ESC = { x0: 108, base: 1700, ancho: 215, alto: 185, px: 30, py: -26 };
export const peldano = (k: number, g = ESC) => {
  const left = g.x0 + k * g.ancho;
  const top = g.base - (k + 1) * g.alto;
  return { left, top, right: left + g.ancho, cx: left + g.ancho / 2, cy: top + 80, foco: { x: left + g.ancho / 2, y: top + 30 } };
};

export type EstadoPeldano = { aparece: number; activa: number; hecha: number; tenue?: number; latido?: number };

export const Escalera: React.FC<{ t: number; estado: (k: number) => EstadoPeldano; g?: typeof ESC; nombres?: string[] }> = ({ estado, g = ESC, nombres = NOMBRES_ETAPA }) => (
  <>
    {/* suelo */}
    <div style={{ position: "absolute", left: g.x0 - 80, top: g.base, width: g.ancho * 4 + 160, height: 4, borderRadius: 2, background: `linear-gradient(90deg, transparent, ${C.borde} 15%, ${C.borde} 85%, transparent)`, opacity: clamp01(estado(0).aparece * 2) }} />
    {[0, 1, 2, 3].map((k) => {
      const e = estado(k);
      if (e.aparece <= 0.001) return null;
      const p = peldano(k, g);
      const alto = g.base - p.top;
      const on = clamp01(e.activa);
      const hecha = clamp01(e.hecha);
      const tenue = 1 - 0.55 * clamp01(e.tenue ?? 0);
      const crece = clamp01(e.aparece);
      const lat = e.latido ?? 0;
      const borde = on > 0.05 ? C.acento : hecha > 0.5 ? `${C.acento}99` : C.borde;
      return (
        <div key={k} style={{ position: "absolute", left: p.left, top: p.top + g.py, width: g.ancho + g.px, height: alto - g.py, transformOrigin: "50% 100%", transform: `scaleY(${0.15 + 0.85 * crece}) scale(${1 + lat})`, opacity: Math.min(1, crece * 1.8) * tenue }}>
          <svg width={g.ancho + g.px} height={alto - g.py} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {/* cara lateral */}
            <path d={`M${g.ancho} ${-g.py} L${g.ancho + g.px} 0 L${g.ancho + g.px} ${alto} L${g.ancho} ${alto - g.py} Z`} fill={on > 0.05 ? "#5A3426" : "#141821"} stroke={borde} strokeWidth={3} strokeLinejoin="round" />
            {/* huella (cara de arriba) */}
            <path d={`M0 ${-g.py} L${g.px} 0 L${g.ancho + g.px} 0 L${g.ancho} ${-g.py} Z`} fill={on > 0.05 ? `color-mix(in srgb, ${C.acento} ${Math.round(on * 100)}%, #2A3140)` : hecha > 0.5 ? "#3A2A25" : "#2A3140"} stroke={borde} strokeWidth={3} strokeLinejoin="round" />
          </svg>
          {/* cara frontal */}
          <div
            style={{
              position: "absolute", left: 0, top: -g.py, width: g.ancho, height: alto, boxSizing: "border-box",
              background: on > 0.05 ? `linear-gradient(180deg, color-mix(in srgb, ${C.acento} ${Math.round(on * 30)}%, ${C.panel2}) 0%, ${C.panel} 100%)` : `linear-gradient(180deg, ${C.panel2} 0%, ${C.panel} 100%)`,
              border: `3px solid ${borde}`, boxShadow: on > 0.05 ? `0 0 ${60 * on}px ${C.acento}66` : "none",
            }}
          >
            <div style={{ position: "absolute", left: 0, right: 0, top: 6, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 118, lineHeight: 1, color: on > 0.05 || hecha > 0.5 ? C.acento : C.tenue }}>{k}</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 132, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 25, letterSpacing: 1.5, color: on > 0.05 ? C.texto : hecha > 0.5 ? C.acentoSuave : C.gris }}>{nombres[k]}</div>
          </div>
          {/* hecho: tick sobre la huella */}
          {hecha > 0 && (
            <div style={{ position: "absolute", left: g.ancho / 2 + g.px / 2 - 34, top: -g.py - 92, width: 68, height: 68, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(hecha * 2, 0, { damping: 10, stiffness: 200 })})`, boxShadow: `0 0 24px ${C.acento}AA` }}>
              <Check s={50} c={C.oscuro} p={clamp01(hecha * 1.6 - 0.3)} />
            </div>
          )}
        </div>
      );
    })}
  </>
);

/** Marcador mini de etapas, fijo arriba en el centro: cuatro peldaños; el actual late, los hechos llevan tick. */
export const EscaleraMini: React.FC<{ t: number; etapas: { n: number; desde: number; hasta: number; hecho: number }[] }> = ({ t, etapas }) => {
  const ini = etapas[0].desde;
  const fin = etapas[etapas.length - 1].hasta;
  const op = ramp(t, ini - 0.2, ini + 0.4) * (1 - ramp(t, fin - 0.2, fin + 0.3));
  if (op <= 0.001) return null;
  const actual = etapas.find((e) => t >= e.desde && t < e.hasta);
  const W = 46;
  const PASO = 17;
  const BASE = 26;
  const ALTO = BASE + 3 * PASO;
  return (
    <div style={{ position: "absolute", left: 560 - (4 * W) / 2, top: 326 - ALTO, width: 4 * W, height: ALTO, opacity: op }}>
      {[0, 1, 2, 3].map((k) => {
        const e = etapas.find((x) => x.n === k);
        const hecha = e ? clamp01((t - e.hecho) / 0.25) : 0;
        const on = actual?.n === k && hecha < 1 ? 1 : 0;
        const h = BASE + k * PASO;
        const pulso = e ? sp(t, e.hecho, { damping: 8, stiffness: 240 }) : 0;
        const lat = on ? 0.05 * Math.max(0, Math.sin(t * 5)) : 0;
        return (
          <div key={k} style={{ position: "absolute", left: k * W, bottom: 0, width: W - 3, height: h, borderRadius: "8px 8px 3px 3px", boxSizing: "border-box", transformOrigin: "50% 100%", transform: `scale(${1 + lat + (hecha > 0 ? Math.sin(Math.min(1, pulso) * Math.PI) * 0.2 : 0)})`, background: hecha > 0 ? C.acento : on ? "rgba(217,119,87,0.28)" : "rgba(27,32,43,0.95)", border: `3px solid ${on || hecha > 0 ? C.acento : C.borde}`, boxShadow: on ? `0 0 18px ${C.acento}AA` : "none" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {hecha > 0 ? <Check s={24} c={C.oscuro} trazo={7} p={hecha} /> : <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 19, lineHeight: 1, color: on ? C.texto : C.gris }}>{k}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
