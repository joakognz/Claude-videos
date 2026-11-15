/**
 * EP.9 · Parte 2 · PASO 1 «Los subagentes» (escena subagentes): Claude (logo del usuario) lanza dos ayudantes por sus
 * cables → cada uno trabaja dentro de su propio espacio (burbuja con actividad) → al terminar le devuelve una tarjeta
 * con el resultado → el panel de Claude Code sigue limpio (2 agents) → ENCARGADO: uno revisa TEXTOS, otro busca
 * FALLOS → tú solo hablas con el encargado.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { ChatClaude } from "../../componentes/ep09/Chat";
import { Disco, IcoCheck, IcoDocumento, IcoLupa, IcoPersona, NodoAgente, Pos } from "../../componentes/ep09/Piezas9";
import { C, EASE, MONO, TITULO, clamp01, rand, ramp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "subagentes";
const tiempos = (L: Linea) => ({
  paso: L.en(E, "Paso"),
  subagentes: L.en(E, "subagentes."),
  claude: L.en(E, "Claude"),
  lanzar: L.en(E, "lanzar"),
  ayudantes: L.en(E, "ayudantes"),
  tarea: L.en(E, "tarea"),
  cada: L.en(E, "Cada"),
  espacio: L.en(E, "espacio"),
  terminar: L.en(E, "terminar,"),
  entrega: L.en(E, "entrega"),
  resultado: L.en(E, "resultado."),
  asi: L.en(E, "Así"),
  principal: L.en(E, "principal"),
  ruido: L.en(E, "ruido."),
  es: L.en(E, "Es como"),
  encargado: L.en(E, "encargado"),
  reparte: L.en(E, "reparte"),
  uno: L.en(E, "uno", 1),
  textos: L.en(E, "textos"),
  otro: L.en(E, "otro"),
  fallos: L.en(E, "fallos."),
  tu: L.en(E, "tú solo"),
  hablas: L.en(E, "hablas"),
  fin: L.fin(E),
});

const MAIN = { x: 540, y: 1150 };
const AYU = [
  { x: 250, y: 1560, tarea: "TEXTOS", Ico: IcoDocumento },
  { x: 830, y: 1560, tarea: "FALLOS", Ico: IcoLupa },
];
const USER = { x: 540, y: 800 };
const CHAT = { x: 70, y: 2150, w: 940, h: 620 };

export const Subagentes: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1060, z: 1.0 },
    { t: T.claude - 0.3, x: 540, y: 1300, z: 1.0, d: 0.9 },
    { t: T.asi - 0.3, x: 540, y: 2440, z: 1.0, d: 0.9 },
    { t: T.es - 0.3, x: 540, y: 1280, z: 1.0, d: 0.9 },
    { t: T.tu - 0.3, x: 540, y: 1180, z: 1.0, d: 0.8 },
  ];
  const vMain = vis(t, T.claude - 0.1, hasta + 0.3, 0.5);
  const encargado = t > T.encargado - 0.05;
  const atenua = ramp(t, T.tu, T.hablas, EASE);
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 1" x={540} y={740} t={t} at={T.paso} out={T.claude} size={60} rot={-5} />
      <Etiqueta texto="SUBAGENTES" x={540} y={880} t={t} at={T.subagentes - 0.05} out={T.claude + 0.2} size={74} variante="texto" fuente="titulo" />

      {/* cables del encargado a los ayudantes */}
      <svg width={1080} height={2000} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {AYU.map((a, k) => {
          const p = ramp(t, T.lanzar + k * 0.2, T.ayudantes + 0.3 + k * 0.2, EASE);
          if (p <= 0) return null;
          const x2 = MAIN.x + (a.x - MAIN.x) * p;
          const y2 = MAIN.y + (a.y - MAIN.y) * p;
          const late = t > T.reparte ? 0.5 + 0.5 * Math.sin((t - T.reparte) * 8) : 0;
          return <line key={k} x1={MAIN.x} y1={MAIN.y} x2={x2} y2={y2} stroke={C.acento} strokeWidth={8 + 4 * late} strokeLinecap="round" strokeDasharray="2 22" opacity={(0.8 - 0.5 * atenua) * (1 - ramp(t, hasta - 0.1, hasta + 0.3))} />;
        })}
        {t > T.tu - 0.1 && (
          <line x1={USER.x} y1={USER.y + 80} x2={USER.x} y2={USER.y + 80 + (MAIN.y - 110 - USER.y - 80) * ramp(t, T.tu, T.hablas, EASE)} stroke={C.texto} strokeWidth={8} strokeLinecap="round" />
        )}
      </svg>

      {/* ayudantes en su espacio */}
      {AYU.map((a, k) => {
        const v = vis(t, T.ayudantes + 0.15 + k * 0.2, hasta + 0.3, 0.4);
        if (!v.on) return null;
        const burbuja = ramp(t, T.cada - 0.1 + k * 0.15, T.espacio + 0.2, EASE);
        const trabaja = t > T.tarea && t < T.terminar + 0.4;
        const hecho = t > T.terminar + 0.3;
        const etiq = (k === 0 ? t > T.textos - 0.05 : t > T.fallos - 0.1);
        return (
          <div key={k} style={{ position: "absolute", left: a.x, top: a.y, width: 0, height: 0, opacity: v.opacity * (1 - 0.6 * atenua) }}>
            {burbuja > 0 && (
              <div style={{ position: "absolute", left: -200, top: -210, width: 400, height: 400, borderRadius: 60, border: `4px dashed ${C.acento}`, background: "rgba(217,119,87,0.07)", transform: `scale(${0.6 + 0.4 * burbuja})`, opacity: burbuja, overflow: "hidden" }}>
                {trabaja &&
                  Array.from({ length: 7 }, (_, j) => {
                    const y = ((t * 120 + j * 60 + k * 30) % 420) - 20;
                    return <div key={j} style={{ position: "absolute", left: 40 + rand(j + k * 9) * 60, top: y, width: 140 + rand(j * 3 + k) * 140, height: 12, borderRadius: 6, background: C.borde }} />;
                  })}
              </div>
            )}
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})` }}>
              <NodoAgente s={150} logo={ep.logos.claude} activo={1} pulso={trabaja ? Math.abs(Math.sin(t * 5 + k)) : 0} />
            </div>
            <div style={{ position: "absolute", left: 0, top: 130, transform: "translateX(-50%)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 10, padding: "10px 22px", borderRadius: 999, background: etiq ? C.acento : C.panel2, border: `3px solid ${C.acento}`, fontFamily: TITULO, fontWeight: 800, fontSize: 34, color: etiq ? C.oscuro : C.texto, opacity: clamp01((t - T.tarea + 0.1) / 0.25) }}>
              {etiq ? <a.Ico s={36} color={C.oscuro} grosor={2.6} /> : null}
              {etiq ? a.tarea : `AYUDANTE ${k + 1}`}
              {hecho && !etiq && <IcoCheck s={32} color={C.acento} grosor={3} />}
            </div>
          </div>
        );
      })}
      <Etiqueta texto="SU PROPIO ESPACIO" x={540} y={1860} t={t} at={T.espacio - 0.1} out={T.asi} size={40} variante="acento" fuente="titulo" />

      {/* resultados que vuelven */}
      {AYU.map((a, k) => {
        const u = ramp(t, T.entrega - 0.2 + k * 0.15, T.resultado + 0.15 + k * 0.15, EASE);
        if (u <= 0 || u >= 1) return null;
        const x = a.x + (MAIN.x - a.x) * u;
        const y = a.y + (MAIN.y - a.y) * u - Math.sin(u * Math.PI) * 80;
        return (
          <div key={`r${k}`} style={{ position: "absolute", left: x - 45, top: y - 55, width: 90, height: 110, borderRadius: 12, background: "#FFF8E8", border: `4px solid ${C.oscuro}`, boxShadow: `0 10px 30px rgba(0,0,0,0.5)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IcoCheck s={56} color={C.acento} grosor={3.2} />
          </div>
        );
      })}

      {/* el encargado */}
      {vMain.on && (
        <div style={{ position: "absolute", left: MAIN.x, top: MAIN.y, width: 0, height: 0, opacity: vMain.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vMain.y}px) scale(${vMain.scale})` }}>
            <NodoAgente s={210} logo={ep.logos.claude} activo={1} pulso={Math.max(0, Math.sin(clamp01((t - T.resultado - 0.1) / 0.4) * Math.PI)) + (t > T.hablas ? 0.4 * Math.abs(Math.sin(t * 4)) : 0)} />
          </div>
          <div style={{ position: "absolute", left: 0, top: 150, transform: "translateX(-50%)", whiteSpace: "nowrap", padding: "6px 22px", borderRadius: 999, background: C.fondo, border: `3px solid ${encargado ? C.acento : C.borde}`, fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: encargado ? C.acento : C.texto }}>{encargado ? "ENCARGADO" : "CLAUDE"}</div>
        </div>
      )}

      {/* tú */}
      <Pos x={USER.x} y={USER.y} t={t} at={T.tu - 0.1} out={hasta + 0.3}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Disco s={130} activo={1}>
            <IcoPersona s={70} color={C.texto} grosor={2.2} />
          </Disco>
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.texto }}>TÚ</div>
        </div>
      </Pos>
      <Etiqueta texto="SOLO CON EL ENCARGADO" x={540} y={1880} t={t} at={T.hablas} out={hasta + 0.3} size={40} variante="acento" fuente="titulo" />

      {/* la conversación principal sigue limpia */}
      {(() => {
        const v = vis(t, T.asi - 0.3, T.es + 0.1, 0.85);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: CHAT.x, top: CHAT.y, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <ChatClaude
              t={t} w={CHAT.w} h={CHAT.h} logoVs={ep.logos.vscode} logoCc={ep.logos.claude_code}
              agentes={{ at: T.asi - 0.1, n: 2 }}
              mensajes={[
                { tipo: "yo", at: 0, texto: "revisa la web antes de publicarla" },
                { tipo: "claude", at: 0, texto: "Lanzo dos ayudantes: uno para los textos y otro para los fallos." },
                { tipo: "claude", at: T.principal, texto: <span>Listo. <b>Textos</b>: corregidos. <b>Fallos</b>: un enlace roto, arreglado.</span>, resalta: T.principal },
              ]}
            />
          </div>
        );
      })()}
      <Pos x={540} y={1960} t={t} at={T.ruido - 0.1} out={T.es + 0.1}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 30px", borderRadius: 999, background: C.panel2, border: `4px solid ${C.acento}` }}>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.acento }}>✓</span>
          <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 42, color: C.texto }}>CONVERSACIÓN LIMPIA</span>
        </div>
      </Pos>
    </Escena>
  );
};

export const eventosSubagentes = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.subagentes, sfx: "pop", vol: 0.35 },
    { t: T.claude - 0.1, sfx: "pop", vol: 0.4 },
    { t: T.lanzar, sfx: "whoosh", vol: 0.3 },
    { t: T.ayudantes + 0.15, sfx: "pop", vol: 0.35 },
    { t: T.ayudantes + 0.35, sfx: "pop", vol: 0.35 },
    { t: T.espacio, sfx: "whoosh", vol: 0.2 },
    { t: T.resultado + 0.15, sfx: "tick", vol: 0.45 },
    { t: T.resultado + 0.3, sfx: "tick", vol: 0.45 },
    { t: T.asi - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.ruido, sfx: "pop", vol: 0.35 },
    { t: T.encargado, sfx: "golpe", vol: 0.35 },
    { t: T.textos - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.fallos - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.hablas, sfx: "tick", vol: 0.4 },
  ];
};
