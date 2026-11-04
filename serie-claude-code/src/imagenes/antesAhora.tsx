/** Antes / ahora: arriba lo de antes (a mano, tecla a tecla), abajo lo de ahora (lo pides y aparece en tu carpeta). */
import React from "react";
import { useEstilo } from "../componentes/estilo";
import type { Ctx } from "../plan";
import { MONO, TITULO, pop, ramp } from "../tema";
import type { Ancla, Medida } from "../tipos";
import { Antetitulo, Caja, crecer, pos } from "./piezas";

type Img = {
  tipo: "antesAhora";
  portal?: string;
  antes: { titulo: string; frase: string; en?: Ancla; fraseEn?: Ancla; items: { texto: string; en?: Ancla }[] };
  ahora: { titulo: string; frase: string; en?: Ancla; fraseEn?: Ancla; carpeta: string; carpetaEn?: Ancla };
};

const G = {
  antes: { x: 50, y: 625, w: 980, h: 410 },
  ahora: { x: 50, y: 1070, w: 980, h: 420 },
  teclado: { x: 640, y: 690, w: 350, h: 190 },
  burbuja: { x: 90, y: 1180, w: 430, h: 150 },
  carpeta: { x: 650, y: 1150, w: 330, h: 230 },
};
const chip = (i: number) => ({ x: 90 + i * 300, y: 925, w: 280, h: 82 });

export const medirAntesAhora = (img: Img, ctx: Ctx): Medida => {
  const tAntes = ctx.at(img.antes.en, ctx.inicio + 0.1);
  const tFraseA = ctx.at(img.antes.fraseEn, tAntes + 0.6);
  const items = img.antes.items.map((it, i) => ctx.at(it.en, tFraseA + 0.4 + i * 0.4));
  const tAhora = ctx.at(img.ahora.en, items[items.length - 1] + 0.8);
  const tFraseB = ctx.at(img.ahora.fraseEn, tAhora + 0.4);
  const tCarpeta = ctx.at(img.ahora.carpetaEn, tFraseB + 1.0);
  const elementos: Medida["elementos"] = { antes: G.antes, ahora: G.ahora, teclado: G.teclado, burbuja: G.burbuja, carpeta: G.carpeta };
  img.antes.items.forEach((_, i) => (elementos[`item-${i}`] = chip(i)));
  const cuerpo = { x: G.carpeta.x + 8, y: G.carpeta.y + 46, w: G.carpeta.w - 16, h: G.carpeta.h - 54 };
  return {
    elementos,
    focos: [
      { t: tAntes, rect: G.antes },
      { t: items[0], rect: crecer({ x: 90, y: 925, w: 880, h: 82 }, 90) },
      { t: tAhora, rect: G.ahora },
      { t: tCarpeta - 0.5, rect: crecer(G.carpeta, 70) },
    ],
    portal: { ...cuerpo, radio: 18, vista: false },
    t: { antes: tAntes, fraseA: tFraseA, ahora: tAhora, fraseB: tFraseB, carpeta: tCarpeta, ...Object.fromEntries(items.map((v, i) => [`item-${i}`, v])) },
    eventos: [
      { t: tAntes + 0.15, sfx: "tecleo", vol: 0.3, dur: Math.max(0.6, items[0] - tAntes) },
      ...items.map((v) => ({ t: v, sfx: "pop" as const, vol: 0.25 })),
      { t: tCarpeta - 0.45, sfx: "pop", vol: 0.3 },
    ],
  };
};

