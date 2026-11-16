/**
 * EP.11 · Otros negocios (escena otros): LA MISMA BASE → la portada gira y pasa de panadería a peluquería y a taller
 * (cambian textos, icono y colores) → TEXTOS y COLORES → la cámara se aleja y aparecen muchas variantes alrededor →
 * sello VARIANTES INFINITAS.
 * Resumen (escena resumen): los cuatro pasos en fila, cada uno se enciende con la voz.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { IcoLupa, Pieza, Pildora } from "../../componentes/ep08/Dibujos";
import { Copa, WebMini } from "../../componentes/ep11/Panaderia";
import type { Estilo } from "../../componentes/ep11/Panaderia";
import { C, EASE, TITULO, clamp01, ramp, sp } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "otros";
const tiempos = (L: Linea) => ({
  mejor: L.en(E, "mejor"),
  base: L.en(E, "base"),
  otros: L.en(E, "otros"),
  cambia: L.en(E, "Cambia"),
  peluqueria: L.en(E, "peluquería"),
  taller: L.en(E, "taller"),
  adapta: L.en(E, "adapta"),
  textos: L.en(E, "textos"),
  colores: L.en(E, "colores"),
  variantes: L.en(E, "Variantes"),
  infinitas: L.en(E, "infinitas"),
  fin: L.fin(E),
});

const ESTILOS: Estilo[] = ["clasica", "moderna", "minimalista"];
const NEG = ["panaderia", "peluqueria", "taller"];

export const Otros: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const cambios = [T.peluqueria - 0.1, T.taller - 0.1];
  // giro de la tarjeta en cada cambio: escala horizontal 1 → 0 → 1, y en el centro cambia de negocio
  const giro = cambios.reduce((g, c) => {
    const u = (t - c) / 0.45;
    return u > 0 && u < 1 ? Math.abs(Math.cos(u * Math.PI)) : g;
  }, 1);
  const k = t < cambios[0] + 0.225 ? 0 : t < cambios[1] + 0.225 ? 1 : 2;
  const negocio = NEG[k];
  const paleta = ["minimalista", "peluqueria", "taller"][k];
  const aleja = ramp(t, T.variantes - 0.3, T.infinitas + 0.6, EASE);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1130, z: 1.04 },
    { t: T.cambia - 0.3, x: 540, y: 1140, z: 1.08, d: 0.9 },
    { t: T.adapta - 0.3, x: 540, y: 1170, z: 1.0, d: 0.9 },
    { t: T.variantes - 0.3, x: 540, y: 1080, z: 0.42, d: 1.6 },
  ];
  // rejilla de variantes alrededor (7 columnas x 7 filas, sin la del centro)
  const celdas: { x: number; y: number; d: number; i: number }[] = [];
  for (let c = -3; c <= 3; c++) for (let f = -3; f <= 3; f++) if (c || f) celdas.push({ x: 540 + c * 400, y: 1080 + f * 520, d: Math.hypot(c, f * 1.1), i: celdas.length });
  return (
    <>
      <Escena t={t} tomas={tomas}>
        {aleja > 0 &&
          celdas.map((c) => {
            const a = clamp01(aleja * 4.2 - c.d * 0.9);
            if (a <= 0) return null;
            const est = ESTILOS[c.i % 3];
            const pal = ["clasica", "moderna", "minimalista", "peluqueria", "taller"][(c.i * 7) % 5];
            const neg = NEG[(c.i * 5) % 3];
            return (
              <div key={c.i} style={{ position: "absolute", left: c.x, top: c.y, width: 0, height: 0, opacity: a * (1 - 0.12 * c.d) }}>
                <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * a}) rotate(${((c.i % 5) - 2) * 3}deg)` }}>
                  <WebMini w={330} maqueta={est} paleta={pal} negocio={neg} menu={ESTILOS[(c.i + 1) % 3]} />
                </div>
              </div>
            );
          })}
        <Etiqueta texto="LA MISMA BASE" x={540} y={740} t={t} at={T.base - 0.05} out={T.cambia - 0.1} size={46} variante="acento" fuente="titulo" />
        <Etiqueta texto="PARA OTROS NEGOCIOS" x={540} y={1500} t={t} at={T.otros - 0.05} out={T.cambia - 0.1} size={38} variante="borde" fuente="titulo" />
        <div style={{ position: "absolute", left: 540, top: 1130, width: 0, height: 0 }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) scaleX(${Math.max(0.02, giro)}) scale(${sp(t, desde - 0.3, { damping: 14, stiffness: 160 })})` }}>
            <WebMini w={430} maqueta="clasica" menu="moderna" paleta={paleta} negocio={negocio} url={["la-espiga.es", "tijera-fina.es", "taller-piston.es"][k]} />
          </div>
        </div>
        <Etiqueta texto={["PANADERÍA", "PELUQUERÍA", "TALLER"][k]} x={540} y={740} t={t} at={T.cambia - 0.05} out={T.adapta - 0.1} size={46} variante="acento" fuente="titulo" />
        <Pieza x={330} y={1500} t={t} at={T.textos - 0.05} out={T.variantes - 0.2}>
          <Pildora texto="TEXTOS" size={40} />
        </Pieza>
        <Pieza x={750} y={1500} t={t} at={T.colores - 0.05} out={T.variantes - 0.2}>
          <Pildora texto="COLORES" size={40} />
        </Pieza>
        <Etiqueta texto="CLAUDE CODE ADAPTA" x={540} y={740} t={t} at={T.adapta - 0.05} out={T.variantes - 0.2} size={42} variante="borde" fuente="titulo" />
      </Escena>
      {/* el sello va en pantalla, no en el lienzo: la cámara está muy lejos */}
      <AbsoluteFill>
        <Sello texto={<span>VARIANTES INFINITAS <span style={{ fontSize: "1.25em", verticalAlign: "-0.05em" }}>∞</span></span>} x={540} y={1120} t={t} at={T.infinitas - 0.05} out={hasta + 0.4} size={62} rot={-4} />
      </AbsoluteFill>
    </>
  );
};

