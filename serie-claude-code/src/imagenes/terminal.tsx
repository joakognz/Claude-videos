/** Terminal: una petición que se escribe letra a letra mientras la voz la dice, y la zona de salida debajo. */
import React from "react";
import { useEstilo } from "../componentes/estilo";
import type { Ctx } from "../plan";
import { MONO, UI, pop } from "../tema";
import type { Ancla, Medida } from "../tipos";
import { BarraVentana, Caja, CursorTexto, crecer } from "./piezas";

type Img = { tipo: "terminal"; titulo?: string; portal?: string; prompt: { texto: string; en?: Ancla; hasta?: Ancla } };

const VENTANA = { x: 55, y: 640, w: 970, h: 850 };
const PROMPT = { x: 95, y: 760, w: 890, h: 230 };
const SALIDA = { x: 95, y: 1030, w: 890, h: 420 };

export const medirTerminal = (img: Img, ctx: Ctx): Medida => {
  const t0 = ctx.at(img.prompt.en, ctx.inicio + 0.4);
  const t1 = Math.max(t0 + 0.6, ctx.at(img.prompt.hasta, t0 + img.prompt.texto.length * 0.06) + 0.35);
  return {
    elementos: { ventana: VENTANA, prompt: PROMPT, salida: SALIDA },
    focos: [{ t: t0, rect: crecer(PROMPT, 50) }],
    portal: { ...SALIDA, radio: 20 },
    t: { ventana: ctx.inicio, escribe: t0, fin: t1 },
    eventos: [{ t: t0, sfx: "tecleo", vol: 0.32, dur: t1 - t0 }],
  };
};

export const VistaTerminal: React.FC<{ img: Img; m: Medida; t: number }> = ({ img, m, t }) => {
  const E = useEstilo();
  const n = Math.round(Math.min(1, Math.max(0, (t - m.t.escribe) / (m.t.fin - m.t.escribe))) * img.prompt.texto.length);
  const pr = pop(t, m.t.escribe - 0.2, 0.25);
  return (
    <Caja r={VENTANA} t={t} radio={34} fondo="#0C0C0C">
      <BarraVentana w={VENTANA.w - 6} titulo={img.titulo} />
      <div style={{
        position: "absolute", left: PROMPT.x - VENTANA.x, top: PROMPT.y - VENTANA.y, width: PROMPT.w, height: PROMPT.h, borderRadius: 22,
        border: `3px solid ${t >= m.t.escribe ? E.acento : E.borde}`, boxSizing: "border-box", padding: "30px 34px", opacity: pr.opacity,
        background: "#141414", display: "flex", gap: 22,
      }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 50, color: E.acento, lineHeight: 1.25 }}>{">"}</div>
        <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 50, lineHeight: 1.25, color: E.texto, letterSpacing: -0.5 }}>
          {img.prompt.texto.slice(0, n)}
          <CursorTexto t={t} alto={56} />
        </div>
      </div>
      <div style={{
        position: "absolute", left: SALIDA.x - VENTANA.x, top: SALIDA.y - VENTANA.y, width: SALIDA.w, height: SALIDA.h, borderRadius: 20,
        border: `2px dashed ${E.borde}`, boxSizing: "border-box",
      }} />
    </Caja>
  );
};
