/**
 * EP.5 · bloque «Resultado» (escena resultado):
 * en segundos, el CLAUDE.md abierto en el editor se recorre de arriba abajo mientras el contador sube de 0 a 132
 * líneas (las líneas que se ven son las de la grabación; los tramos que no salen en ella van plegados «⋯») →
 * fichas: Clínica Aurora Estética (Valencia) · Astro + Tailwind · Despliegue por FTP · Consentimiento RGPD · Sin rastreo.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { C, MONO, TITULO, UI, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { FichaFija, IconoFtp, IconoMd, Picto, latido } from "../../ep05/kit";
import { EditorMd, Pestana, VS, Ventana } from "../../ep05/ui";
import type { LineaMd } from "../../ep05/ui";

/** Líneas del CLAUDE.md de la grabación (n = número de línea; -1 = tramo que no se ve en la grabación). */
export const CLAUDE_MD: LineaMd[] = [
  { n: 1, texto: "# CLAUDE.md" },
  { n: 2, texto: "" },
  { n: 3, texto: "This file provides guidance to Claude Code (claude.ai/code)" },
  { n: -1, texto: "⋯" },
  { n: 7, texto: "## Estado del proyecto" },
  { n: -1, texto: "⋯" },
  { n: 11, texto: "```bash" },
  { n: 12, texto: "npm create astro@latest . -- --template minimal" },
  { n: 13, texto: "npx astro add tailwind   # instala Tailwind v4" },
  { n: 14, texto: "npm install -D @astrojs/check typescript" },
  { n: 15, texto: "git init && git checkout -b main" },
  { n: 16, texto: "```" },
  { n: 17, texto: "" },
  { n: 18, texto: "## Qué es este proyecto" },
  { n: 19, texto: "" },
  { n: 20, texto: "Landing page de captación de leads para" },
  { n: -1, texto: "**Clínica Aurora Estética** (Valencia)." },
  { n: 21, texto: "" },
  { n: 22, texto: "Decisiones cerradas con el cliente que no hay que reabrir:" },
  { n: 23, texto: "" },
  { n: 24, texto: "- **Una sola página, sin páginas legales.**" },
  { n: 25, texto: "- **El formulario es la única vía de captación.**" },
  { n: 26, texto: "- **Sin tracking.** Nada de GA4, Meta Pixel ni GTM" },
  { n: 27, texto: "- **Solo español.**" },
  { n: 28, texto: "" },
  { n: 29, texto: "## Stack" },
  { n: 30, texto: "" },
  { n: 31, texto: "- **Astro** en modo estático" },
  { n: 32, texto: "- **Tailwind CSS v4**" },
  { n: -1, texto: "⋯" },
  { n: 88, texto: "## Marca y contenido" },
  { n: -1, texto: "⋯" },
  { n: 105, texto: "**Límites del copy** (publicidad sanitaria en España)" },
  { n: 106, texto: "" },
  { n: 107, texto: "**Imágenes:** placeholders de stock hasta recibir" },
  { n: 108, texto: "" },
  { n: 109, texto: "## Convenciones" },
  { n: 110, texto: "" },
  { n: 111, texto: "- Código e identificadores en inglés; copy en español" },
  { n: 112, texto: "- Mobile-first: se diseña y revisa primero a 375 px" },
  { n: 113, texto: "- Sin JavaScript de terceros ni fuentes externas" },
  { n: 114, texto: "- No crear páginas nuevas sin confirmación del cliente" },
  { n: 115, texto: "" },
  { n: 116, texto: "## Datos del cliente (ficticios)" },
  { n: 117, texto: "" },
  { n: 118, texto: "| Dato | Valor |" },
  { n: 119, texto: "|---|---|" },
  { n: 120, texto: "| Nombre comercial | Clínica Aurora Estética |" },
  { n: -1, texto: "⋯" },
];
const VISIBLES = 15;

const FICHAS_Y = [2130, 2300, 2470, 2640, 2810];

