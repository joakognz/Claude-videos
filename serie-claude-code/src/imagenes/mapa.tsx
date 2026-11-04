/** Mapa anidado: cajas dentro de cajas (empresa → marca → productos, con una base debajo). Lo general primero. */
import React from "react";
import { useEstilo } from "../componentes/estilo";
import type { Ctx } from "../plan";
import { MONO, TITULO, UI, pop, rand } from "../tema";
import type { Medida, NodoMapa, Rect } from "../tipos";
import { Antetitulo, Caja, crecer, pos } from "./piezas";

type Img = { tipo: "mapa"; raiz: NodoMapa; portal?: string };

type Pieza =
  | { k: "nodo"; n: NodoMapa; r: Rect; depth: number; hoja: boolean }
  | { k: "etqHijos"; texto: string; r: Rect; at?: string }
  | { k: "base"; n: NonNullable<NodoMapa["base"]>; r: Rect; chips: Rect[] };

const CAB = 132;

const maquetar = (n: NodoMapa, r: Rect, depth: number, out: Pieza[]) => {
  const hijos = n.hijos ?? [];
  const hoja = hijos.length === 0;
  out.push({ k: "nodo", n, r, depth, hoja });
  if (hoja) return;
  const inner = { x: r.x + 28, y: r.y + CAB, w: r.w - 56, h: r.h - CAB - 28 };
  if (hijos.length === 1 && (hijos[0].hijos?.length ?? 0) > 0) return maquetar(hijos[0], inner, depth + 1, out);
  let y = inner.y;
  if (n.etiquetaHijos) {
    out.push({ k: "etqHijos", texto: n.etiquetaHijos.texto, r: { x: inner.x, y, w: inner.w, h: 40 } });
    y += 52;
  }
  const baseH = n.base ? 196 : 0;
  const filaH = inner.y + inner.h - y - (n.base ? baseH + 26 : 0);
  const gap = 20;
  const w = (inner.w - gap * (hijos.length - 1)) / hijos.length;
  hijos.forEach((h, i) => maquetar(h, { x: inner.x + i * (w + gap), y, w, h: filaH }, depth + 1, out));
  if (n.base) {
    const b = { x: inner.x, y: y + filaH + 26, w: inner.w, h: baseH };
    const k = n.base.items.length;
    const cw = (b.w - 48 - 16 * (k - 1)) / k;
    const chips = n.base.items.map((_, i) => ({ x: b.x + 24 + i * (cw + 16), y: b.y + 82, w: cw, h: 88 }));
    out.push({ k: "base", n: n.base, r: b, chips });
  }
};

const piezas = (raiz: NodoMapa) => {
  const out: Pieza[] = [];
  maquetar(raiz, { x: 40, y: 615, w: 1000, h: 880 }, 0, out);
  return out;
};

/** El hueco «pantalla» de una caja hoja (debajo de su título): ahí se ve el lienzo siguiente. */
const pantalla = (r: Rect): Rect => ({ x: r.x + 16, y: r.y + 124, w: r.w - 32, h: r.h - 140 });

export const medirMapa = (img: Img, ctx: Ctx): Medida => {
  const P = piezas(img.raiz);
  const elementos: Medida["elementos"] = {};
  const t: Record<string, number> = {};
  const focos: Medida["focos"] = [];
  let ultimoT = ctx.inicio;
  for (const p of P) {
    if (p.k === "nodo") {
      elementos[p.n.id] = p.r;
      t[p.n.id] = ultimoT = ctx.at(p.n.en, ultimoT + 0.2);
      focos.push({ t: t[p.n.id], rect: p.hoja ? crecer(p.r, 60) : p.r });
    } else if (p.k === "etqHijos") {
      elementos[`etq:${p.texto}`] = p.r;
    } else {
      elementos[p.n.id] = p.r;
      t[p.n.id] = ctx.at(p.n.en, ultimoT + 0.4);
      focos.push({ t: t[p.n.id], rect: crecer(p.r, 40) });
      p.n.items.forEach((it, i) => {
        elementos[`${p.n.id}:${i}`] = p.chips[i];
        t[`${p.n.id}:${i}`] = ctx.at(it.en, t[p.n.id] + 0.3 + i * 0.3);
      });
    }
  }
  // la etiqueta de los hijos aparece con su ancla (o con el primer hijo)
  const raizHijos = (n: NodoMapa): NodoMapa | null => (n.etiquetaHijos ? n : (n.hijos ?? []).map(raizHijos).find(Boolean) ?? null);
  const nh = raizHijos(img.raiz);
  if (nh?.etiquetaHijos) {
    t.etqHijos = ctx.at(nh.etiquetaHijos.en, t[nh.hijos![0].id] - 0.3);
    const fila = P.filter((p) => p.k === "nodo" && nh.hijos!.some((h) => h.id === p.n.id)).map((p) => p.r);
    const r = fila.reduce((a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.max(a.x + a.w, b.x + b.w) - Math.min(a.x, b.x), h: Math.max(a.y + a.h, b.y + b.h) - Math.min(a.y, b.y) }));
    elementos.fila = r;
    focos.push({ t: t.etqHijos, rect: crecer(r, 30) });
  }
  const portalR = img.portal && elementos[img.portal] ? pantalla(elementos[img.portal]) : undefined;
  return {
    elementos, focos, t,
    portal: portalR ? { ...portalR, radio: 14 } : undefined,
    eventos: Object.entries(t).filter(([k]) => !k.includes(":") && k !== "etqHijos").map(([, v]) => ({ t: v, sfx: "pop" as const, vol: 0.22 })),
  };
};

