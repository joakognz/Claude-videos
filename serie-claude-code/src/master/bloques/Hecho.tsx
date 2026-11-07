/** Primera pregunta, «¿De qué está hecho?»: tarjeta verde y tres bloques que se montan: cara, motor y memoria. */
import React from "react";
import { Escena } from "../componentes/Escena";
import { IconCara, IconMemoria, IconMotor } from "../componentes/Iconos";
import { Sello } from "../componentes/Sello";
import { C, EASE_IN, TITULO, UI, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

export const VERDE = "#2FBF71";

const BLOQUES = [
  { id: "cara", titulo: "CARA", etiqueta: "FRONTEND", detalle: "Lo que ve el cliente", color: C.acento, Ic: IconCara, y: 960, ancla: "Frontend" },
  { id: "motor", titulo: "MOTOR", etiqueta: "BACKEND", detalle: "Lo que lo mueve todo", color: "#5B8DEF", Ic: IconMotor, y: 1190, ancla: "Backend" },
  { id: "memoria", titulo: "MEMORIA", etiqueta: "BASE DE DATOS", detalle: "Donde se guarda lo importante", color: "#E5B455", Ic: IconMemoria, y: 1420, ancla: "base" },
] as const;

const tiempos = (L: Linea) => ({
  primera: L.en("primera", "Primera"),
  de: L.en("primera", "de"),
  hecho: L.en("primera", "hecho"),
  bloques: BLOQUES.map((b) => L.en("hecho", b.ancla)),
  fin: L.fin("hecho"),
});

export const Hecho: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const out = hasta + 0.3;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1040, z: 0.9 },
    { t: T.de - 0.3, x: 540, y: 880, z: 1.02, d: 0.9 },
    ...BLOQUES.map((b, i) => ({ t: T.bloques[i] - 0.25, x: 540, y: b.y - 30, z: 1.04 + i * 0.01, d: 0.9 })),
    { t: T.fin - 0.9, x: 540, y: 1140, z: 0.86, d: 1.2 },
  ];
  const card = vis(t, desde + 0.1, out, 0.85);
  return (
    <Escena t={t} tomas={tomas}>
      {card.on && (
        <div style={{ position: "absolute", left: 70, top: 560, width: 940, height: 1050, borderRadius: 48, background: `linear-gradient(180deg, ${VERDE}26, ${C.panel} 38%)`, border: `4px solid ${VERDE}`, boxShadow: `0 40px 100px rgba(0,0,0,0.55), 0 0 60px ${VERDE}33`, opacity: card.opacity, transform: `scale(${card.scale})` }} />
      )}
      <Sello texto="PREGUNTA 1" x={290} y={628} t={t} at={T.primera} out={out} size={44} rot={-3} />
      {(() => {
        const v = vis(t, T.de - 0.05, out, 0.8);
        return v.on ? (
          <div style={{ position: "absolute", left: 540, top: 760, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, opacity: v.opacity, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 80, color: C.texto, whiteSpace: "nowrap", letterSpacing: -1.5 }}>
              ¿DE QUÉ ESTÁ <span style={{ color: VERDE }}>HECHO</span>?
            </div>
          </div>
        ) : null;
      })()}
      {BLOQUES.map((b, i) => {
        const at = T.bloques[i];
        if (t < at - 0.2) return null;
        const caida = sp(t, at - 0.1, { damping: 10, stiffness: 150, mass: 1.1 });
        const v = vis(t, at - 0.1, out, 0.9);
        const imp = Math.max(0, 1 - Math.abs(t - at - 0.28) * 6);
        return (
          <div key={b.id} style={{ position: "absolute", left: 120, top: b.y - 95, width: 840, height: 190, opacity: v.opacity, transform: `translateY(${(1 - caida) * -420}px) scale(${1 + imp * 0.03})`, borderRadius: 34, background: `linear-gradient(90deg, ${b.color}, color-mix(in srgb, ${b.color} 70%, #000))`, boxShadow: `0 ${14 + imp * 10}px 40px rgba(0,0,0,0.5)`, display: "flex", alignItems: "center", gap: 34, padding: "0 40px", boxSizing: "border-box" }}>
            <div style={{ width: 128, height: 128, borderRadius: 30, background: "rgba(11,13,18,0.82)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {b.id === "motor" ? <b.Ic s={90} color={b.color} giro={(t - at) * 60} /> : <b.Ic s={90} color={b.color} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 70, color: C.oscuro, letterSpacing: -1, lineHeight: 1 }}>{b.titulo}</div>
                <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 26, color: "rgba(11,13,18,0.7)", letterSpacing: 2 }}>{b.etiqueta}</div>
              </div>
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 36, color: C.oscuro, whiteSpace: "nowrap", opacity: ramp(t, at + 0.15, at + 0.45, EASE_IN) }}>{b.detalle}</div>
            </div>
          </div>
        );
      })}
    </Escena>
  );
};

export const eventosHecho = (L: Linea, _ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.primera, sfx: "golpe", vol: 0.45 },
    { t: T.de, sfx: "pop", vol: 0.35 },
    ...T.bloques.map((b) => ({ t: b + 0.25, sfx: "golpe" as const, vol: 0.4 })),
  ];
};
