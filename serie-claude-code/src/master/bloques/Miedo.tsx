/**
 * Bloque «El miedo y la solución» (escenas miedo → solucion → cinco): el bocadillo «¿Y si lo estropeo?» sobre una
 * ventana de código que se agrieta; la grieta se cierra al revés cuando llega la solución (Claude Code guarda solo y
 * deja volver atrás) y aparecen las cinco casillas del ciclo.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Imagen, Rebobinado } from "../componentes/Interfaz";
import { Logo } from "../componentes/Logo";
import { Editor } from "../componentes/Piezas";
import { Etiqueta } from "../componentes/Sello";
import { C, TITULO, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => ({
  y: L.ini("miedo"),
  palabras: L.palabras.filter((p) => p.escena === "miedo").slice(0, 4),
  estropeo: L.en("miedo", "estropeo"),
  es: L.en("miedo", "Es"),
  claude1: L.en("miedo", "Claude"),
  quito: L.en("solucion", "quito"),
  claude2: L.en("solucion", "Claude"),
  guarda: L.en("solucion", "guarda"),
  solo: L.en("solucion", "solo"),
  volver: L.en("solucion", "volver"),
  tiempo: L.en("solucion", "tiempo"),
  te: L.ini("cinco"),
  cinco: L.en("cinco", "cinco"),
});

const GRIETA = "M 540 990 L 498 1080 L 578 1150 L 488 1240 L 566 1325 L 506 1405 L 552 1500";
const RAMAS = ["M 578 1150 L 680 1175 L 745 1245", "M 488 1240 L 390 1265 L 340 1345", "M 566 1325 L 668 1368"];
const X5 = [160, 350, 540, 730, 920];

export const Miedo: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1110, z: 0.97 },
    { t: T.estropeo - 0.25, x: 540, y: 1150, z: 1.06, d: 0.8 },
    { t: T.quito - 0.3, x: 540, y: 1130, z: 0.98, d: 0.9 },
    { t: T.volver - 0.3, x: 540, y: 1120, z: 0.96, d: 1.0 },
    { t: T.te - 0.3, x: 540, y: 1060, z: 1.0, d: 0.8 },
  ];
  const fuera = T.te - 0.1; // todo lo de miedo/solución sale antes de las cinco casillas
  // grieta: se dibuja en «estropeo» y se cierra al revés en «quito»
  const grieta = ramp(t, T.estropeo, T.estropeo + 0.45) * (1 - ramp(t, T.quito, T.quito + 0.6));
  const temblor = t > T.estropeo && t < T.estropeo + 0.5 ? Math.sin((t - T.estropeo) * 80) * (0.5 - (t - T.estropeo)) * 14 : 0;
  const vBoc = vis(t, T.y - 0.1, T.quito + 0.25, 0.5);
  const vEd = vis(t, T.y - 0.2, fuera, 0.85);
  const marcador = sp(t, T.guarda, { damping: 10, stiffness: 200 });
  return (
    <Escena t={t} tomas={tomas}>
      {/* ventana de código */}
      {vEd.on && (
        <div style={{ position: "absolute", left: 540 - 400, top: 1240 - 270, opacity: vEd.opacity, transform: `translate(${temblor}px, ${vEd.y}px) scale(${vEd.scale})` }}>
          <Editor w={800} h={540} t={t} lineas={Math.min(9, 5 + Math.max(0, t - T.y) * 0.9)} logo={ep.logos.vscode} />
        </div>
      )}
      {grieta > 0 && (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", transform: `translateX(${temblor}px)` }} width={1080} height={1920}>
          {[GRIETA, ...RAMAS].map((d, i) => {
            const p = i === 0 ? grieta : clamp01(grieta * 1.6 - 0.6);
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={C.fondo} strokeWidth={i === 0 ? 18 : 12} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
                <path d={d} fill="none" stroke={C.acento} strokeWidth={i === 0 ? 7 : 5} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
              </g>
            );
          })}
        </svg>
      )}

      {/* bocadillo: las palabras entran con la voz */}
      {vBoc.on && (
        <div style={{ position: "absolute", left: 540, top: 800, width: 0, height: 0 }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vBoc.y}px) scale(${vBoc.scale}) rotate(${Math.sin(t * 9) * 1.2 - 2}deg)`, opacity: vBoc.opacity }}>
            <div style={{ padding: "34px 54px", borderRadius: 54, background: C.texto, color: C.oscuro, fontFamily: TITULO, fontWeight: 800, fontSize: 78, letterSpacing: -2, whiteSpace: "nowrap", boxShadow: "0 30px 70px rgba(0,0,0,0.55)" }}>
              {T.palabras.map((p, i) => {
                const s = sp(t, p.inicio - 0.04, { damping: 12, stiffness: 240 });
                return (
                  <span key={i} style={{ display: "inline-block", marginRight: i < 3 ? 20 : 0, opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 30}px)`, color: i === 3 ? C.acento : C.oscuro }}>
                    {p.texto}
                  </span>
                );
              })}
            </div>
            <svg width={90} height={70} viewBox="0 0 90 70" style={{ position: "absolute", left: 120, bottom: -56 }}>
              <path d="M 6 0 L 80 0 L 20 64 Z" fill={C.texto} />
            </svg>
          </div>
        </div>
      )}
      <Etiqueta texto="EL MAYOR MIEDO" x={540} y={1512} t={t} at={T.es + 0.25} out={T.quito + 0.1} size={46} variante="borde" fuente="titulo" />
      <Logo src={ep.logos.claude_code} x={905} y={985} w={185} t={t} at={T.claude1 - 0.05} out={fuera} pulsos={[T.claude2]} rot={6} />

      {/* la solución */}
      <Etiqueta texto="LA SOLUCIÓN" x={540} y={690} t={t} at={T.quito + 0.3} out={T.volver - 0.1} size={44} variante="acento" fuente="titulo" />
      {ep.iconos?.marcador && (
        <Imagen src={ep.iconos.marcador} x={185} y={985 - (1 - Math.min(1, marcador)) * 260} w={165} t={t} at={T.guarda} out={fuera} rot={-8} desde={0.7} />
      )}
      <Etiqueta texto="GUARDA TU TRABAJO SOLO" x={540} y={1508} t={t} at={T.solo - 0.25} out={fuera} size={42} variante="borde" fuente="titulo" />
      {ep.iconos?.reloj && <Imagen src={ep.iconos.reloj} x={540} y={800} w={200} t={t} at={T.volver - 0.05} out={fuera} rot={Math.sin((t - T.volver) * 5) * -5} />}
      <Rebobinado x={540} y={806} r={142} t={t} at={T.volver + 0.1} out={fuera} grosor={11} />
      <Etiqueta texto="Y TE DEJA VOLVER ATRÁS" x={540} y={1596} t={t} at={T.tiempo - 0.5} out={fuera} size={42} variante="acento" fuente="titulo" />

      {/* las cinco casillas del ciclo */}
      <Etiqueta texto="EL CICLO" x={540} y={830} t={t} at={T.te + 0.05} out={hasta + 0.4} size={110} variante="texto" fuente="titulo" />
      {X5.map((x, i) => {
        const a = T.cinco - 0.25 + i * 0.09;
        const v = vis(t, a, hasta + 0.4, 0.3);
        if (!v.on) return null;
        return (
          <div key={i} style={{ position: "absolute", left: x - 78, top: 1090 - 95, width: 156, height: 190, borderRadius: 34, background: i === 4 ? C.acento : C.panel2, border: `4px solid ${C.acento}`, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 104, color: i === 4 ? C.oscuro : C.texto, boxShadow: `0 0 34px ${C.acento}55` }}>
            {i + 1}
          </div>
        );
      })}
      <Etiqueta texto="5 PASOS" x={540} y={1330} t={t} at={T.cinco + 0.2} out={hasta + 0.4} size={56} variante="acento" fuente="titulo" />
    </Escena>
  );
};

export const eventosMiedo = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.y - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.estropeo, sfx: "golpe", vol: 0.55 },
    { t: T.claude1, sfx: "pop", vol: 0.35 },
    { t: T.quito, sfx: "whoosh", vol: 0.35 },
    { t: T.guarda + 0.2, sfx: "tick", vol: 0.5 },
    { t: T.volver, sfx: "whoosh", vol: 0.3 },
    ...[0, 1, 2, 3, 4].map((i) => ({ t: T.cinco - 0.25 + i * 0.09, sfx: "pop" as const, vol: 0.32 })),
    { t: T.cinco + 0.25, sfx: "golpe", vol: 0.45 },
  ];
};
