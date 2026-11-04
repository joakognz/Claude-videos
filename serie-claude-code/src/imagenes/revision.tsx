/** Revisión: un escáner pasa por las líneas de código (abstractas), marca una y, al corregirla, se reescribe en naranja claro. */
import React from "react";
import { useEstilo } from "../componentes/estilo";
import type { Ctx } from "../plan";
import { MONO, pop, ramp, rand } from "../tema";
import type { Ancla, Medida, Rect } from "../tipos";
import { BarraVentana, Caja, Tick, crecer } from "./piezas";

type Img = { tipo: "revision"; titulo?: string; portal?: string; lineas?: number; revisa?: Ancla; linea?: number; corrige?: Ancla };

const VENTANA = { x: 55, y: 640, w: 970, h: 850 };
const ALTO = 70;
const Y0 = VENTANA.y + 200;
const fila = (i: number): Rect => ({ x: VENTANA.x + 30, y: Y0 + i * ALTO, w: VENTANA.w - 60, h: ALTO - 8 });

export const medirRevision = (img: Img, ctx: Ctx): Medida => {
  const n = img.lineas ?? 9;
  const k = Math.min(n - 1, Math.max(0, (img.linea ?? 5) - 1));
  const tRev = ctx.at(img.revisa, ctx.inicio + 0.4);
  const paso = Math.min(0.11, 1.0 / n);
  const tMarca = tRev + k * paso;
  const tCorr = Math.max(tMarca + 0.4, ctx.at(img.corrige, tMarca + 0.8));
  const codigo = { x: VENTANA.x + 20, y: Y0 - 10, w: VENTANA.w - 40, h: n * ALTO + 10 };
  const corregida = fila(k);
  const check = { x: corregida.x + 6, y: corregida.y + 4, w: 54, h: 54 };
  return {
    elementos: { ventana: VENTANA, codigo, corregida, escaner: corregida, check },
    focos: [{ t: tRev, rect: codigo }, { t: tCorr - 0.1, rect: crecer(corregida, 110) }],
    portal: { ...check, radio: 27, vista: false },
    t: { rev: tRev, paso, marca: tMarca, corr: tCorr, k, n },
    eventos: [{ t: tMarca, sfx: "pop", vol: 0.35 }],
  };
};

export const VistaRevision: React.FC<{ img: Img; m: Medida; t: number }> = ({ img, m, t }) => {
  const E = useEstilo();
  const { n, k, rev, paso, corr } = m.t;
  const fin = rev + n * paso;
  const yEsc = t < rev ? -1 : t < fin ? Math.min(n - 1, Math.floor((t - rev) / paso)) : -1;
  return (
    <Caja r={VENTANA} t={t} radio={34} fondo="#0C0C0C">
      <BarraVentana w={VENTANA.w - 6} titulo={img.titulo} />
      {Array.from({ length: n }, (_, i) => {
        const r = fila(i);
        const lx = r.x - VENTANA.x, ly = r.y - VENTANA.y;
        const marcada = i === k && t >= m.t.marca;
        const corregida = i === k && t >= corr;
        const reesc = i === k ? ramp(t, corr, corr + 0.35) : 1;
        const sangria = [0, 1, 1, 2, 2, 1, 2, 1, 0][i % 9];
        const w = 0.4 + rand(i * 13 + 2) * 0.45;
        const visto = t >= rev + i * paso + paso;
        return (
          <div key={i} style={{ position: "absolute", left: lx, top: ly, width: r.w, height: r.h }}>
            {marcada && (
              <div style={{ position: "absolute", inset: -4, borderRadius: 14, border: `3px solid ${corregida ? E.acentoSuave : E.acento}`, background: corregida ? "rgba(255,176,102,0.10)" : "rgba(255,107,26,0.14)" }} />
            )}
            <div style={{ position: "absolute", left: 80, top: 16, fontFamily: MONO, fontSize: 30, color: "#555" }}>{i + 1}</div>
            <div style={{
              position: "absolute", left: 150 + sangria * 50, top: 21, height: 24, width: (r.w - 200 - sangria * 50) * w * (i === k && t >= corr ? reesc : 1),
              borderRadius: 12, background: corregida ? E.acentoSuave : marcada ? E.acento : "#474747",
            }} />
            {/* el ✓ de cada línea revisada (la marcada lleva «!» hasta que se corrige) */}
            {visto && i !== k && <Tick x={8} y={6} d={50} t={t} at={rev + i * paso + paso} fondo="#2E2E2E" color={E.texto} />}
            {i === k && marcada && !corregida && (
              <div style={{ position: "absolute", left: 8, top: 6, width: 50, height: 50, borderRadius: 25, background: E.acento, color: E.oscuro, fontFamily: MONO, fontWeight: 700, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", scale: String(pop(t, m.t.marca).scale) }}>!</div>
            )}
            {corregida && <Tick x={6} y={4} d={54} t={t} at={corr} />}
          </div>
        );
      })}
      {yEsc >= 0 && (
        <div style={{ position: "absolute", left: 16, right: 16, top: fila(yEsc).y - VENTANA.y - 6, height: ALTO, borderRadius: 14, background: "rgba(255,107,26,0.16)", borderTop: `3px solid ${E.acento}`, boxShadow: `0 0 40px ${E.acento}55` }} />
      )}
    </Caja>
  );
};
