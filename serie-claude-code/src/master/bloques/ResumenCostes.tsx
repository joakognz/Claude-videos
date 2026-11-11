/**
 * Resumen de costes (escena resumen): tres filas que se marcan cuando la voz las dice: casi todo gratis (VS Code,
 * Node.js, extensiones), pagas Claude y el hosting (logos adjuntos), y las tres reglas, cada una con su tick.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Check, Extensiones } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Etiqueta } from "../componentes/Sello";
import { Tarjeta } from "../componentes/Tarjeta";
import { C, MONO, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea, e: string) => ({
  ini: L.ini(e),
  casi: L.en(e, "Casi"),
  gratis: L.en(e, "gratis,"),
  pagas: L.en(e, "pagas"),
  hosting: L.en(e, "hosting,"),
  tres: L.en(e, "tres"),
  evitan: L.en(e, "evitan"),
  sorpresas: L.en(e, "sorpresas."),
});

const FILAS = [
  { y: 860, h: 180 },
  { y: 1065, h: 180 },
  { y: 1345, h: 330 },
];
const REGLAS = ["EMPIEZA CON LO MÍNIMO", "EL MODELO ADECUADO", "VIGILA TU GASTO"];

const Tick: React.FC<{ x: number; y: number; t: number; at: number; s?: number }> = ({ x, y, t, at, s = 70 }) => {
  if (t < at) return null;
  return (
    <div style={{ position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, at, { damping: 10, stiffness: 230 })})`, boxShadow: `0 0 24px ${C.acento}99` }}>
      <Check s={s * 0.7} c={C.oscuro} trazo={7} p={clamp01((t - at) / 0.3)} />
    </div>
  );
};

export const ResumenCostes: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta, escenas }) => {
  const T = tiempos(L, escenas[0]);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1080, z: 0.96 },
    { t: T.tres - 0.3, x: 540, y: 1170, z: 1.04, d: 0.9 },
  ];
  const ticks = [T.gratis + 0.1, T.hosting + 0.1];
  const reglaTick = (k: number) => T.evitan + k * 0.2;
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="RESUMEN" x={540} y={660} t={t} at={T.ini} out={hasta} size={46} variante="borde" fuente="titulo" />
      {/* 1 · casi todo gratis */}
      <Tarjeta x={540} y={FILAS[0].y} w={880} h={FILAS[0].h} t={t} at={T.casi - 0.15} out={hasta} activa={ramp(t, ticks[0], ticks[0] + 0.3) * 0.6}>
        <div style={{ position: "absolute", left: 300, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto, whiteSpace: "nowrap" }}>CASI TODO GRATIS</div>
      </Tarjeta>
      <Logo src={ep.logos.vscode} x={130} y={FILAS[0].y} w={74} t={t} at={T.casi} out={hasta} sombra={false} />
      <Logo src={ep.logos.nodejs} x={228} y={FILAS[0].y} w={100} t={t} at={T.casi + 0.08} out={hasta} ficha="tarjeta" sombra={false} />
      {(() => {
        const v = vis(t, T.casi + 0.16, hasta, 0.4);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 300 - 36, top: FILAS[0].y - 36, opacity: v.opacity, transform: `scale(${v.scale})` }}>
            <Extensiones s={72} />
          </div>
        );
      })()}
      <Tick x={910} y={FILAS[0].y} t={t} at={ticks[0]} />

      {/* 2 · pagas Claude y el hosting */}
      <Tarjeta x={540} y={FILAS[1].y} w={880} h={FILAS[1].h} t={t} at={T.pagas - 0.15} out={hasta} activa={ramp(t, ticks[1], ticks[1] + 0.3) * 0.6}>
        <div style={{ position: "absolute", left: 270, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 31, color: C.texto, whiteSpace: "nowrap" }}>
          PAGAS CLAUDE <span style={{ color: C.gris, margin: "0 12px" }}>+</span> HOSTING
        </div>
      </Tarjeta>
      <Logo src={ep.logos.claude} x={130} y={FILAS[1].y} w={76} t={t} at={T.pagas} out={hasta} sombra={false} />
      <Logo src={ep.logos.hostinger} x={240} y={FILAS[1].y} w={120} t={t} at={T.pagas + 0.1} out={hasta} ficha="tarjeta" sombra={false} />
      <Tick x={910} y={FILAS[1].y} t={t} at={ticks[1]} />

      {/* 3 · las tres reglas, cada una con su tick */}
      <Tarjeta x={540} y={FILAS[2].y} w={880} h={FILAS[2].h} t={t} at={T.tres - 0.15} out={hasta} activa={ramp(t, T.sorpresas, T.sorpresas + 0.3) * 0.8}>
        <div style={{ position: "absolute", left: 40, top: 34, fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto }}>3 REGLAS</div>
        {REGLAS.map((r, k) => {
          const on = clamp01((t - reglaTick(k)) / 0.3);
          return (
            <div key={k} style={{ position: "absolute", left: 40, top: 110 + k * 68, display: "flex", alignItems: "center", gap: 18, opacity: ramp(t, T.tres + k * 0.1, T.tres + 0.3 + k * 0.1) }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, border: `3px solid ${on > 0 ? C.acento : C.borde}`, background: on > 0 ? C.acento : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + Math.sin(on * Math.PI) * 0.25})` }}>
                {on > 0 ? <Check s={40} c={C.oscuro} trazo={7} p={on} /> : <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.gris }}>{k + 1}</span>}
              </div>
              <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 32, color: on > 0 ? C.texto : C.gris, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{r}</span>
            </div>
          );
        })}
      </Tarjeta>
      <Tick x={890} y={FILAS[2].y} t={t} at={T.sorpresas + 0.05} s={110} />
    </Escena>
  );
};

export const eventosResumenCostes = (L: Linea, _ep: unknown, _b: unknown, escenas: string[]): Evento[] => {
  const T = tiempos(L, escenas[0]);
  return [
    { t: T.gratis + 0.1, sfx: "tick", vol: 0.4 },
    { t: T.hosting + 0.1, sfx: "tick", vol: 0.4 },
    ...[0, 1, 2].map((k) => ({ t: T.evitan + k * 0.2, sfx: "tick" as const, vol: 0.35 })),
    { t: T.sorpresas + 0.05, sfx: "golpe", vol: 0.35 },
  ];
};