const tiempos = (L: LineaT) => ({
  y: L.ini("resultado"),
  segundos: L.en("resultado", "segundos"),
  tienes: L.en("resultado", "tienes"),
  n132: L.en("resultado", "132"),
  lineas: L.en("resultado", "líneas"),
  finLineas: L.finDe("resultado", "líneas"),
  clinica: L.en("resultado", "Clínica"),
  valencia: L.en("resultado", "Valencia"),
  astro: L.en("resultado", "Astro"),
  tailwind: L.en("resultado", "Tailwind"),
  despliegue: L.en("resultado", "Despliegue"),
  ftp: L.en("resultado", "FTP"),
  consentimiento: L.en("resultado", "Consentimiento"),
  proteccion: L.en("resultado", "protección"),
  sin: L.en("resultado", "sin"),
  rastreo: L.en("resultado", "rastreo"),
});

export const Resultado: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1120, z: 1.0 },
    { t: T.tienes - 0.1, x: 540, y: 1100, z: 1.03, d: 0.6 },
    { t: T.lineas - 0.1, x: 540, y: 980, z: 1.1, d: 0.6 },
    { t: T.clinica - 0.35, x: 540, y: 2190, z: 1.04, d: 0.8 },
    { t: T.astro - 0.15, x: 540, y: 2330, z: 1.05, d: 0.7 },
    { t: T.despliegue - 0.15, x: 540, y: 2440, z: 1.05, d: 0.7 },
    { t: T.consentimiento - 0.15, x: 540, y: 2540, z: 1.05, d: 0.7 },
    { t: T.sin - 0.2, x: 540, y: 2530, z: 0.98, d: 0.9 },
  ];
  const fueraA = T.clinica;
  // contador y desplazamiento del editor, a la vez
  const cuenta = ramp(t, T.tienes, T.lineas + 0.2, (n) => 1 - (1 - n) ** 2.4);
  const n = Math.round(cuenta * 132);
  const scroll = cuenta * (CLAUDE_MD.length - VISIBLES);
  const lleno = sp(t, T.lineas + 0.2, { damping: 10, stiffness: 200 });
  return (
    <Escena t={t} tomas={tomas}>
      {/* contador */}
      {(() => {
        const v = vis(t, T.y - 0.05, fueraA, 0.7);
        if (!v.on) return null;
        const golpe = t > T.lineas + 0.2 ? Math.sin(Math.min(1, lleno) * Math.PI) * 0.1 : 0;
        return (
          <div style={{ position: "absolute", left: 540, top: 770, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale * (1 + golpe)})`, opacity: v.opacity, display: "flex", alignItems: "center", gap: 26, padding: "18px 44px", borderRadius: 999, background: C.panel, border: `4px solid ${n === 132 ? C.acento : C.borde}`, boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 ${n === 132 ? 60 : 0}px ${C.acento}55` }}>
              <div style={{ transform: `rotate(${clamp01((t - T.segundos) / 1.6) * 720}deg)` }}>
                <Picto nombre="reloj" size={74} />
              </div>
              <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 120, color: C.acento, fontVariantNumeric: "tabular-nums", minWidth: 230, textAlign: "right" }}>{n}</span>
              <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 60, color: C.texto }}>líneas</span>
            </div>
          </div>
        );
      })()}
      {/* el CLAUDE.md en el editor */}
      {(() => {
        const v = vis(t, T.y + 0.05, fueraA + 0.2, 0.88);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 50, top: 900, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <Ventana w={980} h={700} buscador="landing-cliente-clínica-estética">
              <div style={{ display: "flex", background: VS.barra, borderBottom: `2px solid ${VS.borde}` }}>
                <Pestana texto="CLAUDE.md" cursiva icono={<span style={{ color: VS.enlace, fontFamily: MONO, fontWeight: 700 }}>↓</span>} />
              </div>
              <EditorMd w={980} h={580} lineas={CLAUDE_MD} scroll={scroll} size={25} />
            </Ventana>
          </div>
        );
      })()}

      {/* ── fichas del resultado ── */}
      {(() => {
        const v = vis(t, T.clinica - 0.45, T.consentimiento - 0.25, 0.8);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: 1975, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, opacity: v.opacity, display: "flex", alignItems: "center", gap: 20 }}>
              <IconoMd size={70} />
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, color: C.texto }}>CLAUDE.md</span>
              <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 30, color: C.oscuro, background: C.acento, padding: "8px 20px", borderRadius: 999, whiteSpace: "nowrap" }}>132 líneas</span>
            </div>
          </div>
        );
      })()}
      <Fila y={FICHAS_Y[0]} t={t} at={T.clinica} out={hasta + 0.4} icono={<Picto nombre="pin" size={64} />} titulo="Clínica Aurora Estética" sub={t >= T.valencia - 0.05 ? "Valencia" : undefined} latidos={[T.valencia]} />
      <Fila
        y={FICHAS_Y[1]} t={t} at={T.astro} out={hasta + 0.4} titulo="Astro + Tailwind"
        icono={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FichaFija src={ep.logos.astro} h={58} blanca={false} />
            {t >= T.tailwind - 0.05 && (
              <div style={{ transform: `scale(${Math.min(1.05, sp(t, T.tailwind - 0.05, { damping: 11, stiffness: 220 }))})` }}>
                <FichaFija src={ep.logos.tailwind} h={84} blanca={false} />
              </div>
            )}
          </div>
        }
        anchoIcono={250}
      />
      <Fila y={FICHAS_Y[2]} t={t} at={T.despliegue} out={hasta + 0.4} icono={<IconoFtp size={86} />} titulo="Despliegue por FTP" latidos={[T.ftp]} />
      <Fila y={FICHAS_Y[3]} t={t} at={T.consentimiento} out={hasta + 0.4} icono={<Picto nombre="escudo" size={70} />} titulo="Consentimiento RGPD" sub={t >= T.proteccion - 0.05 ? "Protección de datos" : undefined} />
      <Fila y={FICHAS_Y[4]} t={t} at={T.sin} out={hasta + 0.4} icono={<Picto nombre="ojoNo" size={70} />} titulo="Sin rastreo" sub={t >= T.rastreo + 0.1 ? "Nada de GA4, Meta Pixel ni GTM" : undefined} />
    </Escena>
  );
};

