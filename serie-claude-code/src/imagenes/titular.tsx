/** Titular: antetítulo + título grande + subtítulo, con una lupa o un panel de código que hace de portal. */
import React from "react";
import { useEstilo } from "../componentes/estilo";
import type { Ctx } from "../plan";
import { TITULO, UI, pop } from "../tema";
import type { Ancla, Medida } from "../tipos";
import { Antetitulo, BarraVentana, Caja, CodigoAbstracto, pos } from "./piezas";

type Img = { tipo: "titular"; antetitulo?: string; antetituloEn?: Ancla; titulo: string; subtitulo?: string; en?: Ancla; panel?: { en?: Ancla }; portal?: "lupa" | "panel" };

const tamTitulo = (s: string) => Math.min(150, 940 / (s.length * 0.62));

export const medirTitular = (img: Img, ctx: Ctx): Medida => {
  const size = tamTitulo(img.titulo);
  const yT = 745;
  const titulo = { x: 70, y: yT, w: 940, h: size * 1.1 + (img.subtitulo ? 80 : 0) };
  const tTitulo = ctx.at(img.en, ctx.inicio + 0.25);
  const elementos: Medida["elementos"] = { titulo };
  const focos: Medida["focos"] = [];
  let portal: Medida["portal"];
  const t: Record<string, number> = { titulo: tTitulo, ante: ctx.at(img.antetituloEn, ctx.inicio + 0.1) };
  const y1 = yT + titulo.h + 70;
  if (img.portal === "lupa") {
    const r = 200, cx = 540, cy = Math.max(y1 + r, 1180);
    const lupa = { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r };
    elementos.lupa = lupa;
    t.lupa = ctx.inicio + 0.45;
    portal = { ...lupa, radio: r };
  } else if (img.portal === "panel" || img.panel) {
    const panel = { x: 80, y: y1, w: 920, h: Math.min(1490 - y1, 520) };
    const cuerpo = { x: panel.x + 24, y: panel.y + 86, w: panel.w - 48, h: panel.h - 106 };
    elementos.panel = panel;
    elementos.codigo = cuerpo;
    t.panel = ctx.at(img.panel?.en, tTitulo + 0.6);
    focos.push({ t: t.panel, rect: panel });
    portal = { ...cuerpo, radio: 14, vista: false };
  }
  return { elementos, focos, portal, t };
};

export const VistaTitular: React.FC<{ img: Img; m: Medida; t: number }> = ({ img, m, t }) => {
  const E = useEstilo();
  const size = tamTitulo(img.titulo);
  const a = pop(t, m.t.ante, 0.3);
  const b = pop(t, m.t.titulo, 0.35);
  return (
    <>
      <div style={{ ...pos(m.elementos.titulo), textAlign: "center" }}>
        {img.antetitulo && <div style={{ position: "absolute", top: -60, left: 0, right: 0, opacity: a.opacity }}><Antetitulo texto={img.antetitulo} size={32} /></div>}
        <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: size, lineHeight: 1.05, letterSpacing: -size * 0.035, color: E.texto, opacity: b.opacity, translate: `0px ${(1 - b.p) * 40}px`, filter: b.p < 1 ? `blur(${(1 - b.p) * 8}px)` : undefined }}>
          {img.titulo}
        </div>
        {img.subtitulo && (
          <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 54, color: E.acentoSuave, marginTop: 14, opacity: pop(t, m.t.panel ?? m.t.titulo + 0.3).opacity }}>{img.subtitulo}</div>
        )}
      </div>
      {m.elementos.lupa && <Lupa r={m.elementos.lupa} t={t} at={m.t.lupa} />}
      {m.elementos.panel && (
        <Caja r={m.elementos.panel} t={t} at={m.t.panel - 0.25} radio={30}>
          <BarraVentana w={m.elementos.panel.w - 6} />
          <CodigoAbstracto r={{ x: 24, y: 86, w: m.elementos.panel.w - 48, h: m.elementos.panel.h - 106 }} t={t} desde={m.t.panel} lineas={Math.floor((m.elementos.panel.h - 106) / 54)} semilla={5} />
        </Caja>
      )}
    </>
  );
};

const Lupa: React.FC<{ r: { x: number; y: number; w: number; h: number }; t: number; at: number }> = ({ r, t, at }) => {
  const E = useEstilo();
  const a = pop(t, at, 0.35);
  const R = r.w / 2;
  return (
    <div style={{ ...pos(r), opacity: a.opacity, scale: String(a.scale) }}>
      {/* mango */}
      <div style={{ position: "absolute", left: R + R * 0.62, top: R + R * 0.62, width: R * 0.95, height: 46, borderRadius: 23, background: E.crema, rotate: "45deg", transformOrigin: "0 50%", translate: "0px -23px" }} />
      {/* aro */}
      <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: `16px solid ${E.crema}`, boxShadow: `0 0 70px ${E.acento}44`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.10), rgba(255,255,255,0) 55%)" }} />
    </div>
  );
};
