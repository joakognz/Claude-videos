/**
 * EP.9 · Resúmenes de las dos partes (escena resumen).
 * Parte 1: las cuatro cartas del gancho se dan la vuelta con la voz (MEMORIA · IMAGEN · PLAN · GUARDADO) y el ojo
 * tachado se abre: YA NO A CIEGAS.
 * Parte 2: tres tarjetas (SUBAGENTES · MCP · REMOTE CONTROL) con su verbo, encendidas al nombrarlas.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta } from "../../componentes/Sello";
import { Carta, IcoAyudantes, IcoBandera, IcoEnchufe, IcoFicha, IcoImagen, IcoMovil, IcoOjo, IcoOjoTachado, IcoPlano } from "../../componentes/ep09/Piezas9";
import { C, TITULO, UI, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "resumen";
const tiempos1 = (L: Linea) => ({
  resumen: L.en(E, "resumen:"),
  memoria: L.en(E, "memoria,"),
  imagen: L.en(E, "imagen,"),
  plan: L.en(E, "plan"),
  punto: L.en(E, "punto"),
  cuatro: L.en(E, "cuatro,"),
  ya: L.en(E, "ya"),
  ciegas: L.en(E, "ciegas."),
});

const CARTAS1 = [
  { titulo: "MEMORIA", Ico: IcoFicha },
  { titulo: "IMAGEN", Ico: IcoImagen },
  { titulo: "PLAN", Ico: IcoPlano },
  { titulo: "GUARDADO", Ico: IcoBandera },
];

export const Resumen1: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos1(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1150, z: 1.0 },
    { t: T.cuatro - 0.3, x: 540, y: 1250, z: 1.02, d: 0.9 },
  ];
  const giros = [T.memoria, T.imagen, T.plan, T.punto];
  const abre = ramp(t, T.ciegas - 0.2, T.ciegas + 0.2);
  const vOjo = vis(t, T.ya - 0.1, hasta + 0.3, 0.6);
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="EN RESUMEN" x={540} y={800} t={t} at={T.resumen - 0.1} size={48} variante="gris" fuente="titulo" />
      {CARTAS1.map((c, k) => {
        const x = 157 + k * 255;
        const s = sp(t, desde - 0.2 + k * 0.06, { damping: 13, stiffness: 170 });
        const brillo = t > T.cuatro ? Math.max(0, Math.sin((t - T.cuatro) * 5 - k * 0.7)) : 0;
        return (
          <div key={k} style={{ position: "absolute", left: x, top: 1130, width: 0, height: 0, opacity: Math.min(1, s * 2) }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${(1 - s) * 60}px) scale(${1 + 0.06 * brillo})` }}>
              <Carta w={210} t={t} gira={giros[k] - 0.05} n={k + 1} titulo={c.titulo} icono={<c.Ico s={96} color={C.oscuro} grosor={2.4} />} brillo={brillo} />
            </div>
          </div>
        );
      })}
      {vOjo.on && (
        <div style={{ position: "absolute", left: 540, top: 1520, width: 0, height: 0, opacity: vOjo.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vOjo.y}px) scale(${vOjo.scale})`, display: "flex", alignItems: "center", gap: 24, whiteSpace: "nowrap" }}>
            <div style={{ position: "relative", width: 110, height: 110 }}>
              <div style={{ position: "absolute", inset: 0, opacity: 1 - abre }}>
                <IcoOjoTachado s={110} color={C.gris} grosor={2.2} />
              </div>
              <div style={{ position: "absolute", inset: 0, opacity: abre, transform: `scale(${1 + 0.2 * Math.sin(abre * Math.PI)})` }}>
                <IcoOjo s={110} color={C.acento} grosor={2.4} />
              </div>
            </div>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 64, color: abre > 0.5 ? C.texto : C.gris }}>
              {abre > 0.5 ? "YA NO A CIEGAS" : "A CIEGAS"}
            </div>
          </div>
        </div>
      )}
    </Escena>
  );
};

export const eventosResumen1 = (L: Linea): Evento[] => {
  const T = tiempos1(L);
  return [
    ...[T.memoria, T.imagen, T.plan, T.punto].map((at) => ({ t: at, sfx: "whoosh" as const, vol: 0.28 })),
    { t: T.cuatro, sfx: "pop", vol: 0.35 },
    { t: T.ciegas, sfx: "golpe", vol: 0.45 },
  ];
};

// ── parte 2 ──────────────────────────────────────────────────────────────────────────────────────────────────────
const tiempos2 = (L: Linea) => ({
  resumen: L.en(E, "resumen:"),
  subagentes: L.en(E, "subagentes"),
  reparten: L.en(E, "reparten"),
  mcp: L.en(E, "MCP"),
  conecta: L.en(E, "conecta"),
  remote: L.en(E, "Remote"),
  seguir: L.en(E, "seguir"),
  movil: L.en(E, "móvil."),
});

export const Resumen2: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos2(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1150, z: 1.0 },
    { t: T.remote - 0.4, x: 540, y: 1260, z: 1.0, d: 1.0 },
  ];
  const filas = [
    { at: T.subagentes, verbo: T.reparten, titulo: "SUBAGENTES", sub: "reparten el trabajo", Ico: IcoAyudantes, logo: undefined as string | undefined },
    { at: T.mcp, verbo: T.conecta, titulo: "MCP", sub: "conecta tus herramientas", Ico: IcoEnchufe, logo: ep.logos.mcp },
    { at: T.remote, verbo: T.seguir, titulo: "REMOTE CONTROL", sub: "sigue desde el móvil", Ico: IcoMovil, logo: undefined },
  ];
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="EN RESUMEN" x={540} y={760} t={t} at={T.resumen - 0.1} size={48} variante="gris" fuente="titulo" />
      {filas.map((f, k) => {
        const v = vis(t, f.at - 0.1, hasta + 0.3, 0.6);
        if (!v.on) return null;
        const on = clamp01((t - f.verbo) / 0.25);
        return (
          <div key={k} style={{ position: "absolute", left: 540, top: 960 + k * 250, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateX(${(1 - v.s) * (k % 2 ? 80 : -80)}px) scale(${v.scale})`, width: 900, height: 200, borderRadius: 34, background: on > 0.5 ? C.acento : C.panel, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", gap: 30, padding: "0 40px", boxSizing: "border-box", boxShadow: on > 0.5 ? `0 0 60px ${C.acento}55` : "0 24px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ width: 120, height: 120, borderRadius: "50%", background: on > 0.5 ? C.oscuro : C.panel2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <f.Ico s={70} color={C.acento} grosor={2.2} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, whiteSpace: "nowrap" }}>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 56, color: on > 0.5 ? C.oscuro : C.texto }}>{f.titulo}</div>
                <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, color: on > 0.5 ? C.oscuro : C.gris, opacity: on > 0 ? 1 : 0.6 }}>{f.sub}</div>
              </div>
            </div>
          </div>
        );
      })}
      <Logo src={ep.logos.mcp} x={920} y={1210} w={130} t={t} at={T.mcp} out={hasta + 0.3} ficha="circulo" />
      <Logo src={ep.logos.claude} x={920} y={1460} w={100} t={t} at={T.movil - 0.2} out={hasta + 0.3} />
    </Escena>
  );
};

export const eventosResumen2 = (L: Linea): Evento[] => {
  const T = tiempos2(L);
  return [
    { t: T.subagentes - 0.1, sfx: "whoosh", vol: 0.28 },
    { t: T.reparten, sfx: "pop", vol: 0.35 },
    { t: T.mcp - 0.1, sfx: "whoosh", vol: 0.28 },
    { t: T.conecta, sfx: "pop", vol: 0.35 },
    { t: T.remote - 0.1, sfx: "whoosh", vol: 0.28 },
    { t: T.seguir, sfx: "pop", vol: 0.35 },
  ];
};
