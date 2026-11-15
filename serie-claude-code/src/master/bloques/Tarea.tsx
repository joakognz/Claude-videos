/**
 * Bloque «Tu tarea y resumen» (escenas tarea → resumen): la lista de dos casillas que se marcan al nombrarlas y el
 * ciclo completo en círculo (pides → Claude guarda → te propone → tú decides → rebobinas), cada paso al decirlo.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Aspa, Caja, Check, pulso } from "../componentes/Interfaz";
import { Etiqueta } from "../componentes/Sello";
import { C, MONO, TITULO, UI, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => ({
  tu: L.ini("tarea"),
  rechaza: L.en("tarea", "rechaza"),
  otro: L.en("tarea", "otro"),
  prueba: L.en("tarea", "prueba"),
  rewind: L.en("tarea", "rewind"),
  anterior: L.en("tarea", "anterior"),
  en: L.ini("resumen"),
  nodos: [L.en("resumen", "pides"), L.en("resumen", "guarda"), L.en("resumen", "propone"), L.en("resumen", "decides"), L.en("resumen", "rebobinas")],
  falla: L.en("resumen", "falla"),
  fin: L.fin("resumen"),
});

const CX = 540;
const CY = 2330;
const R = 335;
const ANG = [-90, -18, 54, 126, 198].map((a) => (a * Math.PI) / 180);
const NOMBRES = ["PIDES", "GUARDA", "PROPONE", "DECIDES", "REBOBINAS"];

export const Tarea: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1120, z: 0.98 },
    { t: T.rechaza - 0.3, x: 540, y: 1080, z: 1.05, d: 0.9 },
    { t: T.prueba - 0.3, x: 540, y: 1200, z: 1.05, d: 0.9 },
    { t: T.en - 0.35, x: 540, y: CY - 10, z: 0.98, d: 1.0 },
    { t: T.falla - 0.2, x: 520, y: CY, z: 1.03, d: 1.0 },
    { t: T.fin - 0.1, x: 540, y: CY - 10, z: 0.97, d: 1.0 },
  ];
  const fueraA = T.en - 0.15;
  const filas = [
    { y: 990, at: T.rechaza - 0.1, hecho: T.otro + 0.3, texto: ["Rechaza un cambio a propósito", "y pide otro"] },
    { y: 1220, at: T.prueba - 0.1, hecho: T.anterior + 0.35, texto: ["Prueba /rewind y vuelve", "a un punto anterior"] },
  ];
  const largo = 2 * Math.PI * R;
  // el anillo avanza hasta cada paso cuando la voz lo dice (y al final cierra el ciclo)
  const arco = T.nodos.reduce((acc, a, i) => acc + (i === 0 ? 0 : 0.2 * ramp(t, a - 0.35, a + 0.05)), 0) + 0.2 * ramp(t, T.fin - 0.1, T.fin + 0.5);
  return (
    <Escena t={t} tomas={tomas}>
      {/* tu tarea */}
      <Caja x={80} y={760} w={920} h={720} t={t} at={T.tu - 0.1} out={fueraA} style={{ borderRadius: 48, background: C.panel, border: `4px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.55)", overflow: "hidden" }}>
        <div style={{ height: 150, background: C.acento, display: "flex", alignItems: "center", paddingLeft: 56, fontFamily: TITULO, fontWeight: 800, fontSize: 84, letterSpacing: -1, color: C.oscuro }}>TU TAREA</div>
      </Caja>
      {filas.map((f, i) => {
        const v = vis(t, f.at, fueraA, 0.8);
        if (!v.on) return null;
        const hecho = ramp(t, f.hecho, f.hecho + 0.3);
        return (
          <div key={i} style={{ position: "absolute", left: 130, top: f.y, width: 820, height: 190, display: "flex", alignItems: "center", gap: 36, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, transformOrigin: "0 50%" }}>
            <div style={{ width: 104, height: 104, borderRadius: 26, boxSizing: "border-box", border: `6px solid ${C.acento}`, background: hecho > 0 ? `rgba(217,119,87,${0.25 * hecho})` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${1 + 0.15 * pulso(t, f.hecho, 0.35)})` }}>
              <Check size={78} p={hecho} grosor={3.8} />
            </div>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 46, lineHeight: 1.2, color: C.texto, whiteSpace: "nowrap" }}>
              {f.texto.map((ln, k) => (
                <div key={k}>
                  {ln.split("/rewind").map((trozo, j, arr) => (
                    <React.Fragment key={j}>
                      {trozo}
                      {j < arr.length - 1 && <span style={{ fontFamily: MONO, color: C.acento }}>/rewind</span>}
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* resumen: el ciclo */}
      {(() => {
        const v = vis(t, T.en, hasta + 0.4, 0.9);
        if (!v.on) return null;
        return (
          <svg style={{ position: "absolute", left: CX - R - 20, top: CY - R - 20, opacity: v.opacity }} width={2 * R + 40} height={2 * R + 40} viewBox={`${-R - 20} ${-R - 20} ${2 * R + 40} ${2 * R + 40}`}>
            <circle r={R} fill="none" stroke={C.borde} strokeWidth={10} strokeDasharray="4 22" strokeLinecap="round" />
            <circle r={R} fill="none" stroke={C.acento} strokeWidth={12} strokeLinecap="round" strokeDasharray={largo} strokeDashoffset={largo * (1 - Math.min(1, arco))} transform="rotate(-90)" />
          </svg>
        );
      })()}
      <Etiqueta texto="EN RESUMEN" x={CX} y={CY - 40} t={t} at={T.en} out={hasta + 0.4} size={50} variante="gris" fuente="titulo" />
      <Etiqueta texto="EL CICLO" x={CX} y={CY + 40} t={t} at={T.en + 0.15} out={hasta + 0.4} size={84} variante="texto" fuente="titulo" />
      {ANG.map((a, i) => {
        const x = CX + R * Math.cos(a);
        const y = CY + R * Math.sin(a);
        const at = T.nodos[i] - 0.1;
        const v = vis(t, T.en + 0.1 + i * 0.06, hasta + 0.4, 0.5);
        if (!v.on) return null;
        const on = sp(t, at, { damping: 10, stiffness: 220 });
        const enc = Math.min(1, on);
        return (
          <div key={i} style={{ position: "absolute", left: x - 118, top: y - 105, width: 236, height: 210, boxSizing: "border-box", borderRadius: 40, background: enc > 0.5 ? C.panel2 : C.panel, border: `5px solid ${enc > 0.5 ? C.acento : C.borde}`, boxShadow: enc > 0.5 ? `0 0 ${36 + 40 * pulso(t, at, 0.5)}px ${C.acento}88` : "0 20px 50px rgba(0,0,0,0.5)", opacity: v.opacity * (0.55 + 0.45 * enc), transform: `scale(${v.scale * (0.92 + 0.08 * on)})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ position: "absolute", left: -18, top: -18, width: 62, height: 62, borderRadius: 20, background: enc > 0.5 ? C.acento : C.tenue, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 38, color: C.oscuro }}>{i + 1}</div>
            <div style={{ height: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {i === 0 && (
                <svg width={86} height={86} viewBox="0 0 24 24">
                  <path d="M4 4.5 h16 a1.5 1.5 0 0 1 1.5 1.5 v9.5 a1.5 1.5 0 0 1 -1.5 1.5 h-9 l-4.5 3.5 v-3.5 h-2.5 a1.5 1.5 0 0 1 -1.5 -1.5 v-9.5 a1.5 1.5 0 0 1 1.5 -1.5 z" fill="none" stroke={C.acento} strokeWidth={1.9} strokeLinejoin="round" />
                  <path d="M7 9 h10 M7 12.5 h6" stroke={C.acento} strokeWidth={1.7} strokeLinecap="round" />
                </svg>
              )}
              {i === 1 && ep.iconos?.marcador && <Img src={staticFile(ep.iconos.marcador)} style={{ height: 100 }} />}
              {i === 2 && <Img src={staticFile(ep.logos.claude)} style={{ width: 88 }} />}
              {i === 3 && (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Check size={62} p={1} grosor={3.6} />
                  <Aspa size={52} p={1} color={C.gris} grosor={3.6} />
                </div>
              )}
              {i === 4 && ep.iconos?.reloj && <Img src={staticFile(ep.iconos.reloj)} style={{ height: 104, transform: `rotate(${enc > 0.5 ? Math.sin((t - at) * 5) * -8 : 0}deg)` }} />}
            </div>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 31, letterSpacing: 0.5, color: enc > 0.5 ? C.texto : C.gris }}>{NOMBRES[i]}</div>
          </div>
        );
      })}
    </Escena>
  );
};

export const eventosTarea = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.tu - 0.05, sfx: "pop", vol: 0.45 },
    { t: T.rechaza - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.otro + 0.35, sfx: "tick", vol: 0.55 },
    { t: T.prueba - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.anterior + 0.4, sfx: "tick", vol: 0.55 },
    { t: T.en - 0.3, sfx: "whoosh", vol: 0.3 },
    ...T.nodos.map((a) => ({ t: a - 0.08, sfx: "tick" as const, vol: 0.5 })),
    { t: T.nodos[4] + 0.05, sfx: "golpe", vol: 0.5 },
  ];
};
