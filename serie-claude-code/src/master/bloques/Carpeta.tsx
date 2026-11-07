/**
 * «¿Qué es un proyecto?»: una carpeta 3D se abre y muestra archivos («NADA MÁS»); después, tres carpetas con los logos
 * de web, YouTube y WhatsApp; y dos signos de pregunta anuncian las dos preguntas.
 * Escenas del bloque: pregunta → simple → ejemplos → dos.
 */
import React from "react";
import { Carpeta3D } from "../componentes/Carpeta3D";
import { Escena } from "../componentes/Escena";
import { IconHosting, Pregunta } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, EASE_OUT, TITULO, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

const tiempos = (L: Linea) => ({
  pregunta: L.ini("pregunta"),
  queEs: L.ini("pregunta") + 0.25,
  proyecto: L.en("pregunta", "proyecto"),
  simple: L.en("simple", "simple"),
  carpeta: L.en("simple", "carpeta"),
  archivos: L.en("simple", "archivos"),
  nada: L.en("simple", "Nada"),
  web: L.en("ejemplos", "web"),
  yt: L.en("ejemplos", "YouTube"),
  wa: L.en("ejemplos", "WhatsApp"),
  cada: L.en("ejemplos", "Cada"),
  ini2: L.ini("dos"),
  dos: L.en("dos", "dos"),
  preguntas: L.en("dos", "preguntas"),
  fin: L.fin("dos"),
});

