/** Avance: tarjeta con candado que se abre. Parte 1 → «PARTE 2» con Visual Studio Code y extensiones; parte 2 → «EP.4» y «COSAS MUY GORDAS». */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { IconCandado, IconPuzle } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Etiqueta } from "../componentes/Sello";
import { C, EASE_OUT, TITULO, ramp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

const ID = "avance";
const tiempos = (L: Linea) => ({
  ini: L.ini(ID),
  parte: L.en(ID, "parte"),
  dos: L.en(ID, "dos"),
  instalamos: L.en(ID, "instalamos"),
  claude: L.en(ID, "Claude"),
  visual: L.en(ID, "Visual"),
  extensiones: L.en(ID, "extensiones"),
  fin: L.fin(ID),
});

export const Avance: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const out = hasta + 0.3;
  const sig = (ep.parte ?? 0) + 1;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1100, z: 0.9 },
    { t: T.parte - 0.3, x: 540, y: 960, z: 1.12, d: 1.0 },
    { t: T.instalamos - 0.2, x: 540, y: 1120, z: 1.04, d: 0.9 },
    { t: T.extensiones - 0.4, x: 540, y: 1250, z: 1.0, d: 0.9 },
  ];
  const card = vis(t, desde + 0.05, out, 0.8);
  const abre = ramp(t, T.dos - 0.05, T.dos + 0.55, EASE_OUT);
  const tiembla = t > T.parte && t < T.dos - 0.05 ? Math.sin(t * 38) * 4 : 0;
  const titulo = vis(t, T.dos, out, 0.5);
  const ico = (k: number, at: number) => vis(t, at - 0.05, out, 0.3);
  return (
    <Escena t={t} tomas={tomas}>
      {card.on && (
        <div style={{ position: "absolute", left: 110, top: 640, width: 860, height: 990, borderRadius: 52, background: `linear-gradient(180deg, ${C.acento}22, ${C.panel} 45%)`, border: `4px solid ${abre > 0.3 ? C.acento : C.borde}`, opacity: card.opacity, transform: `scale(${card.scale})`, boxShadow: `0 40px 100px rgba(0,0,0,0.55), 0 0 ${70 * abre}px ${C.acento}55` }} />
      )}
      {/* candado */}
      {card.on && (
        <div style={{ position: "absolute", left: 540 - 105 + tiembla, top: 730, width: 210, height: 210, opacity: card.opacity, transform: `scale(${card.scale * (1 + 0.1 * Math.sin(abre * Math.PI))})` }}>
          <IconCandado s={210} color={abre > 0.5 ? C.acento : C.gris} abierto={abre} w={3.4} />
        </div>
      )}
      {titulo.on && (
        <>
          <div style={{ position: "absolute", left: 540, top: 1070, width: 0, height: 0, opacity: titulo.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${titulo.scale * 1.05})`, fontFamily: TITULO, fontWeight: 800, fontSize: 150, color: C.texto, whiteSpace: "nowrap", letterSpacing: -3 }}>
              PARTE <span style={{ color: C.acento }}>{sig}</span>
            </div>
          </div>
          <Etiqueta texto={ep.avance?.titulo.toUpperCase() ?? ""} x={540} y={1190} t={t} at={T.instalamos - 0.1} out={out} size={46} variante="acento" fuente="titulo" />
        </>
      )}
      {/* iconos de la parte siguiente */}
      {(() => {
        const a = ico(0, T.claude);
        return a.on ? (
          <div style={{ position: "absolute", left: 270 - 70, top: 1400 - 70, width: 140, height: 140, borderRadius: "50%", background: C.fondo, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: a.opacity, transform: `scale(${a.scale})` }}>
            <Img src={staticFile(ep.logos.claude_code)} style={{ width: 96 }} />
          </div>
        ) : null;
      })()}
      <Logo src={ep.logos.vscode} x={540} y={1400} w={130} t={t} at={T.visual - 0.05} out={out} />
      {(() => {
        const a = ico(2, T.extensiones);
        return a.on ? (
          <div style={{ position: "absolute", left: 810 - 70, top: 1400 - 70, width: 140, height: 140, borderRadius: 34, background: C.panel2, border: `4px solid ${C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: a.opacity, transform: `scale(${a.scale}) rotate(${(1 - a.s) * 25}deg)` }}>
            <IconPuzle s={92} color={C.acento} />
          </div>
        ) : null;
      })()}
      <Etiqueta texto="+" x={405} y={1400} t={t} at={T.visual - 0.1} out={out} size={60} variante="gris" fuente="titulo" />
      <Etiqueta texto="+" x={675} y={1400} t={t} at={T.extensiones - 0.1} out={out} size={60} variante="gris" fuente="titulo" />
    </Escena>
  );
};

export const eventosAvance = (L: Linea, _ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.parte, sfx: "pop", vol: 0.35 },
    { t: T.dos, sfx: "golpe", vol: 0.5 },
    { t: T.claude, sfx: "pop", vol: 0.4 },
    { t: T.visual, sfx: "pop", vol: 0.4 },
    { t: T.extensiones, sfx: "pop", vol: 0.4 },
  ];
};
