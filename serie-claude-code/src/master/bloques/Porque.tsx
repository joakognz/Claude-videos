/**
 * Bloque «Por qué importa» (escenas porque → porque2): el matraz (permiso para experimentar) → pruebas, te equivocas,
 * vuelves atrás, sin perder nada → dos carriles: quien avanza (con puntos de guardado) y quien tiene miedo de tocar.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Aspa, Caja, Imagen, ROJO, pulso } from "../componentes/Interfaz";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, EASE, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => ({
  titulo: L.palabras.filter((p) => p.escena === "porque").slice(0, 4),
  porque: L.en("porque", "Porque"),
  permiso: L.en("porque", "permiso"),
  experimentar: L.en("porque", "experimentar"),
  pruebas: L.en("porque", "Pruebas"),
  equivocas: L.en("porque", "equivocas"),
  vuelves: L.en("porque", "vuelves"),
  sin: L.en("porque", "sin"),
  nada: L.en("porque", "nada"),
  esa: L.ini("porque2"),
  separa: L.en("porque2", "separa"),
  avanza: L.en("porque2", "avanza"),
  quien2: L.en("porque2", "quien", 1),
  miedo: L.en("porque2", "miedo"),
  fin: L.fin("porque2"),
});

const BY = 2330;
const PISTA = { x0: 130, x1: 950 };
const HITOS = [0.28, 0.52, 0.76, 1];

export const Porque: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1100, z: 0.98 },
    { t: T.permiso - 0.3, x: 540, y: 1170, z: 1.06, d: 0.9 },
    { t: T.pruebas - 0.3, x: 540, y: 1170, z: 0.97, d: 0.9 },
    { t: T.sin - 0.3, x: 540, y: 1230, z: 1.0, d: 0.9 },
    { t: T.esa - 0.35, x: 540, y: BY - 20, z: 1.0, d: 1.0 },
    { t: T.avanza - 0.2, x: 540, y: BY - 60, z: 1.03, d: 0.9 },
    { t: T.quien2 - 0.15, x: 540, y: BY + 40, z: 1.0, d: 0.9 },
    { t: T.fin - 0.3, x: 540, y: BY, z: 0.98, d: 1.0 },
  ];
  const fuera1 = T.pruebas - 0.1;
  const fueraA = T.esa - 0.15;
  const pasos = [
    { y: 830, texto: "PRUEBAS", at: T.pruebas - 0.05, icono: "matraz" as const },
    { y: 1050, texto: "TE EQUIVOCAS", at: T.equivocas - 0.25, icono: "aspa" as const },
    { y: 1270, texto: "VUELVES ATRÁS", at: T.vuelves - 0.05, icono: "reloj" as const },
  ];
  const avance = ramp(t, T.avanza - 0.1, T.fin + 0.2, EASE);
  const xA = PISTA.x0 + (PISTA.x1 - PISTA.x0) * avance;
  return (
    <Escena t={t} tomas={tomas}>
      {/* pregunta */}
      {(() => {
        const out = ramp(t, fuera1 - 0.35, fuera1);
        if (out >= 1) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: 810, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: "translate(-50%, -50%)", textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 104, lineHeight: 1.08, letterSpacing: -2, color: C.texto, whiteSpace: "nowrap", opacity: 1 - out }}>
              {[T.titulo.slice(0, 2), T.titulo.slice(2)].map((ln, i) => (
                <div key={i}>
                  {ln.map((p, k) => {
                    const s = sp(t, p.inicio - 0.04, { damping: 13, stiffness: 220 });
                    return (
                      <span key={k} style={{ display: "inline-block", marginRight: 24, opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 40}px) scale(${0.8 + 0.2 * s})`, color: i === 1 && k === 0 ? C.acento : C.texto }}>
                        {p.texto}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })()}
      {ep.iconos?.matraz && <Imagen src={ep.iconos.matraz} x={540} y={1210} w={270} t={t} at={T.permiso - 0.1} out={fuera1} rot={Math.sin((t - T.permiso) * 5) * 9} escala={1 + 0.1 * pulso(t, T.experimentar, 0.4)} />}
      <Sello texto="PERMISO PARA EXPERIMENTAR" x={540} y={1470} t={t} at={T.experimentar} out={fuera1} size={48} rot={-3} />

      {/* pruebas → te equivocas → vuelves atrás */}
      {pasos.map((p, i) => (
        <React.Fragment key={i}>
          <Caja x={140} y={p.y} w={800} h={170} t={t} at={p.at} out={fueraA} style={{ borderRadius: 40, background: C.panel, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", paddingLeft: 190, fontFamily: TITULO, fontWeight: 800, fontSize: 60, color: C.texto, boxShadow: `0 0 ${40 * pulso(t, p.at + 0.05, 0.5)}px ${C.acento}` }}>
            {p.texto}
          </Caja>
          {p.icono === "aspa" ? (
            (() => {
              const v = vis(t, p.at + 0.05, fueraA, 0.4);
              return v.on ? (
                <div style={{ position: "absolute", left: 180, top: p.y + 30, width: 110, height: 110, borderRadius: "50%", background: "rgba(247,118,142,0.16)", border: `5px solid ${ROJO}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `scale(${v.scale})` }}>
                  <Aspa size={64} p={ramp(t, p.at + 0.1, p.at + 0.4)} color={ROJO} grosor={3.6} />
                </div>
              ) : null;
            })()
          ) : (
            ep.iconos?.[p.icono] && <Imagen src={ep.iconos[p.icono]} x={235} y={p.y + 85} w={p.icono === "reloj" ? 128 : 112} t={t} at={p.at + 0.05} out={fueraA} rot={p.icono === "reloj" ? (t - p.at) * -40 * Math.exp(-(t - p.at) * 0.8) : -6} />
          )}
          {i > 0 &&
            (() => {
              const v = vis(t, p.at - 0.1, fueraA, 0.5);
              return v.on ? (
                <svg style={{ position: "absolute", left: 540 - 22, top: p.y - 48, opacity: v.opacity }} width={44} height={46} viewBox="0 0 44 46">
                  <path d="M22 4 V34 M8 22 L22 38 L36 22" fill="none" stroke={C.acento} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null;
            })()}
        </React.Fragment>
      ))}
      <Sello texto="SIN PERDER NADA" x={540} y={1560} t={t} at={T.sin + 0.1} out={fueraA} size={62} rot={-3} />

      {/* quien avanza / quien tiene miedo */}
      <Etiqueta texto="ESA SEGURIDAD" x={540} y={BY - 420} t={t} at={T.esa} out={hasta + 0.4} size={84} variante="texto" fuente="titulo" />
      <Etiqueta texto="MARCA LA DIFERENCIA" x={540} y={BY - 320} t={t} at={T.separa - 0.05} out={hasta + 0.4} size={40} variante="acento" fuente="titulo" />
      {/* carril 1 */}
      <Etiqueta texto="QUIEN AVANZA" x={130} y={BY - 215} t={t} at={T.avanza - 0.35} out={hasta + 0.4} size={40} variante="acento" fuente="titulo" ancla="izq" />
      {(() => {
        const v = vis(t, T.avanza - 0.35, hasta + 0.4, 0.9);
        if (!v.on) return null;
        return (
          <>
            <div style={{ position: "absolute", left: PISTA.x0, top: BY - 60 - 6, width: PISTA.x1 - PISTA.x0, height: 12, borderRadius: 6, background: C.borde, opacity: v.opacity }} />
            <div style={{ position: "absolute", left: PISTA.x0, top: BY - 60 - 6, width: xA - PISTA.x0, height: 12, borderRadius: 6, background: C.acento, opacity: v.opacity, boxShadow: `0 0 20px ${C.acento}` }} />
            <div style={{ position: "absolute", left: xA - 34, top: BY - 60 - 34, width: 68, height: 68, borderRadius: 20, background: C.acento, border: `5px solid ${C.texto}`, boxSizing: "border-box", opacity: v.opacity, boxShadow: `0 0 30px ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={34} height={34} viewBox="0 0 24 24"><path d="M5 12 H18 M12 5 L19 12 L12 19" fill="none" stroke={C.oscuro} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </>
        );
      })()}
      {ep.iconos?.marcador &&
        HITOS.map((h, i) => {
          const x = PISTA.x0 + (PISTA.x1 - PISTA.x0) * h - (i === 3 ? 30 : 0);
          const cuando = T.avanza - 0.1 + (T.fin + 0.2 - (T.avanza - 0.1)) * (0.18 + 0.2 * i);
          return avance >= h - 0.14 ? <Imagen key={i} src={ep.iconos!.marcador} x={x} y={BY - 150} w={66} t={t} at={cuando} out={hasta + 0.4} rot={i % 2 ? 5 : -5} sombra={false} /> : null;
        })}
      {/* carril 2 */}
      <Etiqueta texto="QUIEN TIENE MIEDO DE TOCAR" x={130} y={BY + 90} t={t} at={T.quien2 - 0.05} out={hasta + 0.4} size={36} variante="borde" fuente="titulo" ancla="izq" />
      {(() => {
        const v = vis(t, T.quien2 - 0.05, hasta + 0.4, 0.9);
        if (!v.on) return null;
        const tiembla = Math.sin(t * 38) * 4 * clamp01((t - T.miedo + 0.2) / 0.3);
        return (
          <>
            <div style={{ position: "absolute", left: PISTA.x0, top: BY + 240 - 6, width: PISTA.x1 - PISTA.x0, height: 12, borderRadius: 6, background: C.borde, opacity: v.opacity }} />
            <div style={{ position: "absolute", left: PISTA.x0 + 20 - 34 + tiembla, top: BY + 240 - 34, width: 68, height: 68, borderRadius: 20, background: C.tenue, border: `5px solid ${C.gris}`, boxSizing: "border-box", opacity: v.opacity, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 700, fontSize: 40, color: C.fondo }}>?</div>
          </>
        );
      })()}
    </Escena>
  );
};

export const eventosPorque = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.titulo[0].inicio, sfx: "pop", vol: 0.4 },
    { t: T.permiso - 0.1, sfx: "pop", vol: 0.4 },
    { t: T.experimentar + 0.08, sfx: "golpe", vol: 0.55 },
    { t: T.pruebas - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.equivocas - 0.25, sfx: "pop", vol: 0.4 },
    { t: T.vuelves - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.sin + 0.18, sfx: "golpe", vol: 0.6 },
    { t: T.esa - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.avanza, sfx: "whoosh", vol: 0.25 },
    { t: T.miedo, sfx: "tick", vol: 0.35 },
  ];
};
