/**
 * EP.9 · Parte 1 · PASO 2 «Enséñale lo que quieres» (escena imagen): el panel de Claude Code en Visual Studio Code →
 * PEGA AQUÍ → tres capturas en abanico (una web, un boceto a mano, un error) → el boceto se pega en el cuadro y se
 * teclea «hazme una portada como esta» → los nombres técnicos (header, hero…) se tachan → Claude mira el boceto y
 * construye la portada de la panadería → rejilla pequeña con el EP.6.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { ChatClaude, teclea } from "../../componentes/ep09/Chat";
import { Boceto, CapturaError, CapturaWeb, WebPanaderia } from "../../componentes/ep09/Panaderia";
import { MiniRejilla, Pos } from "../../componentes/ep09/Piezas9";
import { C, EASE, EASE_OUT, TITULO, ramp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "imagen";
const tiempos = (L: Linea) => ({
  paso: L.en(E, "Paso"),
  ensenale: L.en(E, "Enséñale"),
  pega: L.en(E, "Pega"),
  cuadro: L.en(E, "cuadro"),
  captura: L.en(E, "captura:"),
  web: L.en(E, "web"),
  boceto: L.en(E, "boceto"),
  mano: L.en(E, "mano"),
  error: L.en(E, "error"),
  salga: L.en(E, "salga."),
  escribe: L.en(E, "escribe:"),
  hazme: L.en(E, "«hazme"),
  esta: L.en(E, "esta»."),
  finEsta: L.finDe(E, "esta»."),
  no: L.en(E, "No"),
  saber: L.en(E, "saber"),
  cosa: L.en(E, "cosa."),
  claude: L.en(E, "Claude", 1),
  mira: L.en(E, "mira"),
  imagen: L.en(E, "imagen"),
  construye: L.en(E, "construye."),
  salio: L.en(E, "Salió"),
  seis: L.en(E, "6."),
});

const CHAT = { x: 70, y: 1000, w: 940, h: 720 };
const FAN = [
  { k: "web", x: 250, y: 1230, rot: -7, txt: "UNA WEB" },
  { k: "boceto", x: 540, y: 1200, rot: 2, txt: "UN BOCETO" },
  { k: "error", x: 830, y: 1230, rot: 7, txt: "UN ERROR" },
];
const BOC = { x: 540, y: 2080, w: 470 };

export const Imagen: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const envia = T.finEsta + 0.15;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1100, z: 1.0 },
    { t: T.pega - 0.3, x: 540, y: 1330, z: 1.0, d: 0.9 },
    { t: T.escribe - 0.2, x: 540, y: 1430, z: 1.06, d: 0.8 },
    { t: T.no - 0.3, x: 540, y: 2080, z: 1.02, d: 0.9 },
    { t: T.construye - 0.5, x: 560, y: 2160, z: 0.98, d: 0.9 },
    { t: T.salio - 0.3, x: 540, y: 2980, z: 1.0, d: 0.8 },
  ];
  const fueraChat = T.no + 0.3;
  const vChat = vis(t, T.pega - 0.25, fueraChat, 0.85);
  const fueraFan = T.escribe + 0.2;
  const entrada = t < envia ? teclea("hazme una portada como esta", t, T.hazme, T.finEsta) : "";
  const mini = (
    <div style={{ width: 150, height: 180, borderRadius: 10, overflow: "hidden", border: "2px solid #3C3C3C" }}>
      <div style={{ transform: "scale(0.375)", transformOrigin: "0 0" }}>
        <Boceto w={400} t={t} />
      </div>
    </div>
  );
  // el boceto grande: se encoge a la izquierda cuando Claude construye
  const vBoc = vis(t, T.no - 0.15, T.salio + 0.2, 0.7);
  const aparta = ramp(t, T.construye - 0.3, T.construye + 0.5, EASE);
  const scan = ramp(t, T.mira, T.imagen + 0.5, (x) => x);
  const vWeb = vis(t, T.construye - 0.15, T.salio + 0.2, 0.75);
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 2" x={540} y={740} t={t} at={T.paso} out={T.pega + 0.1} size={60} rot={-5} />
      <Etiqueta texto="ENSÉÑASELO" x={540} y={880} t={t} at={T.ensenale} out={T.pega + 0.3} size={60} variante="texto" fuente="titulo" />

      {/* ── el panel de Claude Code ── */}
      {vChat.on && (
        <div style={{ position: "absolute", left: CHAT.x, top: CHAT.y, opacity: vChat.opacity, transform: `translateY(${vChat.y}px) scale(${vChat.scale})` }}>
          <ChatClaude
            t={t} w={CHAT.w} h={CHAT.h} logoVs={ep.logos.vscode} logoCc={ep.logos.claude_code}
            foco={t > T.pega && t < envia} entrada={entrada}
            adjunto={{ nodo: mini, at: T.escribe - 0.1, enviado: envia }}
            envia={envia}
            mensajes={[
              { tipo: "yo", at: envia + 0.05, texto: <div style={{ display: "flex", gap: 16, alignItems: "center" }}>{mini}<span>hazme una portada como esta</span></div> },
              { tipo: "claude", at: envia + 0.6, texto: "Veo el boceto: cabecera, portada con imagen y tres productos. Lo construyo." },
            ]}
          />
        </div>
      )}
      <Etiqueta texto="PEGA AQUÍ ↓" x={540} y={1520} t={t} at={T.cuadro - 0.1} out={T.web - 0.1} size={44} variante="acento" fuente="titulo" />

      {/* ── tres capturas en abanico ── */}
      {FAN.map((f, i) => {
        const at = [T.web, T.boceto, T.error][i];
        const v = vis(t, at - 0.08, f.k === "boceto" ? Infinity : fueraFan, 0.5);
        if (!v.on) return null;
        // el boceto vuela al cuadro de entrada
        const vuela = f.k === "boceto" ? ramp(t, T.escribe - 0.45, T.escribe - 0.05, EASE) : 0;
        if (f.k === "boceto" && t > T.escribe - 0.05) return null;
        const x = f.x + (CHAT.x + 100 - f.x) * vuela;
        const y = f.y + (CHAT.y + CHAT.h - 230 - f.y) * vuela;
        return (
          <React.Fragment key={f.k}>
            <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: v.opacity }}>
              <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale * (1 - 0.55 * vuela)}) rotate(${f.rot * (1 - vuela)}deg)` }}>
                {f.k === "web" && <CapturaWeb w={270} />}
                {f.k === "boceto" && <Boceto w={230} t={t} />}
                {f.k === "error" && <CapturaError w={270} />}
              </div>
            </div>
            <Etiqueta texto={f.txt} x={f.x} y={f.y + 200} t={t} at={at} out={f.k === "boceto" ? T.escribe - 0.3 : fueraFan} size={32} variante="borde" fuente="titulo" />
          </React.Fragment>
        );
      })}

      {/* ── no necesitas saber cómo se llama cada cosa ── */}
      {vBoc.on && (
        <div style={{ position: "absolute", left: BOC.x - 330 * aparta, top: BOC.y - 230 * aparta, width: 0, height: 0, opacity: vBoc.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vBoc.y}px) scale(${vBoc.scale * (1 - 0.45 * aparta)}) rotate(${-2 - 4 * aparta}deg)` }}>
            <div style={{ position: "relative" }}>
              <Boceto w={BOC.w} t={t} etiquetas={ramp(t, T.saber - 0.1, T.cosa, (x) => x)} tacha={ramp(t, T.cosa, T.cosa + 0.4, EASE)} />
              {t > T.mira - 0.05 && t < T.construye + 0.6 && (
                <div style={{ position: "absolute", left: -10, right: -10, top: `${scan * 100}%`, height: 8, borderRadius: 4, background: C.acento, boxShadow: `0 0 30px 8px ${C.acento}88`, opacity: 1 - ramp(t, T.construye + 0.2, T.construye + 0.6) }} />
              )}
            </div>
          </div>
        </div>
      )}
      <Sello texto="NO HACE FALTA" x={540} y={2420} t={t} at={T.cosa + 0.05} out={T.claude + 0.4} size={50} rot={-4} />
      <Logo src={ep.logos.claude} x={850} y={1800} w={110} t={t} at={T.claude - 0.05} out={T.construye + 0.3} pulsos={[T.mira]} />
      <Etiqueta texto="MIRA LA IMAGEN" x={790} y={1900} t={t} at={T.mira} out={T.construye + 0.3} size={32} variante="acento" fuente="titulo" />
      {vWeb.on && (
        <div style={{ position: "absolute", left: 650, top: 2200, width: 0, height: 0, opacity: vWeb.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vWeb.y}px) scale(${vWeb.scale})` }}>
            <WebPanaderia w={600} t={t} estilo={ramp(t, T.construye + 0.2, T.construye + 1.1, EASE_OUT)} construye={ramp(t, T.construye - 0.1, T.construye + 0.8)} img={ep.imagenes!.panaderia} />
          </div>
        </div>
      )}
      <Pos x={200} y={2130} t={t} at={T.construye + 0.3} out={T.salio + 0.2}>
        <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 36, color: C.acento, display: "flex", alignItems: "center", gap: 12 }}>
          LA CONSTRUYE
          <svg width={60} height={40} viewBox="0 0 60 40"><path d="M4 20 H50 M38 8 L52 20 L38 32" fill="none" stroke={C.acento} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </Pos>

      {/* ── EP.6 ── */}
      <MiniRejilla t={t} at={T.salio - 0.1} out={hasta + 0.4} ep={6} x={540} y={2980} etiqueta="Prompting maestro" />
    </Escena>
  );
};

export const eventosImagen = (L: Linea): Evento[] => {
  const T = tiempos(L);
  const envia = T.finEsta + 0.15;
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.ensenale, sfx: "pop", vol: 0.35 },
    { t: T.pega - 0.25, sfx: "whoosh", vol: 0.25 },
    { t: T.web - 0.08, sfx: "pop", vol: 0.35 },
    { t: T.boceto - 0.08, sfx: "pop", vol: 0.35 },
    { t: T.error - 0.08, sfx: "pop", vol: 0.35 },
    { t: T.escribe - 0.4, sfx: "whoosh", vol: 0.25 },
    { t: T.hazme, sfx: "tecleo", vol: 0.25, dur: T.finEsta - T.hazme },
    { t: envia, sfx: "envio", vol: 0.45 },
    { t: T.saber, sfx: "pop", vol: 0.3 },
    { t: T.cosa + 0.17, sfx: "golpe", vol: 0.4 },
    { t: T.mira, sfx: "whoosh", vol: 0.2 },
    { t: T.construye, sfx: "pop", vol: 0.45 },
    { t: T.seis, sfx: "pop", vol: 0.4 },
  ];
};