const Fila: React.FC<{ y: number; t: number; at: number; out: number; icono: React.ReactNode; titulo: string; sub?: string; latidos?: number[]; anchoIcono?: number }> = ({ y, t, at, out, icono, titulo, sub, latidos = [], anchoIcono = 110 }) => {
  const v = vis(t, at - 0.05, out, 0.7);
  if (!v.on) return null;
  const lat = latido(t, latidos, 0.08);
  const nuevo = 1 - ramp(t, at + 0.6, at + 1.4);
  return (
    <div style={{ position: "absolute", left: 70, top: y - 70, width: 940, height: 140, opacity: v.opacity, transform: `translateX(${(1 - v.s) * -70}px) scale(${(0.96 + 0.04 * v.s) * (1 + lat)})` }}>
      <div style={{ height: "100%", boxSizing: "border-box", borderRadius: 30, background: C.panel, border: `3px solid ${nuevo > 0.2 ? C.acento : C.borde}`, boxShadow: `0 24px 60px rgba(0,0,0,0.45), 0 0 ${40 * nuevo}px ${C.acento}44`, display: "flex", alignItems: "center", gap: 28, padding: "0 32px" }}>
        <div style={{ width: anchoIcono, display: "flex", justifyContent: "center", flexShrink: 0 }}>{icono}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 48, color: C.texto, whiteSpace: "nowrap" }}>{titulo}</div>
          {sub && <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 28, color: C.gris, whiteSpace: "nowrap" }}>{sub}</div>}
        </div>
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Picto nombre="check" size={34} color={C.oscuro} grosor={3.2} dibujo={ramp(t, at + 0.15, at + 0.45)} />
        </div>
      </div>
    </div>
  );
};

export const eventosResultado = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.y, sfx: "whoosh", vol: 0.25 },
    { t: T.lineas + 0.2, sfx: "golpe", vol: 0.5 },
    { t: T.clinica, sfx: "pop", vol: 0.35 },
    { t: T.astro, sfx: "pop", vol: 0.35 },
    { t: T.despliegue, sfx: "pop", vol: 0.35 },
    { t: T.consentimiento, sfx: "pop", vol: 0.35 },
    { t: T.sin, sfx: "pop", vol: 0.35 },
    { t: T.rastreo + 0.3, sfx: "tick", vol: 0.45 },
  ];
};
