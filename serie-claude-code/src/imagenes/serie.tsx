/** Intro (regla 10): la serie entera como una rejilla de episodios; se enciende el de hoy y la cámara entra en él. */
import React from "react";
import { useEstilo } from "../componentes/estilo";
import type { Ctx } from "../plan";
import { MONO, TITULO, pop, ramp } from "../tema";
import type { Episodio, Medida } from "../tipos";
import { Antetitulo, Etiqueta, crecer, pos } from "./piezas";

type Img = { tipo: "serie" };

const rejilla = (total: number) => {
  const cols = 10;
  const filas = Math.ceil(total / cols);
  const gap = 10;
  const w = Math.min(68, (900 - (cols - 1) * gap) / cols);
  const h = Math.min(w * 1.78, (600 - (filas - 1) * gap) / filas);
  const x0 = (1080 - (cols * w + (cols - 1) * gap)) / 2;
  const y0 = 900;
  const celda = (i: number) => ({ x: x0 + (i % cols) * (w + gap), y: y0 + Math.floor(i / cols) * (h + gap), w, h });
  return { cols, filas, w, h, x0, y0, gap, celda, rect: { x: x0, y: y0, w: cols * w + (cols - 1) * gap, h: filas * h + (filas - 1) * gap } };
};

export const medirSerie = (_img: Img, ctx: Ctx): Medida => {
  const { ep } = ctx;
  const R = rejilla(ep.total_episodios);
  const tile = R.celda(ep.episodio - 1);
  const tSerie = ctx.inicio - 1; // la serie se anuncia desde el fotograma 0 (también es la miniatura)
  const tEp = ctx.at("episodio", ctx.inicio + 1.6);
  const titulo = { x: 60, y: 640, w: 960, h: 230 };
  return {
    elementos: { titulo, rejilla: R.rect, episodio: tile },
    focos: [{ t: tEp, rect: crecer(tile, 150) }],
    portal: { x: tile.x + 5, y: tile.y + 5, w: tile.w - 10, h: tile.h - 10, radio: 8, vista: false },
    t: { serie: tSerie, ep: tEp },
    eventos: [{ t: tEp, sfx: "pop", vol: 0.45 }],
  };
};

export const VistaSerie: React.FC<{ img: Img; m: Medida; t: number; ep: Episodio }> = ({ m, t, ep }) => {
  const E = useEstilo();
  const R = rejilla(ep.total_episodios);
  const tit = pop(t, m.t.serie, 0.35);
  const enc = ramp(t, m.t.ep, m.t.ep + 0.25);
  return (
    <>
      <div style={{ ...pos(m.elementos.titulo), textAlign: "center", opacity: tit.opacity, translate: `0px ${(1 - tit.p) * 30}px` }}>
        <Antetitulo texto="Serie" size={34} style={{ letterSpacing: 14 }} />
        <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 132, lineHeight: 1.05, letterSpacing: -4, color: E.texto, marginTop: 10 }}>{ep.serie}</div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 32, color: E.gris, letterSpacing: 6, marginTop: 14 }}>{ep.total_episodios} EPISODIOS</div>
      </div>
      {Array.from({ length: ep.total_episodios }, (_, i) => {
        const c = R.celda(i);
        const a = pop(t, (i % R.cols) * 0.025 + Math.floor(i / R.cols) * 0.06, 0.3);
        const hoy = i === ep.episodio - 1;
        return (
          <div key={i} style={{
            ...pos(c), borderRadius: 10, boxSizing: "border-box", opacity: a.opacity, scale: String(a.scale * (hoy ? 1 + 0.12 * Math.sin(Math.min(1, enc) * Math.PI) : 1)),
            border: `2px solid ${hoy && enc > 0 ? E.acento : E.borde}`, background: hoy ? `rgba(255,107,26,${0.18 * enc})` : E.panel,
            boxShadow: hoy && enc > 0 ? `0 0 ${40 * enc}px ${E.acento}aa` : "none",
            display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 6,
            fontFamily: MONO, fontWeight: 700, fontSize: 20, color: hoy && enc > 0 ? E.acentoSuave : "#5A5A5A",
          }}>{i + 1}</div>
        );
      })}
      <Etiqueta obj={m.elementos.episodio} texto={`EPISODIO ${ep.episodio} DE ${ep.total_episodios}`} lado="abajo" t={t} at={m.t.ep + 0.1} />
    </>
  );
};
