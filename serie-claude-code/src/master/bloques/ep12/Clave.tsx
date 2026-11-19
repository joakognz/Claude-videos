/**
 * EP.12 · La línea roja (escena clave): una línea roja cruza la pantalla → Google pide verificar la cuenta → Claude
 * espera (pausa) y es tu turno (tu mano): la contraseña la escribes tú en la página → en el chat, nunca (tachada) →
 * le dices «ya lo tienes» y Claude sigue.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Caja, Insignia } from "../../componentes/ep12/Piezas12";
import { PaginaVerificar, PanelClaude, escrito } from "../../componentes/ep12/Pantallas12";
import { C, TITULO, clamp01, ramp, sp } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "clave";
const ROJO = "#E5484D";
const YV = 1190; // verificación
const YP = 2010; // panel de Claude Code
const HP = 540;

const tiempos = (L: Linea) => ({
  pero: L.en(E, "Pero"),
  linea: L.en(E, "línea"),
  cuando: L.en(E, "cuando"),
  contrasena: L.en(E, "contraseña,"),
  ese: L.en(E, "ese paso"),
  tuyo: L.en(E, "tuyo."),
  escribela: L.en(E, "Escríbela"),
  pagina: L.en(E, "página,"),
  nunca: L.en(E, "nunca"),
  chat: L.en(E, "chat."),
  dices: L.en(E, "dices"),
  ya: L.en(E, "«ya"),
  tienes: L.en(E, "tienes»,"),
  claude: L.en(E, "Claude"),
  sigue: L.en(E, "sigue."),
});

export const Clave: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1100, z: 1.0 },
    { t: T.cuando - 0.2, x: 540, y: YV - 20, z: 1.02, d: 0.9 },
    { t: T.nunca - 0.45, x: 540, y: YP - 70, z: 1.0, d: 0.8 },
  ];
  const raya = ramp(t, T.linea - 0.1, T.linea + 0.45);
  const puntos = ramp(t, T.escribela + 0.1, T.pagina + 0.1, (x) => x) * 10;
  // el chat: primero la contraseña (mal: se tacha), luego «ya lo tienes»
  const MAL = "mi contraseña es ••••••••";
  const entrada = t < T.dices ? escrito(MAL, t, T.nunca - 0.35, T.nunca + 0.15) : t < T.tienes + 0.45 ? escrito("ya lo tienes", t, T.ya - 0.05, T.tienes + 0.2) : "";
  const tacha = ramp(t, T.chat - 0.1, T.chat + 0.25) * (1 - ramp(t, T.dices - 0.1, T.dices));
  const mensajes = [
    { at: T.tienes + 0.45, de: "tu" as const, contenido: "ya lo tienes" },
    { at: T.claude + 0.05, de: "claude" as const, contenido: "Perfecto. Sigo con el proyecto." },
  ];
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="OJO" x={540} y={760} t={t} at={T.pero} out={T.linea - 0.15} size={70} />
      {/* la línea roja */}
      {raya > 0 && <div style={{ position: "absolute", left: 40, top: 800 - 6, width: 1000 * raya, height: 12, borderRadius: 6, background: ROJO, boxShadow: `0 0 26px ${ROJO}` }} />}
      <Caja x={540} y={800} t={t} at={T.linea + 0.2}>
        <div style={{ padding: "12px 30px", borderRadius: 999, background: C.fondo, border: `4px solid ${ROJO}`, fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: ROJO, letterSpacing: 1 }}>LÍNEA ROJA</div>
      </Caja>
      {/* Google pide la contraseña */}
      <Caja x={540} y={YV} t={t} at={T.cuando} desde={0.85}>
        <PaginaVerificar t={t} w={840} foco={T.contrasena} puntos={puntos} />
      </Caja>
      <Caja x={880} y={YV - 300} t={t} at={T.ese - 0.1}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 22px 10px 10px", borderRadius: 999, background: C.panel, border: `3px solid ${C.acento}`, boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }}>
          <Img src={staticFile(ep.logos.claude)} style={{ width: 52 }} />
          <Insignia s={52} tipo="pausa" />
          <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 30, color: C.texto }}>ESPERA</span>
        </div>
      </Caja>
      <Caja x={150} y={YV + 260} t={t} at={T.tuyo - 0.15} rot={-10} desde={0.3}>
        <Img src={staticFile(ep.imagenes!.mano)} style={{ width: 190, display: "block", filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.6))" }} />
      </Caja>
      <Etiqueta texto="TU TURNO" x={540} y={YV + 360} t={t} at={T.tuyo} out={T.nunca - 0.3} size={38} variante="acento" fuente="titulo" />
      <Etiqueta texto="EN LA PÁGINA, SÍ" x={540} y={YV + 360} t={t} at={T.pagina} out={T.nunca + 0.4} size={34} variante="borde" />

      {/* en el chat, nunca */}
      <Sello texto="NUNCA EN EL CHAT" x={540} y={YP - HP / 2 - 70} t={t} at={T.chat - 0.1} out={T.ya} size={52} />
      <Etiqueta texto="«YA LO TIENES»" x={540} y={YP - HP / 2 - 70} t={t} at={T.ya} out={T.claude} size={40} variante="borde" fuente="titulo" />
      <Caja x={540} y={YP} t={t} at={T.nunca - 0.5} desde={0.85}>
        <PanelClaude t={t} w={920} h={HP} logoVs={ep.logos.vscode} logoCc={ep.logos.claude_code} mensajes={mensajes} entrada={entrada} foco={t < T.tienes + 0.45} resalteEntrada={tacha > 0 ? ROJO : undefined} />
      </Caja>
      {tacha > 0 && (
        <>
          <div style={{ position: "absolute", left: 130, top: YP + HP / 2 - 108, width: 560 * clamp01(tacha * 1.3), height: 8, borderRadius: 4, background: ROJO }} />
          <div style={{ position: "absolute", left: 900 - 45, top: YP + HP / 2 - 150, transform: `scale(${sp(t, T.chat - 0.05, { damping: 9, stiffness: 240 }) * (1 - ramp(t, T.dices - 0.2, T.dices))})` }}>
            <Insignia s={90} tipo="cruz" color={ROJO} />
          </div>
        </>
      )}
      <Caja x={540} y={YP + HP / 2 + 60} t={t} at={T.sigue - 0.2}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Insignia s={66} tipo="play" />
          <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto }}>CLAUDE SIGUE</span>
        </div>
      </Caja>
    </Escena>
  );
};

export const eventosClave = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.pero, sfx: "golpe", vol: 0.45 },
    { t: T.linea - 0.1, sfx: "whoosh", vol: 0.35 },
    { t: T.cuando, sfx: "pop", vol: 0.3 },
    { t: T.ese - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.escribela + 0.1, sfx: "tecleo", vol: 0.25, dur: T.pagina - T.escribela },
    { t: T.nunca - 0.35, sfx: "tecleo", vol: 0.2, dur: 0.5 },
    { t: T.chat - 0.1, sfx: "golpe", vol: 0.45 },
    { t: T.ya - 0.05, sfx: "tecleo", vol: 0.25, dur: 0.6 },
    { t: T.tienes + 0.45, sfx: "envio", vol: 0.4 },
    { t: T.sigue - 0.2, sfx: "tick", vol: 0.45 },
  ];
};