export const VistaAntesAhora: React.FC<{ img: Img; m: Medida; t: number }> = ({ img, m, t }) => {
  const E = useEstilo();
  const fa = pop(t, m.t.fraseA, 0.3);
  const fb = pop(t, m.t.fraseB, 0.3);
  const tecleando = t >= m.t.antes && t < m.t["item-0"] + 0.6;
  const vuelo = ramp(t, m.t.carpeta - 0.5, m.t.carpeta + 0.1);
  return (
    <>
      {/* ANTES */}
      <Caja r={G.antes} t={t} at={m.t.antes} radio={34} fondo="#0E0E0E">
        <div style={{ position: "absolute", left: 40, top: 34 }}><Antetitulo texto={img.antes.titulo} size={30} color={E.gris} /></div>
        <div style={{ position: "absolute", left: 40, top: 92, width: 560, opacity: fa.opacity, translate: `0px ${(1 - fa.p) * 20}px` }}>
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 78, lineHeight: 1.0, letterSpacing: -2.5, color: E.texto }}>{img.antes.frase}</div>
        </div>
      </Caja>
      <Teclado r={G.teclado} t={t} activo={tecleando} at={m.t.antes} />
      {img.antes.items.map((it, i) => {
        const a = pop(t, m.t[`item-${i}`], 0.25);
        return (
          <div key={i} style={{
            ...pos(chip(i)), borderRadius: 18, border: `2px solid ${E.borde}`, background: "#181818", boxSizing: "border-box",
            display: "flex", alignItems: "center", gap: 14, paddingLeft: 24, opacity: a.opacity, scale: String(a.scale),
            fontFamily: MONO, fontWeight: 700, fontSize: 38, color: E.texto,
          }}><span style={{ color: E.gris, fontSize: 30 }}>{"</>"}</span>{it.texto}</div>
        );
      })}
      {/* AHORA */}
      <Caja r={G.ahora} t={t} at={m.t.ahora} radio={34} borde={E.acento} fondo="#120D0A">
        <div style={{ position: "absolute", left: 40, top: 34 }}><Antetitulo texto={img.ahora.titulo} size={30} /></div>
      </Caja>
      <div style={{ ...pos(G.burbuja), opacity: fb.opacity, scale: String(fb.scale), transformOrigin: "20% 100%" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: E.crema, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: TITULO, fontWeight: 800, fontSize: 58, letterSpacing: -1.5, color: E.oscuro }}>{img.ahora.frase}</div>
        <div style={{ position: "absolute", left: 50, bottom: -26, width: 0, height: 0, borderLeft: "22px solid transparent", borderRight: "22px solid transparent", borderTop: `30px solid ${E.crema}` }} />
      </div>
      {/* flecha burbuja → carpeta */}
      {t >= m.t.fraseB + 0.2 && (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
          <path d={`M 535 1255 L ${535 + 95 * ramp(t, m.t.fraseB + 0.2, m.t.fraseB + 0.5)} 1255`} stroke={E.acento} strokeWidth={6} strokeLinecap="round" />
          {t >= m.t.fraseB + 0.5 && <path d="M 612 1240 L 632 1255 L 612 1270" stroke={E.acento} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
      )}
      <Carpeta r={G.carpeta} t={t} at={m.t.ahora + 0.15} lleno={vuelo} etiqueta={img.ahora.carpeta} />
      {/* archivos que vuelan de la burbuja a la carpeta */}
      {vuelo > 0 && vuelo < 1 && [0, 1, 2].map((k) => {
        const u = Math.min(1, Math.max(0, vuelo * 1.4 - k * 0.2));
        if (u <= 0 || u >= 1) return null;
        const x = 470 + (780 - 470) * u, y = 1250 - Math.sin(u * Math.PI) * 120 + (1260 - 1250) * u;
        return <Archivo key={k} x={x} y={y} s={0.9} />;
      })}
    </>
  );
};

const Teclado: React.FC<{ r: { x: number; y: number; w: number; h: number }; t: number; activo: boolean; at: number }> = ({ r, t, activo, at }) => {
  const E = useEstilo();
  const a = pop(t, at + 0.1, 0.3);
  const cols = 5, filas = 3, gap = 10;
  const kw = (r.w - gap * (cols - 1)) / cols, kh = (r.h - gap * (filas - 1)) / filas;
  const pulsada = activo ? Math.floor((t - at) * 9) : -1;
  return (
    <div style={{ ...pos(r), opacity: a.opacity }}>
      {Array.from({ length: cols * filas }, (_, i) => {
        const on = activo && (pulsada * 7 + 3) % (cols * filas) === i;
        return (
          <div key={i} style={{
            position: "absolute", left: (i % cols) * (kw + gap), top: Math.floor(i / cols) * (kh + gap) + (on ? 5 : 0), width: kw, height: kh,
            borderRadius: 12, background: on ? E.acento : "#1E1E1E", border: `2px solid ${on ? E.acento : "#333"}`, boxSizing: "border-box",
            boxShadow: on ? `0 0 20px ${E.acento}88` : "0 5px 0 #0A0A0A",
          }} />
        );
      })}
    </div>
  );
};

const Archivo: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => {
  const E = useEstilo();
  return (
    <div style={{ position: "absolute", left: x - 30 * s, top: y - 38 * s, width: 60 * s, height: 76 * s, borderRadius: 8, background: E.crema, boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
      {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: 10 * s, top: (18 + k * 16) * s, width: (k === 2 ? 26 : 40) * s, height: 6 * s, borderRadius: 3, background: E.acento }} />)}
    </div>
  );
};

const Carpeta: React.FC<{ r: { x: number; y: number; w: number; h: number }; t: number; at: number; lleno: number; etiqueta: string }> = ({ r, t, at, lleno, etiqueta }) => {
  const E = useEstilo();
  const a = pop(t, at, 0.3);
  return (
    <div style={{ ...pos(r), opacity: a.opacity, scale: String(a.scale * (1 + 0.06 * Math.sin(Math.min(1, lleno) * Math.PI))) }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 140, height: 56, borderRadius: "18px 18px 0 0", background: "#C9541A" }} />
      <div style={{ position: "absolute", left: 0, top: 38, width: r.w, height: r.h - 38, borderRadius: "0 22px 22px 22px", background: E.acento, boxShadow: `0 0 ${50 * lleno}px ${E.acento}99` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: r.h + 18, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: E.acentoSuave }}>{etiqueta.toUpperCase()}</div>
    </div>
  );
};
