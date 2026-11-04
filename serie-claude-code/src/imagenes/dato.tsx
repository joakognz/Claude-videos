/** Dato (regla 7): una cifra grande, qué significa y SIEMPRE su fuente debajo. Sin fuente, el plan avisa y no se pinta. */
import React from "react";
import { ClipPantalla, marcoClip } from "../componentes/ClipPantalla";
import type { ClipProps } from "../componentes/ClipPantalla";
import { useEstilo } from "../componentes/estilo";
import type { Ctx } from "../plan";
import { MONO, TITULO, UI, pop } from "../tema";
import type { DatoSpec, Medida } from "../tipos";
import { crecer } from "./piezas";

type ImgDato = { tipo: "dato"; portal?: string; dato: DatoSpec };

const VALOR = { x: 60, y: 760, w: 960, h: 300 };

export const medirDato = (img: ImgDato, ctx: Ctx): Medida => {
  const t0 = ctx.at(img.dato.en, ctx.inicio + 0.3);
  return {
    elementos: { valor: VALOR, fuente: { x: 60, y: 1290, w: 960, h: 70 } },
    focos: [{ t: t0, rect: crecer(VALOR, 60) }],
    portal: { x: VALOR.x + 200, y: VALOR.y + 40, w: 560, h: 220, radio: 30, vista: false },
    t: { valor: t0, fuente: t0 + 0.5 },
    eventos: [{ t: t0, sfx: "pop", vol: 0.45 }],
  };
};

export const VistaDato: React.FC<{ img: ImgDato; m: Medida; t: number }> = ({ img, m, t }) => {
  const E = useEstilo();
  const a = pop(t, m.t.valor, 0.35);
  const f = pop(t, m.t.fuente, 0.3);
  if (!img.dato.fuente) return null; // regla 7: nunca una cifra sin fuente
  return (
    <>
      <div style={{ position: "absolute", left: VALOR.x, top: VALOR.y, width: VALOR.w, height: VALOR.h, display: "flex", alignItems: "center", justifyContent: "center", opacity: a.opacity, scale: String(a.scale) }}>
        <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: img.dato.valor.length > 6 ? 170 : 230, letterSpacing: -8, color: E.acento, textShadow: `0 0 80px ${E.acento}66` }}>{img.dato.valor}</div>
      </div>
      {img.dato.texto && (
        <div style={{ position: "absolute", left: 80, right: 80, top: 1090, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 52, lineHeight: 1.15, color: E.texto, opacity: a.opacity }}>{img.dato.texto}</div>
      )}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1290, textAlign: "center", opacity: f.opacity }}>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: E.oscuro, background: E.acentoSuave, padding: "10px 18px", borderRadius: 10 }}>FUENTE</span>
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 30, color: E.gris, marginLeft: 18 }}>{img.dato.fuente}</span>
      </div>
    </>
  );
};

// ── clip real ─────────────────────────────────────────────────────────────────────────────────────────────────────
type ImgClip = { tipo: "clip"; portal?: string } & ClipProps;

export const medirClip = (img: ImgClip, ctx: Ctx): Medida => {
  const F = marcoClip(img);
  return {
    elementos: { clip: F },
    // el zoom hacia el cursor lo hace el propio clip; la cámara del lienzo solo encuadra el marco
    focos: [{ t: ctx.inicio + 0.05, rect: crecer(F, 20) }],
    portal: { x: F.x + F.w / 2 - 90, y: F.y + F.h / 2 - 160, w: 180, h: 320, radio: 16, vista: false },
    t: { inicio: ctx.inicio, fin: ctx.fin },
  };
};

export const VistaClip: React.FC<{ img: ImgClip; m: Medida; t: number; fps: number }> = ({ img, m, t, fps }) => (
  <ClipPantalla clip={img} t={t} inicio={m.t.inicio} fin={m.t.fin} fps={fps} />
);