export const VistaMapa: React.FC<{ img: Img; m: Medida; t: number }> = ({ img, m, t }) => {
  const E = useEstilo();
  const P = piezas(img.raiz);
  return (
    <>
      {P.map((p, i) => {
        if (p.k === "nodo") {
          const at = m.t[p.n.id];
          const dest = !!p.n.destacado;
          const encendido = dest && t >= at;
          if (!p.hoja) {
            return (
              <Caja key={i} r={p.r} t={t} at={at} radio={40 - p.depth * 6} borde={p.depth === 0 ? "#3A3A3A" : E.borde} fondo={p.depth === 0 ? "#0B0B0B" : "#111111"}>
                <div style={{ position: "absolute", left: 32, top: 26 }}>
                  {p.n.etiqueta && <Antetitulo texto={p.n.etiqueta} size={24} color={E.gris} />}
                  <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: p.depth === 0 ? 62 : 54, letterSpacing: -1.5, color: E.texto, marginTop: 4 }}>{p.n.titulo}</div>
                </div>
              </Caja>
            );
          }
          const scr = pantalla(p.r);
          const [l1, ...resto] = p.n.titulo.split(" ");
          return (
            <Caja key={i} r={p.r} t={t} at={at} radio={24} borde={encendido ? E.acento : E.borde} grosor={encendido ? 4 : 3} fondo="#151515" brillo={encendido}>
              <div style={{ position: "absolute", left: 20, top: 18, fontFamily: UI, fontWeight: 700, fontSize: 38, lineHeight: 1.05, letterSpacing: -0.8, color: E.texto }}>
                <div style={{ color: E.gris, fontSize: 30 }}>{l1}</div>
                <div style={{ color: dest ? E.acentoSuave : E.texto }}>{resto.join(" ")}</div>
              </div>
              <div style={{ position: "absolute", left: scr.x - p.r.x, top: scr.y - p.r.y, width: scr.w, height: scr.h, borderRadius: 14, background: "#0A0A0A", border: `2px solid ${E.borde}`, boxSizing: "border-box", overflow: "hidden" }}>
                {!dest && Array.from({ length: 4 }, (_, k) => (
                  <div key={k} style={{ position: "absolute", left: 14, top: 18 + k * 34, height: 12, width: `${30 + rand(i * 9 + k) * 55}%`, borderRadius: 6, background: "#2C2C2C" }} />
                ))}
              </div>
            </Caja>
          );
        }
        if (p.k === "etqHijos") {
          const a = pop(t, m.t.etqHijos ?? 0);
          return <div key={i} style={{ ...pos(p.r), opacity: a.opacity }}><Antetitulo texto={p.texto} size={24} /></div>;
        }
        const at = m.t[p.n.id];
        return (
          <Caja key={i} r={p.r} t={t} at={at} radio={22} borde="#3A3A3A" fondo="#0D0D0D" style={{ borderStyle: "dashed" }}>
            <div style={{ position: "absolute", left: 24, top: 22 }}><Antetitulo texto={p.n.titulo} size={26} /></div>
            {p.n.items.map((it, k) => {
              const c = p.chips[k];
              const a = pop(t, m.t[`${p.n.id}:${k}`], 0.25);
              return (
                <div key={k} style={{
                  position: "absolute", left: c.x - p.r.x, top: c.y - p.r.y, width: c.w, height: c.h, borderRadius: 16, background: "#1A1A1A",
                  border: `2px solid ${E.borde}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: TITULO, fontWeight: 700, fontSize: 42, color: E.texto, opacity: a.opacity, scale: String(a.scale),
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 22, color: E.acento, marginRight: 12 }}>◆</span>{it.texto}
                </div>
              );
            })}
          </Caja>
        );
      })}
    </>
  );
};
