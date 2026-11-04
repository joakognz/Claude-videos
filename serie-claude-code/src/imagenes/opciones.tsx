/** Opciones que llevan al mismo sitio: tarjetas alrededor de un núcleo, con flechas que convergen en él. */
import React from "react";
import { useEstilo } from "../componentes/estilo";
import type { Ctx } from "../plan";
import { MONO, TITULO, UI, pop, ramp } from "../tema";
import type { Ancla, Medida, Rect } from "../tipos";
import { crecer, pos } from "./piezas";

type Img = {
  tipo: "opciones";
  portal?: string;
  items: { id: string; texto: string; icono?: "terminal" | "editor" | "app"; en?: Ancla }[];
  nucleo?: { texto: string; en?: Ancla };
};

const NUCLEO: Rect = { x: 290, y: 990, w: 500, h: 170 };
const tarjeta = (i: number, n: number): Rect => {
  if (n <= 4) {
    const col = i % 2, fila = Math.floor(i / 2);
    return { x: col ? 565 : 55, y: fila ? 1245 : 650, w: 460, h: 245 };
  }
  const w = 300, cols = 3;
  return { x: 60 + (i % cols) * (w + 20), y: i < cols ? 650 : 1245, w, h: 230 };
};

export const medirOpciones = (img: Img, ctx: Ctx): Medida => {
  const elementos: Medida["elementos"] = {};
  const t: Record<string, number> = {};
  const focos: Medida["focos"] = [];
  let ultimo = ctx.inicio + 0.3;
  img.items.forEach((it, i) => {
    const r = tarjeta(i, img.items.length);
    elementos[it.id] = r;
    t[it.id] = ultimo = ctx.at(it.en, ultimo + 0.4);
    focos.push({ t: t[it.id], rect: crecer(r, 60) });
  });
  const todas = { x: 55, y: 650, w: 970, h: 840 };
  elementos.opciones = todas;
  if (img.nucleo) {
    elementos.nucleo = NUCLEO;
    t.nucleo = ctx.at(img.nucleo.en, ultimo + 0.6);
    focos.push({ t: t.nucleo, rect: todas });
  }
  return {
    elementos, focos, t,
    portal: img.nucleo ? { x: NUCLEO.x + 12, y: NUCLEO.y + 12, w: NUCLEO.w - 24, h: NUCLEO.h - 24, radio: 26, vista: false } : undefined,
    eventos: [...img.items.map((it) => ({ t: t[it.id], sfx: "pop" as const, vol: 0.28 })), ...(img.nucleo ? [{ t: t.nucleo, sfx: "pop" as const, vol: 0.4 }] : [])],
  };
};

export const VistaOpciones: React.FC<{ img: Img; m: Medida; t: number }> = ({ img, m, t }) => {
  const E = useEstilo();
  const tn = m.t.nucleo;
  const a = tn !== undefined ? pop(t, tn, 0.3) : null;
  return (
    <>
      {/* flechas hacia el núcleo */}
      {tn !== undefined && t >= tn && (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
          {img.items.map((it, i) => {
            const r = m.elementos[it.id];
            const sx = r.x + r.w / 2, sy = r.y < NUCLEO.y ? r.y + r.h : r.y;
            const ex = NUCLEO.x + NUCLEO.w / 2 + (sx < 540 ? -120 : 120), ey = sy < NUCLEO.y ? NUCLEO.y - 10 : NUCLEO.y + NUCLEO.h + 10;
            const u = ramp(t, tn + i * 0.07, tn + i * 0.07 + 0.3);
            const x = sx + (ex - sx) * u, y = sy + (ey - sy) * u;
            const ang = Math.atan2(ey - sy, ex - sx);
            return (
              <g key={i}>
                <path d={`M ${sx} ${sy + (sy < NUCLEO.y ? 10 : -10)} L ${x} ${y}`} stroke={E.acento} strokeWidth={6} strokeLinecap="round" strokeDasharray="2 14" />
                {u >= 1 && <path d={`M ${ex - 22 * Math.cos(ang - 0.5)} ${ey - 22 * Math.sin(ang - 0.5)} L ${ex} ${ey} L ${ex - 22 * Math.cos(ang + 0.5)} ${ey - 22 * Math.sin(ang + 0.5)}`} stroke={E.acento} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              </g>
            );
          })}
        </svg>
      )}
      {img.items.map((it) => {
        const r = m.elementos[it.id];
        const p = pop(t, m.t[it.id], 0.3);
        const on = tn !== undefined && t >= tn;
        const viva = t >= m.t[it.id];
        return (
          <div key={it.id} style={{
            ...pos(r), borderRadius: 30, border: `3px solid ${viva && !on ? E.acento : E.borde}`, background: "#121212", boxSizing: "border-box",
            opacity: viva ? 1 : 0.32, scale: String(viva ? p.scale : 0.96), filter: viva ? undefined : "grayscale(1)",
            padding: "34px 34px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          }}>
            <Icono tipo={it.icono ?? "app"} encendido={on} />
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: it.texto.length > 12 ? 44 : 54, letterSpacing: -1, color: E.texto, lineHeight: 1.05 }}>{it.texto}</div>
          </div>
        );
      })}
      {a && img.nucleo && (
        <div style={{
          ...pos(NUCLEO), borderRadius: 38, background: E.acento, opacity: a.opacity, scale: String(a.scale), display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 80px ${E.acento}88`, fontFamily: TITULO, fontWeight: 800, fontSize: 64, letterSpacing: -2, color: E.oscuro,
        }}>{img.nucleo.texto}</div>
      )}
    </>
  );
};

const Icono: React.FC<{ tipo: "terminal" | "editor" | "app"; encendido: boolean }> = ({ tipo, encendido }) => {
  const E = useEstilo();
  const c = encendido ? E.acento : E.acentoSuave;
  const caja: React.CSSProperties = { width: 104, height: 78, borderRadius: 14, border: `4px solid ${c}`, boxSizing: "border-box", position: "relative" };
  if (tipo === "terminal")
    return <div style={{ ...caja, display: "flex", alignItems: "center", paddingLeft: 14, fontFamily: MONO, fontWeight: 700, fontSize: 34, color: c }}>{">_"}</div>;
  if (tipo === "editor")
    return (
      <div style={caja}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 26, borderRight: `4px solid ${c}` }} />
        {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: 36, top: 14 + k * 17, width: [44, 30, 38][k], height: 7, borderRadius: 4, background: c }} />)}
      </div>
    );
  return (
    <div style={caja}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 18, borderBottom: `4px solid ${c}` }} />
      <div style={{ position: "absolute", left: 30, top: 32, width: 40, height: 26, borderRadius: 6, background: c }} />
    </div>
  );
};
