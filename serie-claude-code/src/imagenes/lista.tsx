/** Lista: un titular y tarjetas que aparecen al nombrarlas (p. ej., los próximos episodios, sin numerarlos). */
import React from "react";
import { useEstilo } from "../componentes/estilo";
import type { Ctx } from "../plan";
import { TITULO, pop } from "../tema";
import type { Ancla, Medida, Rect } from "../tipos";
import { Antetitulo, crecer, pos } from "./piezas";

type Img = { tipo: "lista"; portal?: string; titulo: string; en?: Ancla; items: { texto: string; en?: Ancla }[] };

const tarjeta = (i: number, n: number): Rect => {
  const h = Math.min(200, (760 - 24 * (n - 1)) / n);
  return { x: 70, y: 740 + i * (h + 24), w: 940, h };
};

export const medirLista = (img: Img, ctx: Ctx): Medida => {
  const n = img.items.length;
  const elementos: Medida["elementos"] = { titulo: { x: 70, y: 660, w: 940, h: 50 } };
  const t: Record<string, number> = { titulo: ctx.at(img.en, ctx.inicio + 0.2) };
  const focos: Medida["focos"] = [];
  let ultimo = t.titulo;
  img.items.forEach((it, i) => {
    const r = tarjeta(i, n);
    elementos[`item-${i}`] = r;
    t[`item-${i}`] = ultimo = ctx.at(it.en, ultimo + 0.5);
    focos.push({ t: t[`item-${i}`], rect: crecer(r, 80) });
    elementos[`boton-${i}`] = { x: r.x + r.w - 130, y: r.y + r.h / 2 - 50, w: 100, h: 100 };
  });
  const ult = elementos[`boton-${n - 1}`];
  const portal = img.portal ? elementos[img.portal.replace("item-", "boton-")] ?? ult : ult;
  return {
    elementos, focos, t,
    portal: { ...portal, radio: 50, vista: false },
    eventos: img.items.map((_, i) => ({ t: t[`item-${i}`], sfx: "pop" as const, vol: 0.3 })),
  };
};

export const VistaLista: React.FC<{ img: Img; m: Medida; t: number }> = ({ img, m, t }) => {
  const E = useEstilo();
  const a = pop(t, m.t.titulo, 0.3);
  return (
    <>
      <div style={{ ...pos(m.elementos.titulo), opacity: a.opacity, textAlign: "center" }}><Antetitulo texto={img.titulo} size={34} /></div>
      {img.items.map((it, i) => {
        const r = m.elementos[`item-${i}`];
        const b = m.elementos[`boton-${i}`];
        const p = pop(t, m.t[`item-${i}`], 0.3);
        const viva = t >= m.t[`item-${i}`];
        return (
          <div key={i} style={{
            ...pos(r), borderRadius: 30, background: "#121212", border: `3px solid ${viva ? E.borde : "#1E1E1E"}`, boxSizing: "border-box",
            boxShadow: "0 18px 50px rgba(0,0,0,0.45)", opacity: viva ? 1 : 0.35, scale: String(viva ? p.scale : 0.97),
          }}>
            <div style={{ position: "absolute", left: 40, top: 0, bottom: 0, right: 170, opacity: viva ? p.opacity : 0, translate: `${(1 - p.p) * 40}px 0px`, display: "flex", alignItems: "center", fontFamily: TITULO, fontWeight: 800, fontSize: it.texto.length > 16 ? 54 : 62, letterSpacing: -1.8, color: E.texto, lineHeight: 1.05 }}>{it.texto}</div>
            <div style={{ position: "absolute", left: b.x - r.x, top: b.y - r.y, width: b.w, height: b.h, borderRadius: b.w / 2, background: E.acento, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 0, height: 0, borderTop: "20px solid transparent", borderBottom: "20px solid transparent", borderLeft: `32px solid ${E.oscuro}`, marginLeft: 8 }} />
            </div>
          </div>
        );
      })}
    </>
  );
};
