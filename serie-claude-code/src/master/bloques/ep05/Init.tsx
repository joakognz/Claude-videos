/**
 * EP.5 · bloque «/init» (escena init):
 * ¿Se escribe a mano? (una hoja que se rellena con un lápiz) → NO (sello) → existe un comando: la mascota de
 * Claude Code y la caja de entrada donde se escribe «/init» en grande.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Documento } from "../../componentes/Piezas";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { C, MONO, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Caret, Frase, Picto } from "../../ep05/kit";

const CMD = { x: 540, y: 2420 };

const tiempos = (L: Linea) => ({
  y: L.ini("init"),
  se: L.en("init", "se"),
  escribe: L.en("init", "escribe"),
  a: L.en("init", "a"),
  mano: L.en("init", "mano"),
  no: L.en("init", "No"),
  existe: L.en("init", "Existe"),
  un: L.en("init", "un"),
  comando: L.en("init", "comando"),
  init: L.en("init", "/init"),
  fin: L.fin("init"),
});

export const Init: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1060, z: 1.0 },
    { t: T.escribe - 0.1, x: 560, y: 1120, z: 1.14, d: 0.9 },
    { t: T.no - 0.08, x: 540, y: 1080, z: 1.02, d: 0.35 },
    { t: T.existe - 0.25, x: 540, y: 2300, z: 1.0, d: 0.9 },
    { t: T.init - 0.2, x: 540, y: CMD.y - 20, z: 1.14, d: 0.7 },
    { t: T.fin, x: 540, y: CMD.y - 40, z: 1.08, d: 0.9 },
  ];
  // la hoja se rellena mientras se pregunta «¿a mano?»
  const lineas = ramp(t, T.y, T.no, (n) => n) * 8;
  const lapizX = 400 + ((lineas % 1) * 260);
  const lapizY = 990 + Math.min(8, Math.floor(lineas)) * 33;
  const golpeNo = Math.sin(clamp01((t - T.no) / 0.25) * Math.PI) * 14;
  const typed = "/init".slice(0, Math.round(clamp01((t - (T.init - 0.35)) / 0.45) * 5));
  const brillo = ramp(t, T.init, T.init + 0.3) * (1 - 0.3 * ramp(t, T.init + 0.6, T.init + 1.4));
  return (
    <Escena t={t} tomas={tomas}>
      <div style={{ position: "absolute", left: 540, top: 720, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
          <Frase
            t={t}
            out={T.existe}
            size={72}
            palabras={[
              { w: "¿Y", at: T.y },
              { w: "se", at: T.se },
              { w: "escribe", at: T.escribe },
              { w: "a", at: T.a },
              { w: "mano?", at: T.mano, acento: true },
            ]}
          />
        </div>
      </div>
      {(() => {
        const v = vis(t, T.y - 0.05, T.existe, 0.8);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540 - 190, top: 880, opacity: v.opacity * (1 - 0.45 * ramp(t, T.no, T.no + 0.2)), transform: `scale(${v.scale}) translateX(${golpeNo}px) rotate(-3deg)` }}>
            <Documento w={380} t={t} lineas={lineas} />
          </div>
        );
      })()}
      {t > T.y && t < T.no + 0.1 && (
        <div style={{ position: "absolute", left: lapizX, top: lapizY - 100, transform: `rotate(${Math.sin(t * 18) * 6}deg)`, filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.5))" }}>
          <Picto nombre="lapiz" size={110} color={C.acento} grosor={2.4} />
        </div>
      )}
      <Sello texto="NO" x={540} y={1110} t={t} at={T.no} out={T.existe + 0.2} size={150} rot={-10} />

      {/* existe un comando */}
      <Etiqueta texto="EXISTE UN COMANDO" x={540} y={CMD.y - 360} t={t} at={T.existe} out={hasta + 0.4} size={40} variante="borde" fuente="titulo" />
      <Logo src={ep.logos.claude_code} x={540} y={CMD.y - 210} w={150} t={t} at={T.comando - 0.1} pulsos={[T.init]} sombra={false} />
      {(() => {
        const v = vis(t, T.un - 0.1, hasta + 0.4, 0.8);
        if (!v.on) return null;
        const s = sp(t, T.init, { damping: 10, stiffness: 240 });
        const golpe = t > T.init ? Math.sin(Math.min(1, s) * Math.PI) * 0.08 : 0;
        return (
          <div style={{ position: "absolute", left: CMD.x, top: CMD.y, width: 0, height: 0 }}>
            <div
              style={{
                position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale * (1 + golpe)})`, opacity: v.opacity,
                width: 820, height: 230, borderRadius: 36, background: "#1B1B1B", border: `5px solid ${brillo > 0.2 ? C.acento : "#C44B3B"}`,
                boxShadow: `0 40px 90px rgba(0,0,0,0.6), 0 0 ${80 * brillo}px ${C.acento}77`, display: "flex", alignItems: "center", padding: "0 56px", boxSizing: "border-box",
              }}
            >
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 150, color: typed ? C.acento : "#5A5A5A", letterSpacing: 2 }}>{typed || " "}</span>
              <Caret t={t} h={140} color={C.texto} />
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="Claude crea el CLAUDE.md por ti" x={540} y={CMD.y + 210} t={t} at={T.init + 0.25} out={hasta + 0.4} size={34} variante="gris" />
    </Escena>
  );
};

export const eventosInit = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.escribe, sfx: "tecleo", vol: 0.18, dur: T.no - T.escribe },
    { t: T.no + 0.05, sfx: "golpe", vol: 0.55 },
    { t: T.existe - 0.2, sfx: "whoosh", vol: 0.3 },
    { t: T.comando, sfx: "pop", vol: 0.35 },
    { t: T.init - 0.35, sfx: "tecleo", vol: 0.3, dur: 0.45 },
    { t: T.init + 0.08, sfx: "golpe", vol: 0.5 },
  ];
};