export const eventosOtros = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.base - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.otros - 0.05, sfx: "pop", vol: 0.3 },
    { t: T.peluqueria - 0.25, sfx: "whoosh", vol: 0.22 },
    { t: T.taller - 0.25, sfx: "whoosh", vol: 0.22 },
    { t: T.adapta - 0.05, sfx: "pop", vol: 0.3 },
    { t: T.textos - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.colores - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.variantes - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.infinitas + 0.07, sfx: "golpe", vol: 0.55 },
  ];
};

// ── resumen ──────────────────────────────────────────────────────────────────────────────────────────────────────
const R = "resumen";
const tr = (L: Linea) => ({
  resumen: L.en(R, "resumen"),
  pide: L.en(R, "pide"),
  comparalas: L.en(R, "compáralas"),
  mezcla: L.en(R, "mezcla"),
  guarda: L.en(R, "guarda"),
  ganadora: L.en(R, "ganadora"),
  fin: L.fin(R),
});

const PASOS = ["PIDE VARIAS", "COMPÁRALAS", "MEZCLA LO MEJOR", "GUARDA LA GANADORA"];

const IcoVarias: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={C.oscuro} strokeWidth={2.4} strokeLinejoin="round"><rect x={3} y={7} width={11} height={13} rx={2} /><rect x={7} y={4} width={11} height={13} rx={2} fill={C.acento} /><rect x={11} y={1.5} width={10} height={12} rx={2} fill={C.acento} /></svg>
);
const IcoMezcla: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={C.oscuro} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M4 5 C10 5 10 12 13 12 H20 M4 19 C10 19 10 12 13 12" /><path d="M17 9 L20 12 L17 15" /></svg>
);

export const Resumen11: React.FC<BloqueProps> = ({ t, L, desde }) => {
  const T = tr(L);
  const at = [T.pide, T.comparalas, T.mezcla, T.guarda];
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1100, z: 1.0 },
    { t: T.guarda - 0.4, x: 540, y: 1150, z: 1.02, d: 1.0 },
  ];
  const ys = [820, 1030, 1240, 1450];
  const iconos = [<IcoVarias s={52} />, <IcoLupa s={52} color={C.oscuro} />, <IcoMezcla s={52} />, <Copa s={56} />];
  return (
    <Escena t={t} tomas={tomas}>
      {ys.slice(0, 3).map((y, i) => (
        <Flecha key={i} curva={{ a: { x: 540, y: y + 55 }, c: { x: 540 + (i % 2 ? -60 : 60), y: y + 105 }, b: { x: 540, y: ys[i + 1] - 58 } }} p={ramp(t, at[i + 1] - 0.3, at[i + 1], EASE)} ancho={7} />
      ))}
      {PASOS.map((p, i) => {
        const s = sp(t, at[i] - 0.05, { damping: 12, stiffness: 200 });
        if (s <= 0) return null;
        const activa = i === 3 ? 1 : 1 - 0.55 * ramp(t, at[i + 1] - 0.05, at[i + 1] + 0.25);
        return (
          <div key={i} style={{ position: "absolute", left: 540, top: ys[i], width: 0, height: 0, opacity: Math.min(1, s * 2) }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${(0.6 + 0.4 * s) * (0.92 + 0.08 * activa)})`, opacity: 0.45 + 0.55 * activa }}>
              <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 36px 18px 20px", borderRadius: 999, background: C.acento, border: `5px solid ${C.oscuro}`, boxShadow: `0 16px 44px ${C.acento}55`, whiteSpace: "nowrap" }}>
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: "#F6EEDC", display: "flex", alignItems: "center", justifyContent: "center" }}>{iconos[i]}</div>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 50, color: C.oscuro }}>{p}</div>
              </div>
            </div>
          </div>
        );
      })}
      <Etiqueta texto="EN RESUMEN" x={540} y={680} t={t} at={T.resumen - 0.05} size={36} variante="gris" fuente="titulo" />
    </Escena>
  );
};

export const eventosResumen11 = (L: Linea): Evento[] => {
  const T = tr(L);
  return [
    { t: T.resumen - 0.05, sfx: "pop", vol: 0.3 },
    { t: T.pide - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.comparalas - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.mezcla - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.guarda - 0.05, sfx: "golpe", vol: 0.45 },
    { t: T.ganadora + 0.4, sfx: "tick", vol: 0.45 },
  ];
};
