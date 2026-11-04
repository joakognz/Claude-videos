/** Ciclo: N pasos en círculo unidos por arcos con flecha; al nombrarlo, un punto de luz lo recorre. */
import React from "react";
import { useEstilo } from "../componentes/estilo";
import type { Ctx } from "../plan";
import { MONO, TITULO, pop, ramp } from "../tema";
import type { Ancla, Medida } from "../tipos";
import { crecer } from "./piezas";

type Img = { tipo: "ciclo"; portal?: string; centro: { texto: string; en?: Ancla }; items: { texto: string; en?: Ancla }[] };

const C = { x: 540, y: 1075 };
const RAD = 268;
const RN = 116;
const angulo = (i: number, n: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
const nodo = (i: number, n: number) => ({ x: C.x + RAD * Math.cos(angulo(i, n)), y: C.y + RAD * Math.sin(angulo(i, n)) });

export const medirCiclo = (img: Img, ctx: Ctx): Medida => {
  const n = img.items.length;
  const elementos: Medida["elementos"] = {};
  const t: Record<string, number> = {};
  const focos: Medida["focos"] = [];
  let ultimo = ctx.inicio;
  img.items.forEach((it, i) => {
    const p = nodo(i, n);
    elementos[`item-${i}`] = { x: p.x - RN, y: p.y - RN, w: 2 * RN, h: 2 * RN };
    t[`item-${i}`] = ultimo = ctx.at(it.en, ultimo + 0.4);
  });
  const todo = { x: C.x - RAD - RN, y: C.y - RAD - RN, w: 2 * (RAD + RN), h: 2 * (RAD + RN) };
  elementos.ciclo = todo;
  elementos.centro = { x: C.x - 120, y: C.y - 120, w: 240, h: 240 };
  t.centro = ctx.at(img.centro.en, ultimo + 0.8);
  focos.push({ t: t.centro - 0.15, rect: crecer(elementos.centro, 160) });
  return {
    elementos, focos, t,
    portal: { ...elementos.centro, radio: 120, vista: false },
    eventos: [...img.items.map((_, i) => ({ t: t[`item-${i}`], sfx: "pop" as const, vol: 0.3 })), { t: t.centro, sfx: "tick", vol: 0.45 }],
  };
};

export const VistaCiclo: React.FC<{ img: Img; m: Medida; t: number }> = ({ img, m, t }) => {
  const E = useEstilo();
  const n = img.items.length;
  const vuelta = t >= m.t.centro ? ((t - m.t.centro) / 1.6) % 1 : -1;
  const pc = pop(t, m.t.centro, 0.35);
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
        <circle cx={C.x} cy={C.y} r={RAD} stroke="#262626" strokeWidth={3} fill="none" strokeDasharray="4 16" />
        {img.items.map((_, i) => {
          // arco del nodo i al siguiente; el último (de vuelta al primero) se cierra al decir «ciclo»
          const at = i + 1 < n ? m.t[`item-${i + 1}`] - 0.15 : m.t.centro - 0.2;
          const u = ramp(t, at, at + 0.35);
          if (u <= 0) return null;
          const gap = Math.asin(RN / RAD) + 0.08;
          const a0 = angulo(i, n) + gap, a1 = angulo(i + 1, n) - gap;
          const a = a0 + (a1 - a0) * u;
          const p0 = { x: C.x + RAD * Math.cos(a0), y: C.y + RAD * Math.sin(a0) };
          const p1 = { x: C.x + RAD * Math.cos(a), y: C.y + RAD * Math.sin(a) };
          const tg = a + Math.PI / 2;
          return (
            <g key={i}>
              <path d={`M ${p0.x} ${p0.y} A ${RAD} ${RAD} 0 0 1 ${p1.x} ${p1.y}`} stroke={E.acento} strokeWidth={8} fill="none" strokeLinecap="round" />
              {u >= 1 && <path d={`M ${p1.x - 26 * Math.cos(tg - 0.5)} ${p1.y - 26 * Math.sin(tg - 0.5)} L ${p1.x} ${p1.y} L ${p1.x - 26 * Math.cos(tg + 0.5)} ${p1.y - 26 * Math.sin(tg + 0.5)}`} stroke={E.acento} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            </g>
          );
        })}
        {vuelta >= 0 && (
          <circle cx={C.x + RAD * Math.cos(-Math.PI / 2 + vuelta * 2 * Math.PI)} cy={C.y + RAD * Math.sin(-Math.PI / 2 + vuelta * 2 * Math.PI)} r={16} fill={E.crema} style={{ filter: `drop-shadow(0 0 16px ${E.acento})` }} />
        )}
      </svg>
      {img.items.map((it, i) => {
        const p = nodo(i, n);
        const a = pop(t, m.t[`item-${i}`], 0.3);
        const activo = vuelta >= 0 && Math.abs(((vuelta - i / n + 1) % 1) - 0) < 0.12;
        return (
          <div key={i} style={{
            position: "absolute", left: p.x - RN, top: p.y - RN, width: 2 * RN, height: 2 * RN, borderRadius: RN, boxSizing: "border-box",
            border: `5px solid ${activo ? E.acentoSuave : E.acento}`, background: activo ? "#2A1608" : "#141414", opacity: a.opacity, scale: String(a.scale),
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: `0 0 50px ${E.acento}33`,
          }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: E.gris }}>{i + 1}</div>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: it.texto.length > 8 ? 40 : 46, letterSpacing: -1.2, color: E.texto }}>{it.texto}</div>
          </div>
        );
      })}
      <div style={{
        position: "absolute", left: C.x - 120, top: C.y - 120, width: 240, height: 240, borderRadius: 120, background: E.acento, opacity: pc.opacity, scale: String(pc.scale),
        display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 32, letterSpacing: 3, color: E.oscuro,
        boxShadow: `0 0 70px ${E.acento}88`,
      }}>{img.centro.texto}</div>
    </>
  );
};
