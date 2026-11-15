/**
 * EP.9 · Parte 1 · PASO 3 «El modo Plan» (escenas plan → plan_ejemplo): sello y estrella de EL MÁS VOTADO → en el
 * cuadro de Claude el cursor abre el selector de modo y elige Plan → NO TOCA NADA → el plan como documento (páginas en
 * orden), APROBAR / CORREGIR → un comentario añade el botón de WhatsApp → el documento se vuelve un plano y el primer
 * ladrillo espera encima → dos páginas cambian de orden: CAMBIA ANTES DE CONSTRUIR.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Cursor } from "../../componentes/Piezas";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { ChatClaude, teclea } from "../../componentes/ep09/Chat";
import { IcoCandado, IcoEstrella, IcoPlano, Pos } from "../../componentes/ep09/Piezas9";
import { C, EASE, MONO, TITULO, UI, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const A = "plan";
const B = "plan_ejemplo";
const tiempos = (L: Linea) => ({
  paso: L.en(A, "Paso"),
  modo: L.en(A, "modo"),
  votado: L.en(A, "votado"),
  todos: L.en(A, "todos."),
  abajo: L.en(A, "Abajo,"),
  cambia: L.en(A, "cambia"),
  plan: L.en(A, "Plan.", 1),
  ahora: L.en(A, "Ahora"),
  toca: L.en(A, "toca"),
  primero: L.en(A, "primero"),
  ensena: L.en(A, "enseña"),
  paginas: L.en(A, "páginas"),
  orden: L.en(A, "orden."),
  apruebas: L.en(A, "apruebas"),
  corriges: L.en(A, "corriges."),
  ejemplo: L.en(B, "Por"),
  anade: L.en(B, "«añade"),
  whatsapp: L.en(B, "WhatsApp»."),
  finWhatsapp: L.finDe(B, "WhatsApp»."),
  como: L.en(B, "Es como"),
  plano: L.en(B, "plano"),
  ladrillo: L.en(B, "ladrillo."),
  si: L.en(B, "Si"),
  cuadra: L.en(B, "cuadra,"),
  cambias: L.en(B, "cambias"),
  facil: L.en(B, "fácil."),
});

const CHAT = { x: 70, y: 1080, w: 940, h: 620 };
const DOC = { x: 540, y: 2180, w: 860 };
const PAGINAS = ["Inicio", "Pan y bollería", "Encargos", "Dónde estamos"];

const Ladrillo: React.FC<{ s?: number }> = ({ s = 200 }) => (
  <svg width={s} height={s * 0.5} viewBox="0 0 100 50">
    <rect x="3" y="3" width="94" height="44" rx="5" fill="#B5583A" stroke={C.oscuro} strokeWidth="3" />
    <path d="M3 25 H97 M35 3 V25 M68 25 V47" stroke="#E7A07F" strokeWidth="2.4" />
  </svg>
);

export const Plan: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1020, z: 1.0 },
    { t: T.abajo - 0.3, x: 610, y: 1500, z: 1.12, d: 0.9 },
    { t: T.ahora - 0.2, x: 540, y: 1300, z: 1.0, d: 0.8 },
    { t: T.primero - 0.3, x: 540, y: 2180, z: 1.0, d: 0.9 },
    { t: T.anade - 0.3, x: 540, y: 2260, z: 0.98, d: 0.8 },
    { t: T.como - 0.2, x: 540, y: 2080, z: 0.94, d: 0.9 },
    { t: T.si - 0.2, x: 540, y: 2180, z: 0.98, d: 0.8 },
  ];
  const fueraChat = T.primero + 0.2;
  const vChat = vis(t, desde + 0.1, fueraChat, 0.85);
  // cursor: llega al selector de modo y pulsa; luego elige «Plan»
  const chip = { x: 812, y: 1655 };
  const opcion = { x: 700, y: 1500 };
  const ir1 = ramp(t, T.abajo + 0.2, T.cambia - 0.05, EASE);
  const ir2 = ramp(t, T.cambia + 0.25, T.plan - 0.05, EASE);
  const cx = 560 + (chip.x - 560) * ir1 + (opcion.x - chip.x) * ir2;
  const cy = 1420 + (chip.y - 1420) * ir1 + (opcion.y - chip.y) * ir2;
  const pulsa = Math.max(Math.sin(clamp01((t - T.cambia) / 0.2) * Math.PI), Math.sin(clamp01((t - T.plan) / 0.2) * Math.PI));
  // documento del plan
  const vDoc = vis(t, T.primero - 0.1, hasta + 0.3, 0.8);
  const comentario = teclea("añade un botón para hacer encargos por WhatsApp", t, T.anade, T.finWhatsapp);
  const nuevo = sp(t, T.whatsapp + 0.1, { damping: 12, stiffness: 180 });
  const plano = ramp(t, T.plano - 0.2, T.plano + 0.5, EASE);
  const swap = ramp(t, T.cambias, T.cambias + 0.6, EASE);
  const filas = [...PAGINAS.slice(0, 3), "WHATSAPP", PAGINAS[3]];
  const FILA = 84;
  const posFila = (k: number) => {
    // la fila de WhatsApp se abre hueco al entrar; Pan y bollería ↔ Encargos al final
    let y = k <= 2 ? k * FILA : k === 3 ? 3 * FILA : (3 + Math.min(1, nuevo)) * FILA;
    if (k === 1) y += swap * FILA;
    if (k === 2) y -= swap * FILA;
    return y;
  };
  const altoLista = (4 + Math.min(1, nuevo)) * FILA;
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 3" x={540} y={740} t={t} at={T.paso} out={T.abajo} size={60} rot={-5} />
      <Etiqueta texto="MODO PLAN" x={540} y={870} t={t} at={T.modo} out={T.abajo + 0.3} size={76} variante="texto" fuente="titulo" />
      <Pos x={540} y={985} t={t} at={T.votado - 0.05} out={T.abajo + 0.3}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 28px", borderRadius: 999, background: C.acento, boxShadow: `0 12px 40px ${C.acento}66` }}>
          <IcoEstrella s={42} color={C.oscuro} grosor={2.6} />
          <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 38, color: C.oscuro }}>EL MÁS VOTADO</span>
        </div>
      </Pos>

      {/* ── el cuadro de Claude: Manual → Plan ── */}
      {vChat.on && (
        <div style={{ position: "absolute", left: CHAT.x, top: CHAT.y, opacity: vChat.opacity, transform: `translateY(${vChat.y}px) scale(${vChat.scale})` }}>
          <ChatClaude
            t={t} w={CHAT.w} h={CHAT.h} logoVs={ep.logos.vscode} logoCc={ep.logos.claude_code}
            modo={{ abre: T.cambia, plan: T.plan }}
            foco={t > T.plan + 0.2}
            mensajes={[
              { tipo: "yo", at: T.ahora - 0.1, texto: "crea la web de la panadería" },
              { tipo: "claude", at: T.toca, texto: "Antes de tocar nada, te preparo el plan." },
            ]}
          />
        </div>
      )}
      {t > T.abajo && t < T.plan + 0.7 && <Cursor x={cx} y={cy} pulsa={pulsa} opacity={clamp01((t - T.abajo) / 0.2) * (1 - ramp(t, T.plan + 0.4, T.plan + 0.7))} />}
      <Etiqueta texto="ELIGE «PLAN»" x={420} y={1360} t={t} at={T.cambia + 0.1} out={T.ahora} size={40} variante="acento" fuente="titulo" />
      <Pos x={540} y={1000} t={t} at={T.toca - 0.05} out={fueraChat}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 30px", borderRadius: 999, background: C.panel2, border: `4px solid ${C.acento}` }}>
          <IcoCandado s={46} color={C.acento} grosor={2.6} />
          <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.texto }}>NO TOCA NADA</span>
        </div>
      </Pos>

      {/* ── el plan ── */}
      {vDoc.on && (
        <div style={{ position: "absolute", left: DOC.x, top: DOC.y, width: 0, height: 0, opacity: vDoc.opacity }}>
          <div style={{ position: "absolute", left: -DOC.w / 2, top: -330, width: DOC.w, transform: `translateY(${vDoc.y}px) scale(${vDoc.scale})`, transformOrigin: "50% 0", borderRadius: 30, background: C.panel, border: `4px solid ${plano > 0.5 ? C.acento : C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", padding: "30px 36px 34px", boxSizing: "border-box", overflow: "hidden" }}>
            {plano > 0 && (
              <div style={{ position: "absolute", inset: 0, opacity: plano, backgroundImage: `linear-gradient(${C.acento}22 2px, transparent 2px), linear-gradient(90deg, ${C.acento}22 2px, transparent 2px)`, backgroundSize: "44px 44px" }} />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22, position: "relative" }}>
              <IcoPlano s={50} color={C.acento} grosor={2.4} />
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 42, color: C.texto }}>Plan</div>
              <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 28, color: C.gris }}>· web-panaderia</div>
              <div style={{ flex: 1 }} />
              <Img src={staticFile(ep.logos.claude)} style={{ width: 44 }} />
            </div>
            <div style={{ position: "relative", height: altoLista }}>
              {filas.map((f, k) => {
                const at = f === "WHATSAPP" ? T.whatsapp + 0.1 : T.paginas + [0, 0.22, 0.44, 0, 0.66][k];
                const e = f === "WHATSAPP" ? nuevo : sp(t, at, { damping: 13, stiffness: 190 });
                if (e <= 0) return null;
                const num = f === "WHATSAPP" ? 4 : k < 3 ? k + 1 : nuevo > 0.5 ? 5 : 4;
                const numVis = k === 1 ? (swap > 0.5 ? 3 : 2) : k === 2 ? (swap > 0.5 ? 2 : 3) : num;
                const ola = Math.max(0, Math.sin((t - T.orden - (numVis - 1) * 0.18) * Math.PI / 0.35)) * (t > T.orden + (numVis - 1) * 0.18 && t < T.orden + (numVis - 1) * 0.18 + 0.35 ? 1 : 0);
                const esWa = f === "WHATSAPP";
                return (
                  <div key={f} style={{ position: "absolute", left: 0, right: 0, top: posFila(k), height: FILA - 14, display: "flex", alignItems: "center", gap: 20, padding: "0 20px", borderRadius: 18, background: esWa ? "#1F3A2C" : C.panel2, border: `3px solid ${esWa ? "#25D366" : (k === 1 || k === 2) && swap > 0 && swap < 1 ? C.acento : C.borde}`, opacity: Math.min(1, e * 1.6), transform: `translateX(${(1 - Math.min(1, e)) * 60}px) scale(${1 + 0.05 * ola})` }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.oscuro }}>{numVis}</div>
                    {esWa && <Img src={staticFile(ep.logos.whatsapp)} style={{ width: 46, height: 46, borderRadius: 10 }} />}
                    <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, color: C.texto }}>{esWa ? "Botón de encargos por WhatsApp" : `Página: ${f}`}</div>
                  </div>
                );
              })}
            </div>
            {/* comentario */}
            {t > T.anade - 0.1 && (
              <div style={{ position: "relative", marginTop: 16, display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px", borderRadius: 16, background: "#3A2E1F", border: `3px solid ${C.acento}`, opacity: clamp01((t - T.anade + 0.1) / 0.2) * (1 - 0.6 * ramp(t, T.whatsapp + 0.4, T.whatsapp + 0.8)) }}>
                <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={C.acento} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 5 H20 V16 H11 L6 20 V16 H4 Z" /></svg>
                <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 30, color: C.texto, lineHeight: 1.3 }}>{comentario || " "}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 20, marginTop: 22, position: "relative" }}>
              {["Aprobar", "Corregir"].map((b, k) => {
                const on = k === 0 ? t > T.apruebas - 0.05 && t < T.corriges - 0.05 : t > T.corriges - 0.05 && t < T.ejemplo + 0.6;
                return (
                  <div key={b} style={{ padding: "16px 34px", borderRadius: 16, background: on ? C.acento : C.panel2, border: `3px solid ${on ? C.acento : C.borde}`, fontFamily: UI, fontWeight: 700, fontSize: 32, color: on ? C.oscuro : C.texto, transform: `scale(${on ? 1.06 : 1})`, opacity: clamp01((t - T.apruebas + 0.5) / 0.3) }}>
                    {b}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <Etiqueta texto="QUÉ PÁGINAS · EN QUÉ ORDEN" x={540} y={1760} t={t} at={T.paginas - 0.05} out={T.como - 0.1} size={38} variante="acento" fuente="titulo" />
      <Logo src={ep.logos.whatsapp} x={900} y={1790} w={120} t={t} at={T.whatsapp - 0.05} out={T.como} pulsos={[T.whatsapp + 0.3]} />

      {/* ── el plano antes del primer ladrillo ── */}
      <Etiqueta texto="EL PLANO" x={280} y={1780} t={t} at={T.plano} out={hasta + 0.3} size={44} variante="acento" fuente="titulo" />
      <Pos x={740} y={1700 + Math.sin(t * 3) * 10} t={t} at={T.ladrillo - 0.15} out={hasta + 0.3} rot={-6}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Ladrillo s={250} />
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 30, color: C.gris }}>1.er LADRILLO</div>
        </div>
      </Pos>
      <Sello texto="CAMBIA ANTES DE CONSTRUIR" x={540} y={2700} t={t} at={T.cuadra} out={hasta + 0.3} size={42} rot={-3} />
    </Escena>
  );
};

export const eventosPlan = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.modo, sfx: "pop", vol: 0.35 },
    { t: T.votado, sfx: "pop", vol: 0.4 },
    { t: T.cambia, sfx: "tick", vol: 0.5 },
    { t: T.plan, sfx: "tick", vol: 0.5 },
    { t: T.toca, sfx: "pop", vol: 0.35 },
    { t: T.primero - 0.1, sfx: "whoosh", vol: 0.3 },
    ...[0, 1, 2, 3].map((k) => ({ t: T.paginas + k * 0.22, sfx: "pop" as const, vol: 0.28 })),
    { t: T.apruebas, sfx: "tick", vol: 0.4 },
    { t: T.corriges, sfx: "tick", vol: 0.4 },
    { t: T.anade, sfx: "tecleo", vol: 0.25, dur: T.finWhatsapp - T.anade },
    { t: T.whatsapp + 0.1, sfx: "pop", vol: 0.45 },
    { t: T.plano - 0.2, sfx: "whoosh", vol: 0.25 },
    { t: T.ladrillo - 0.15, sfx: "pop", vol: 0.35 },
    { t: T.cuadra + 0.12, sfx: "golpe", vol: 0.4 },
    { t: T.cambias, sfx: "whoosh", vol: 0.25 },
  ];
};
