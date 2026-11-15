/**
 * EP.9 · Parte 2 · PASO 3 «Remote Control» (escena remote): en el cuadro de Claude se teclea /remote-control con el
 * menú de comandos → «Remote Control is active · Continue here, on your phone, or at claude.ai/code» → la misma
 * conversación en el móvil (app de Claude) y en el navegador (claude.ai/code) → desde fuera se pide «añade el pan de
 * centeno a la portada» → lo hace tu ordenador: la web estrena la novedad → DÉJALO ENCENDIDO.
 * Mensajes y proyecto ficticios.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { ChatClaude, teclea } from "../../componentes/ep09/Chat";
import type { Mensaje } from "../../componentes/ep09/Chat";
import { WebPanaderia } from "../../componentes/ep09/Panaderia";
import { IcoMovil, Movil, Pos } from "../../componentes/ep09/Piezas9";
import { C, EASE, MONO, TITULO, UI, clamp01, ramp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "remote";
const tiempos = (L: Linea) => ({
  paso: L.en(E, "Paso"),
  remote: L.en(E, "Remote"),
  desde: L.en(E, "desde"),
  en: L.en(E, "En el cuadro"),
  escribe: L.en(E, "escribe"),
  comando: L.en(E, "/remote-control."),
  a: L.en(E, "A partir"),
  sigues: L.en(E, "sigues"),
  misma: L.en(E, "misma"),
  app: L.en(E, "app"),
  navegador: L.en(E, "navegador."),
  pides: L.en(E, "Pides"),
  cambio: L.en(E, "cambio"),
  fuera: L.en(E, "fuera,"),
  hace: L.en(E, "hace"),
  ordenador: L.en(E, "ordenador."),
  eso: L.en(E, "Eso"),
  encendido: L.en(E, "encendido."),
});

const CHAT = { x: 70, y: 1080, w: 940, h: 620 };
const MOVIL = { x: 280, y: 2300, w: 400 };
const NAV = { x: 790, y: 2140, w: 500 };
const PEDIDO = "añade el pan de centeno a la portada";

export const Remote: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tecleaIni = T.escribe + 0.35;
  const tecleaFin = T.a - 0.25;
  const envia = T.a - 0.15;
  const comando = t < envia ? teclea("/remote-control", t, tecleaIni, tecleaFin) : "";
  const pideIni = T.cambio;
  const pideFin = T.fuera + 0.1;
  const enviaMovil = T.fuera + 0.3;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1040, z: 1.0 },
    { t: T.en - 0.3, x: 560, y: 1420, z: 1.04, d: 0.9 },
    { t: T.sigues - 0.3, x: 540, y: 2220, z: 1.0, d: 0.9 },
    { t: T.hace - 0.35, x: 540, y: 1850, z: 0.8, d: 0.8 },
    { t: T.eso - 0.2, x: 540, y: 1400, z: 1.0, d: 0.8 },
  ];
  const mensajesChat: Mensaje[] = [
    { tipo: "yo", at: 0, texto: "añade la sección de encargos" },
    { tipo: "claude", at: 0, texto: "Hecho: sección de encargos lista." },
    {
      tipo: "sistema", at: envia + 0.1,
      texto: <span>Remote Control is active · Continue here, on your phone, or at <span style={{ color: "#4FA3FF" }}>claude.ai/code</span></span>,
    },
    { tipo: "yo", at: enviaMovil + 0.15, texto: PEDIDO },
    { tipo: "claude", at: T.hace + 0.1, texto: "Hecho: novedad en la portada." },
  ];
  const vMov = vis(t, T.app - 0.15, hasta + 0.3, 0.7);
  const vNav = vis(t, T.navegador - 0.15, T.pides + 0.2, 0.7);
  const vWeb = vis(t, T.cambio - 0.1, hasta + 0.3, 0.75);
  const sync = ramp(t, T.misma - 0.1, T.misma + 0.6, EASE);
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 3" x={540} y={740} t={t} at={T.paso} out={T.en} size={60} rot={-5} />
      <Etiqueta texto="REMOTE CONTROL" x={540} y={860} t={t} at={T.remote - 0.05} out={T.en + 0.2} size={72} variante="texto" fuente="titulo" />
      <Pos x={540} y={975} t={t} at={T.desde - 0.05} out={T.en + 0.2}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 28px", borderRadius: 999, background: C.acento, boxShadow: `0 12px 40px ${C.acento}66` }}>
          <IcoMovil s={44} color={C.oscuro} grosor={2.6} />
          <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.oscuro }}>DESDE EL MÓVIL</span>
        </div>
      </Pos>

      {/* ── el ordenador: Visual Studio Code con Claude Code ── */}
      <div style={{ position: "absolute", left: CHAT.x, top: CHAT.y }}>
        <ChatClaude
          t={t} w={CHAT.w} h={CHAT.h} logoVs={ep.logos.vscode} logoCc={ep.logos.claude_code}
          entrada={comando} foco={t > T.en && t < envia} envia={envia}
          barra={{ abre: tecleaIni + 0.05, cierra: envia, resalta: comando.length > 2 ? "/remote-control" : undefined, filtro: comando || "/" }}
          remote={envia + 0.1}
          mensajes={mensajesChat}
        />
      </div>
      {t > T.eso - 0.1 && (
        <div style={{ position: "absolute", left: 760, top: 1040, display: "flex", alignItems: "center", gap: 12, padding: "10px 22px", borderRadius: 999, background: "#123222", border: "3px solid #4EC97B", opacity: clamp01((t - T.eso + 0.1) / 0.2), whiteSpace: "nowrap" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#4EC97B", boxShadow: `0 0 ${10 + 8 * Math.sin(t * 6)}px #4EC97B` }} />
          <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: "#C9F5DA" }}>Encendido</span>
        </div>
      )}

      {/* ── la misma conversación en el móvil y en el navegador ── */}
      <svg width={1080} height={2600} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {sync > 0 &&
          [MOVIL.x, NAV.x].map((x, k) => (
            <path key={k} d={`M ${540 + (k ? 120 : -120)} ${CHAT.y + CHAT.h} C ${540 + (k ? 120 : -120)} ${CHAT.y + CHAT.h + 120}, ${x} ${CHAT.y + CHAT.h + 60}, ${x} ${1890}`} fill="none" stroke={C.acento} strokeWidth={7} strokeLinecap="round" strokeDasharray="4 18" strokeDashoffset={-t * 60} opacity={sync * (k === 1 ? 1 - ramp(t, T.pides, T.pides + 0.3) : 1)} />
          ))}
      </svg>
      {vMov.on && (
        <div style={{ position: "absolute", left: MOVIL.x, top: MOVIL.y, width: 0, height: 0, opacity: vMov.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vMov.y}px) scale(${vMov.scale}) rotate(${-3 * vMov.s}deg)` }}>
            <Movil
              w={MOVIL.w} t={t} logo={ep.logos.claude}
              entrada={t < enviaMovil ? teclea(PEDIDO, t, pideIni, pideFin) : ""}
              envia={enviaMovil}
              mensajes={[
                { yo: true, texto: "añade la sección de encargos", at: 0 },
                { yo: false, texto: "Hecho: sección de encargos lista.", at: 0 },
                { yo: true, texto: PEDIDO, at: enviaMovil + 0.05 },
                { yo: false, texto: "Hecho: novedad en la portada.", at: T.hace + 0.15 },
              ]}
            />
          </div>
        </div>
      )}
      <Etiqueta texto="APP DE CLAUDE" x={MOVIL.x} y={1860} t={t} at={T.app} out={T.pides} size={32} variante="acento" fuente="titulo" />
      {vNav.on && (
        <div style={{ position: "absolute", left: NAV.x, top: NAV.y, width: 0, height: 0, opacity: vNav.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vNav.y}px) scale(${vNav.scale})`, width: NAV.w, borderRadius: 22, overflow: "hidden", background: "#262624", border: `3px solid ${C.borde}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ height: 56, background: "#2A2C33", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c, opacity: 0.85 }} />
              ))}
              <div style={{ flex: 1, marginLeft: 10, height: 34, borderRadius: 17, background: "#16181D", display: "flex", alignItems: "center", padding: "0 14px", fontFamily: MONO, fontWeight: 500, fontSize: 24, color: "#C9CCD3" }}>claude.ai/code</div>
            </div>
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12, fontFamily: UI }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Img src={staticFile(ep.logos.claude)} style={{ width: 32 }} />
                <span style={{ fontFamily: MONO, fontSize: 20, color: "#9A978F" }}>web-panaderia</span>
              </div>
              <div style={{ alignSelf: "flex-end", padding: "10px 14px", borderRadius: 14, background: "#3A3936", color: "#ECEAE4", fontSize: 25 }}>añade la sección de encargos</div>
              <div style={{ padding: "10px 14px", borderRadius: 14, border: "2px solid #3A3936", color: "#ECEAE4", fontSize: 25 }}>Hecho: sección de encargos lista.</div>
            </div>
          </div>
        </div>
      )}
      <Etiqueta texto="O EL NAVEGADOR" x={NAV.x} y={1880} t={t} at={T.navegador} out={T.pides} size={32} variante="acento" fuente="titulo" />

      {/* ── pides un cambio desde fuera; lo hace tu ordenador ── */}
      <Etiqueta texto="ESTÁS FUERA" x={MOVIL.x} y={1860} t={t} at={T.fuera - 0.1} out={T.eso} size={32} variante="borde" fuente="titulo" />
      {vWeb.on && (
        <div style={{ position: "absolute", left: 790, top: 2240, width: 0, height: 0, opacity: vWeb.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vWeb.y}px) scale(${vWeb.scale})` }}>
            <WebPanaderia w={440} t={t} whatsapp={1} logoWhatsapp={ep.logos.whatsapp} novedad={ramp(t, T.hace + 0.1, T.ordenador + 0.3)} img={ep.imagenes!.panaderia} />
          </div>
        </div>
      )}
      <Etiqueta texto="TU WEB" x={790} y={1880} t={t} at={T.cambio} out={T.hace - 0.1} size={32} variante="borde" fuente="titulo" />
      <Etiqueta texto="LO HACE TU ORDENADOR" x={540} y={1790} t={t} at={T.ordenador - 0.2} out={T.encendido - 0.35} size={40} variante="acento" fuente="titulo" />
      <Sello texto="DÉJALO ENCENDIDO" x={540} y={1790} t={t} at={T.encendido - 0.3} out={hasta + 0.3} size={54} rot={-4} />
    </Escena>
  );
};

export const eventosRemote = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.remote, sfx: "pop", vol: 0.35 },
    { t: T.desde, sfx: "pop", vol: 0.35 },
    { t: T.escribe + 0.35, sfx: "tecleo", vol: 0.25, dur: T.a - 0.25 - (T.escribe + 0.35) },
    { t: T.a - 0.15, sfx: "envio", vol: 0.45 },
    { t: T.misma - 0.1, sfx: "whoosh", vol: 0.3 },
    { t: T.app - 0.15, sfx: "pop", vol: 0.4 },
    { t: T.navegador - 0.15, sfx: "pop", vol: 0.4 },
    { t: T.cambio, sfx: "tecleo", vol: 0.22, dur: T.fuera + 0.1 - T.cambio },
    { t: T.fuera + 0.3, sfx: "envio", vol: 0.45 },
    { t: T.hace + 0.1, sfx: "pop", vol: 0.4 },
    { t: T.eso - 0.1, sfx: "tick", vol: 0.4 },
    { t: T.encendido - 0.18, sfx: "golpe", vol: 0.45 },
  ];
};
