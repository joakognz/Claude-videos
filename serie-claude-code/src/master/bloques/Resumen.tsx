/** Resumen en dos iconos: una carpeta y dos preguntas (qué lleva, dónde vive). */
import React from "react";
import { Carpeta3D } from "../componentes/Carpeta3D";
import { Escena } from "../componentes/Escena";
import { IconCara, IconHosting, IconMemoria, IconMotor, IconNube, IconOrdenador, IconVps, Pregunta } from "../componentes/Iconos";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, EASE_OUT, TITULO, ramp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";
import { VERDE } from "./Hecho";
import { AZUL } from "./Vive";

const ID = "resumen";
const tiempos = (L: Linea) => ({
  resumen: L.en(ID, "Resumen"),
  carpeta: L.en(ID, "carpeta"),
  lleva: L.en(ID, "lleva"),
  vive: L.en(ID, "vive"),
  fin: L.fin(ID),
});

export const Resumen: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const out = hasta + 0.3;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1080, z: 0.9 },
    { t: T.carpeta - 0.3, x: 300, y: 1150, z: 1.22, d: 0.9 },
    { t: T.lleva - 0.3, x: 780, y: 1000, z: 1.22, d: 0.9 },
    { t: T.vive - 0.1, x: 780, y: 1330, z: 1.22, d: 0.8 },
    { t: T.fin - 0.5, x: 540, y: 1150, z: 0.95, d: 1.0 },
  ];
  const c = vis(t, T.carpeta - 0.1, out, 0.4);
  const q1 = vis(t, T.lleva - 0.1, out, 0.4);
  const q2 = vis(t, T.vive - 0.15, out, 0.4);
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="RESUMEN RÁPIDO" x={540} y={760} t={t} at={T.resumen} out={T.carpeta - 0.15} size={70} rot={-3} />
      {/* icono 1: la carpeta */}
      {c.on && (
        <>
          <div style={{ position: "absolute", left: 70, top: 880, width: 460, height: 600, borderRadius: 44, background: C.panel, border: `4px solid ${C.acento}`, opacity: c.opacity, transform: `scale(${c.scale})`, boxShadow: `0 0 60px ${C.acento}33` }} />
          <div style={{ position: "absolute", left: 300, top: 1110, width: 0, height: 0, opacity: c.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${c.scale})` }}>
              <Carpeta3D w={330} abre={ramp(t, T.carpeta, T.carpeta + 0.7, EASE_OUT)} hojas={ramp(t, T.carpeta + 0.3, T.carpeta + 1.3, EASE_OUT)} n={3} t={t} />
            </div>
          </div>
          <Etiqueta texto="UNA CARPETA" x={300} y={1400} t={t} at={T.carpeta + 0.2} out={out} size={44} variante="acento" fuente="titulo" />
        </>
      )}
      {/* icono 2: las dos preguntas */}
      {(q1.on || q2.on) && (
        <div style={{ position: "absolute", left: 550, top: 880, width: 460, height: 600, borderRadius: 44, background: C.panel, border: `4px solid ${C.borde}`, opacity: Math.max(q1.opacity, 0), transform: `scale(${q1.scale})` }} />
      )}
      {q1.on && (
        <div style={{ position: "absolute", left: 580, top: 920, width: 400, display: "flex", flexDirection: "column", alignItems: "center", opacity: q1.opacity, transform: `scale(${q1.scale})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Pregunta s={150} color={VERDE} />
            <div style={{ display: "flex", gap: 8 }}>
              {[IconCara, IconMotor, IconMemoria].map((Ic, i) => (
                <Ic key={i} s={56} color={VERDE} />
              ))}
            </div>
          </div>
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 42, color: VERDE, marginTop: 6 }}>QUÉ LLEVA</div>
        </div>
      )}
      {q2.on && (
        <div style={{ position: "absolute", left: 580, top: 1210, width: 400, display: "flex", flexDirection: "column", alignItems: "center", opacity: q2.opacity, transform: `scale(${q2.scale})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Pregunta s={150} color={AZUL} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
              {[IconOrdenador, IconHosting, IconVps, IconNube].map((Ic, i) => (
                <Ic key={i} s={52} color={AZUL} />
              ))}
            </div>
          </div>
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 42, color: AZUL, marginTop: 6 }}>DÓNDE VIVE</div>
        </div>
      )}
    </Escena>
  );
};

export const eventosResumen = (L: Linea, _ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.resumen, sfx: "golpe", vol: 0.45 },
    { t: T.carpeta, sfx: "pop", vol: 0.45 },
    { t: T.lleva, sfx: "pop", vol: 0.45 },
    { t: T.vive, sfx: "pop", vol: 0.45 },
  ];
};
