/** «Hoy vemos qué es un proyecto…»: título del episodio y tres iconos (proyecto, base, construir) que entran con la voz. */
import React from "react";
import { Escena } from "../componentes/Escena";
import { IconBase, IconCarpetaPlana, IconCubo } from "../componentes/Iconos";
import { Etiqueta } from "../componentes/Sello";
import { C, TITULO, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

const ID = "hoy";
const tiempos = (L: Linea) => ({
  hoy: L.en(ID, "Hoy"),
  que: L.en(ID, "qué"),
  proyecto: L.en(ID, "proyecto"),
  base: L.en(ID, "base"),
  construir: L.en(ID, "construir"),
});

const ICONOS = [
  { Ic: IconCarpetaPlana, x: 190, at: "proyecto" },
  { Ic: IconBase, x: 540, at: "base" },
  { Ic: IconCubo, x: 890, at: "construir" },
] as const;

export const Hoy: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1060, z: 0.92 },
    { t: T.proyecto - 0.3, x: 540, y: 1100, z: 1.0, d: 1.0 },
    { t: T.construir - 0.2, x: 540, y: 1180, z: 1.08, d: 1.2 },
  ];
  const out = hasta + 0.3;
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="HOY" x={540} y={760} t={t} at={T.hoy - 0.05} out={out} size={44} variante="acento" fuente="titulo" />
      {[
        { txt: "QUÉ ES", at: T.que, y: 900, col: C.texto },
        { txt: "UN PROYECTO", at: T.proyecto - 0.1, y: 1010, col: C.acento },
      ].map((l) => {
        const v = vis(t, l.at - 0.05, out, 0.8);
        return v.on ? (
          <div key={l.txt} style={{ position: "absolute", left: 540, top: l.y, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, opacity: v.opacity, fontFamily: TITULO, fontWeight: 800, fontSize: 118, color: l.col, whiteSpace: "nowrap", letterSpacing: -2 }}>{l.txt}</div>
          </div>
        ) : null;
      })}
      {ICONOS.map(({ Ic, x, at }, i) => {
        const a = L.en(ID, at);
        const v = vis(t, a - 0.05, out, 0.3);
        if (!v.on) return null;
        const flota = Math.sin((t - a) * 2.4 + i) * 6;
        return (
          <div key={at} style={{ position: "absolute", left: x - 125, top: 1290 - 125 + flota, width: 250, height: 250, borderRadius: 56, background: C.panel, border: `4px solid ${i === 0 ? C.acento : C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `scale(${v.scale}) rotate(${(1 - v.s) * -10}deg)`, boxShadow: i === 0 ? `0 0 ${50 * ramp(t, a, a + 0.5)}px ${C.acento}77` : "none" }}>
            <Ic s={150} color={i === 0 ? C.acento : C.texto} />
          </div>
        );
      })}
      {[0, 1].map((i) => {
        const v = vis(t, L.en(ID, i ? "construir" : "base") - 0.15, out, 0.4);
        return v.on ? (
          <div key={i} style={{ position: "absolute", left: 365 + i * 350 - 30, top: 1290 - 24, opacity: v.opacity * 0.9, fontFamily: TITULO, fontWeight: 800, fontSize: 56, color: C.gris }}>→</div>
        ) : null;
      })}
      {/* barra de luz bajo los iconos */}
      <div style={{ position: "absolute", left: 90, top: 1470, width: 900 * sp(t, T.proyecto, { damping: 20, stiffness: 60 }), height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${C.acento}, transparent)` }} />
    </Escena>
  );
};

export const eventosHoy = (L: Linea, _ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.hoy - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.proyecto - 0.05, sfx: "pop", vol: 0.45 },
    { t: T.base - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.construir - 0.05, sfx: "pop", vol: 0.4 },
  ];
};