export const Carpeta: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const ejem = T.web - 0.35; // la carpeta grande se encoge hacia su sitio
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1040, z: 0.9 },
    { t: T.simple - 0.2, x: 540, y: 1060, z: 1.0, d: 1.0 },
    { t: T.carpeta - 0.1, x: 540, y: 1120, z: 1.12, d: 1.0 },
    { t: T.nada - 0.3, x: 540, y: 1180, z: 1.0, d: 0.9 },
    { t: ejem, x: 540, y: 1180, z: 0.95, d: 0.9 },
    { t: T.dos - 0.2, x: 540, y: 1150, z: 1.02, d: 0.9 },
  ];
  // carpeta grande: entra en `pregunta`, se abre en «carpeta», muestra archivos, se encoge en «ejemplos»
  const entra = sp(t, T.simple - 0.1, { damping: 12, stiffness: 120 });
  const abre = ramp(t, T.carpeta - 0.1, T.carpeta + 0.75, EASE_OUT);
  const hojas = ramp(t, T.archivos - 0.2, T.archivos + 1.2, EASE_OUT);
  const e = ramp(t, ejem, ejem + 0.8);
  const posX = 540 + (200 - 540) * e;
  const posY = 1060 + (1150 - 1060) * e;
  const escala = 1 + (0.42 - 1) * e;
  const qOut = ejem + 0.3;
  const rowY = 1150;
  const carpetas = [
    { x: 200, at: T.web, id: "web" },
    { x: 540, at: T.yt, id: "youtube" },
    { x: 880, at: T.wa, id: "whatsapp" },
  ] as const;
  const dosOut = hasta + 0.3;
  return (
    <Escena t={t} tomas={tomas}>
      {/* pregunta del tema */}
      {(() => {
        const v = vis(t, T.queEs - 0.05, T.simple - 0.15, 0.7);
        return v.on ? (
          <div style={{ position: "absolute", left: 540, top: 880, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, opacity: v.opacity, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 112, lineHeight: 1.05, color: C.texto, whiteSpace: "nowrap" }}>
              ¿QUÉ ES UN
              <br />
              <span style={{ color: C.acento }}>PROYECTO?</span>
            </div>
          </div>
        ) : null;
      })()}
      {/* carpeta grande */}
      {entra > 0.001 && (
        <div style={{ position: "absolute", left: posX, top: posY, width: 0, height: 0, opacity: Math.min(1, entra * 2) * (1 - ramp(t, T.dos, T.dos + 0.5) * 0.65) }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${(0.4 + 0.6 * entra) * escala}) translateY(${(1 - entra) * 120}px)` }}>
            <Carpeta3D w={600} abre={abre} hojas={hojas} n={4} t={t} />
          </div>
        </div>
      )}
      <Sello texto="NADA MÁS" x={540} y={1500} t={t} at={T.nada} out={qOut} size={96} rot={-4} />
      {/* tres carpetas con su logo */}
      {carpetas.map((c) => {
        const v = vis(t, c.at - 0.1, dosOut, 0.4);
        if (!v.on) return null;
        const w = 270;
        return (
          <React.Fragment key={c.id}>
            {c.id !== "web" && (
              <div style={{ position: "absolute", left: c.x, top: rowY, width: 0, height: 0, opacity: v.opacity }}>
                <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})` }}>
                  <Carpeta3D w={w} abre={1} hojas={1} n={3} t={t + c.x} />
                </div>
              </div>
            )}
            {c.id === "web" && (
              <div style={{ position: "absolute", left: 0, top: 0, opacity: ramp(t, ejem + 0.5, ejem + 0.8) }}>
                <div style={{ position: "absolute", left: c.x, top: rowY, width: 0, height: 0 }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
      {/* iconos sobre cada carpeta (el de la web es genérico: no hay logo de marca) */}
      {(() => {
        const v = vis(t, T.web - 0.05, dosOut, 0.3);
        return v.on ? (
          <div style={{ position: "absolute", left: 200 - 58, top: rowY - 220, width: 116, height: 116, borderRadius: "50%", background: C.panel, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `scale(${v.scale})` }}>
            <IconHosting s={74} color={C.acento} />
          </div>
        ) : null;
      })()}
      <Logo src="logos/youtube.png" x={540} y={rowY - 160} w={150} t={t} at={T.yt - 0.05} out={dosOut} sombra={false} />
      <Logo src="logos/whatsapp.png" x={880} y={rowY - 160} w={130} t={t} at={T.wa - 0.05} out={dosOut} sombra={false} />
      <Etiqueta texto="UNA WEB" x={200} y={rowY + 230} t={t} at={T.web} out={dosOut} size={36} variante="borde" />
      <Etiqueta texto="UN CANAL" x={540} y={rowY + 230} t={t} at={T.yt} out={dosOut} size={36} variante="borde" />
      <Etiqueta texto="UN AGENTE" x={880} y={rowY + 230} t={t} at={T.wa} out={dosOut} size={36} variante="borde" />
      <Etiqueta texto="CADA UNO, SU CARPETA" x={540} y={rowY + 340} t={t} at={T.cada} out={T.ini2 - 0.1} size={46} variante="acento" fuente="titulo" />
      {/* dos signos de pregunta */}
      {[T.dos, T.preguntas].map((at, i) => {
        const v = vis(t, at - 0.05, dosOut, 0.2);
        if (!v.on) return null;
        const x = 400 + i * 280;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 800, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale * 1.15}) rotate(${(1 - v.s) * 30 + (i ? 7 : -7)}deg)` }}>
              <Pregunta s={330} />
            </div>
          </div>
        );
      })}
    </Escena>
  );
};

export const eventosCarpeta = (L: Linea, _ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.simple, sfx: "pop", vol: 0.45 },
    { t: T.carpeta, sfx: "whoosh", vol: 0.35 },
    { t: T.archivos, sfx: "pop", vol: 0.4 },
    { t: T.nada, sfx: "golpe", vol: 0.55 },
    { t: T.web, sfx: "pop", vol: 0.4 },
    { t: T.yt, sfx: "pop", vol: 0.4 },
    { t: T.wa, sfx: "pop", vol: 0.4 },
    { t: T.dos, sfx: "pop", vol: 0.45 },
    { t: T.preguntas, sfx: "pop", vol: 0.45 },
  ];
};
