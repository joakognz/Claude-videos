/**
 * EP.9 · Parte 2 · PASO 4 «Tres trucos» (escena trucos), los tres en el panel de Claude Code:
 * 1) el historial de sesiones (botón del reloj) → «Portada de la panadería · ayer» → la conversación vuelve.
 * 2) se teclea «/» y sale el menú de comandos con /init resaltado (EP.5).
 * 3) el micrófono: ondas y el texto se escribe solo.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Cursor } from "../../componentes/Piezas";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { ChatClaude, teclea } from "../../componentes/ep09/Chat";
import { Disco, IcoBarra, IcoMicro, IcoReloj } from "../../componentes/ep09/Piezas9";
import { C, EASE, TITULO, clamp01, ramp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "trucos";
const tiempos = (L: Linea) => ({
  paso: L.en(E, "Paso"),
  tres: L.en(E, "Tres"),
  soltura: L.en(E, "soltura."),
  uno: L.en(E, "Uno:"),
  retoma: L.en(E, "retoma"),
  historial: L.en(E, "historial"),
  eliges: L.en(E, "eliges"),
  ayer: L.en(E, "ayer"),
  sigues: L.en(E, "sigues"),
  dos: L.en(E, "Dos:"),
  barra: L.en(E, "barra"),
  aparecen: L.en(E, "aparecen"),
  init: L.en(E, "/init,"),
  conoces: L.en(E, "conoces."),
  tres3: L.en(E, "Tres:", 1),
  microfono: L.en(E, "micrófono"),
  dictale: L.en(E, "díctale"),
  escribir: L.en(E, "escribir."),
  fin: L.fin(E),
});

const CHAT = { x: 70, y: 1060, w: 940, h: 680 };
const RELOJ = { x: 921, y: 1153 };
const FILA_AYER = { x: 700, y: 1310 };
const MICRO = { x: 896, y: 1682 };

const Truco: React.FC<{ t: number; at: number; out: number; n: number; texto: string; Ico: React.FC<{ s?: number; color?: string; grosor?: number }> }> = ({ t, at, out, n, texto, Ico }) => {
  const v = vis(t, at, out, 0.6);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: 540, top: 960, width: 0, height: 0, opacity: v.opacity }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 20, whiteSpace: "nowrap" }}>
        <div style={{ width: 84, height: 84, borderRadius: 22, background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 56, color: C.oscuro }}>{n}</div>
        <Disco s={84} activo={0}>
          <Ico s={48} color={C.acento} grosor={2.4} />
        </Disco>
        <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 52, color: C.texto }}>{texto}</div>
      </div>
    </div>
  );
};

export const Trucos: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1040, z: 1.0 },
    { t: T.uno - 0.3, x: 540, y: 1390, z: 1.0, d: 0.9 },
    { t: T.historial - 0.2, x: 640, y: 1300, z: 1.1, d: 0.8 },
    { t: T.sigues - 0.2, x: 540, y: 1390, z: 1.0, d: 0.8 },
    { t: T.aparecen - 0.2, x: 540, y: 1430, z: 1.04, d: 0.8 },
    { t: T.microfono - 0.3, x: 620, y: 1480, z: 1.1, d: 0.8 },
    { t: T.escribir - 0.4, x: 540, y: 1420, z: 1.0, d: 0.8 },
  ];
  const vChat = vis(t, T.uno - 0.2, hasta + 0.3, 0.85);
  // historial
  const histAbre = T.historial + 0.15;
  const histElige = T.ayer;
  const histCierra = T.ayer + 0.45;
  // comandos
  const barraEn = T.barra + 0.1;
  const barraCierra = T.conoces + 0.3;
  // micrófono
  const micA = T.microfono + 0.15;
  const micB = T.fin + 0.3;
  let entrada = "";
  if (t >= barraEn && t < barraCierra) entrada = "/";
  if (t >= T.dictale) entrada = teclea("añade el horario de verano", t, T.dictale, T.escribir + 0.3);
  // cursor: reloj → fila «ayer» → (desaparece) → micrófono
  const c1 = ramp(t, T.retoma, T.historial, EASE);
  const c2 = ramp(t, T.eliges - 0.2, T.ayer - 0.05, EASE);
  const c3 = ramp(t, T.tres3, T.microfono, EASE);
  let cx = 560 + (RELOJ.x - 560) * c1 + (FILA_AYER.x - RELOJ.x) * c2;
  let cy = 1500 + (RELOJ.y - 1500) * c1 + (FILA_AYER.y - RELOJ.y) * c2;
  if (t > T.dos) {
    cx = 620 + (MICRO.x - 620) * c3;
    cy = 1500 + (MICRO.y - 1500) * c3;
  }
  const cursorOp = t < T.dos ? clamp01((t - T.retoma) / 0.2) * (1 - ramp(t, T.ayer + 0.4, T.ayer + 0.7)) : clamp01((t - T.tres3) / 0.2) * (1 - ramp(t, T.dictale + 0.3, T.dictale + 0.6));
  const pulsa = Math.max(
    Math.sin(clamp01((t - histAbre + 0.1) / 0.2) * Math.PI),
    Math.sin(clamp01((t - histElige + 0.1) / 0.2) * Math.PI),
    Math.sin(clamp01((t - micA + 0.1) / 0.2) * Math.PI),
  );
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 4" x={540} y={740} t={t} at={T.paso} out={T.tres + 0.2} size={60} rot={-5} />
      <Etiqueta texto="3 TRUCOS" x={540} y={880} t={t} at={T.tres - 0.05} out={T.uno} size={84} variante="texto" fuente="titulo" />
      <Etiqueta texto="PARA COGER SOLTURA" x={540} y={1000} t={t} at={T.soltura - 0.3} out={T.uno} size={38} variante="gris" fuente="titulo" />
      <Truco t={t} at={T.uno} out={T.dos} n={1} texto="RETOMA SESIONES" Ico={IcoReloj} />
      <Truco t={t} at={T.dos} out={T.tres3} n={2} texto="COMANDOS CON /" Ico={IcoBarra} />
      <Truco t={t} at={T.tres3} out={hasta + 0.3} n={3} texto="DÍCTALE" Ico={IcoMicro} />

      {vChat.on && (
        <div style={{ position: "absolute", left: CHAT.x, top: CHAT.y, opacity: vChat.opacity, transform: `translateY(${vChat.y}px) scale(${vChat.scale})` }}>
          <ChatClaude
            t={t} w={CHAT.w} h={CHAT.h} logoVs={ep.logos.vscode} logoCc={ep.logos.claude_code}
            historial={{ abre: histAbre, elige: histElige, cierra: histCierra }}
            barra={{ abre: barraEn, cierra: barraCierra, resalta: t > T.init - 0.15 ? "/init" : undefined }}
            microfono={{ a: micA, b: micB }}
            entrada={entrada}
            foco={(t > barraEn && t < barraCierra) || t > micA}
            mensajes={[
              { tipo: "yo", at: histCierra + 0.05, texto: "hazme una portada como esta" },
              { tipo: "claude", at: histCierra + 0.25, texto: "Hecho: portada de la panadería lista." },
              { tipo: "nota", at: histCierra + 0.45, texto: "Sesión de ayer · sigues donde lo dejaste" },
            ]}
          />
        </div>
      )}
      {cursorOp > 0.01 && <Cursor x={cx} y={cy} pulsa={pulsa} opacity={cursorOp} />}
      <Etiqueta texto="LA DE AYER" x={290} y={1310} t={t} at={T.ayer} out={T.sigues + 0.2} size={36} variante="acento" fuente="titulo" />
      <Etiqueta texto="SIGUES DONDE LO DEJASTE" x={540} y={1830} t={t} at={T.sigues} out={T.dos} size={40} variante="acento" fuente="titulo" />
      <Etiqueta texto="YA LO CONOCES · EP.5" x={540} y={1830} t={t} at={T.init + 0.2} out={T.tres3} size={40} variante="acento" fuente="titulo" />
      <Etiqueta texto="EN VEZ DE ESCRIBIR" x={540} y={1830} t={t} at={T.dictale} out={hasta + 0.3} size={40} variante="acento" fuente="titulo" />
    </Escena>
  );
};

export const eventosTrucos = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.tres, sfx: "pop", vol: 0.4 },
    { t: T.uno, sfx: "pop", vol: 0.4 },
    { t: T.historial + 0.15, sfx: "tick", vol: 0.5 },
    { t: T.ayer, sfx: "tick", vol: 0.5 },
    { t: T.ayer + 0.5, sfx: "whoosh", vol: 0.25 },
    { t: T.dos, sfx: "pop", vol: 0.4 },
    { t: T.barra + 0.1, sfx: "tecleo", vol: 0.25, dur: 0.15 },
    { t: T.init - 0.15, sfx: "tick", vol: 0.45 },
    { t: T.tres3, sfx: "pop", vol: 0.4 },
    { t: T.microfono + 0.15, sfx: "tick", vol: 0.5 },
    { t: T.dictale, sfx: "tecleo", vol: 0.2, dur: T.escribir + 0.3 - T.dictale },
  ];
};
