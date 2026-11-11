/**
 * Intro (idéntica en toda la serie): rejilla de 50 casillas en ola → se enciende el episodio de hoy → la rejilla se
 * deshace en partículas que forman el título (logo de Claude a la izquierda, Claude Code a la derecha y debajo el
 * nombre de la serie).
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Logo } from "../componentes/Logo";
import { GEO_REJILLA, Rejilla, olaEntrada, posCasilla } from "../componentes/Rejilla";
import { Bandera, Moneda } from "../componentes/Iconos";
import { Etiqueta } from "../componentes/Sello";
import { C, EASE, EASE_OUT, TITULO, UI, clamp01, rand, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

const G = GEO_REJILLA;
/** Disposición del título (centro del lienzo). */
const TIT = {
  claude: { x: 175, y: 1000, w: 190 },
  texto: { x: 540, y: 1000, w: 470 },
  mascota: { x: 905, y: 1000, w: 200 },
  serie: { x: 540, y: 1230 },
};

const tiempos = (L: Linea, ep: EpisodioMaster) => {
  const id = ep.escenas[0].id;
  const enciende = L.en(id, String(ep.episodio));
  const titulo = L.en(id, ep.serie.split(" ")[0]);
  const deshace = Math.max(enciende + 0.65, titulo - 0.55);
  return { enciende, titulo, deshace };
};

/** Partículas: 4 por casilla, cada una con un destino dentro del título. */
const PARTICULAS = (() => {
  const zonas = [
    { x: TIT.claude.x, y: TIT.claude.y, w: 170, h: 170, peso: 1 },
    { x: TIT.texto.x, y: TIT.texto.y, w: 460, h: 240, peso: 2.4 },
    { x: TIT.mascota.x, y: TIT.mascota.y, w: 190, h: 120, peso: 0.9 },
    { x: TIT.serie.x, y: TIT.serie.y, w: 820, h: 60, peso: 1.6 },
  ];
  const tot = zonas.reduce((a, z) => a + z.peso, 0);
  const out: { n: number; dx: number; dy: number; tx: number; ty: number; cx: number; cy: number; retraso: number; size: number }[] = [];
  for (let n = 1; n <= 50; n++) {
    for (let k = 0; k < 4; k++) {
      const seed = n * 7 + k * 13;
      let r = rand(seed) * tot;
      const z = zonas.find((zz) => (r -= zz.peso) < 0) ?? zonas[0];
      const tx = z.x + (rand(seed + 1) - 0.5) * z.w;
      const ty = z.y + (rand(seed + 2) - 0.5) * z.h;
      const dx = (k % 2 === 0 ? -1 : 1) * G.celda * 0.22;
      const dy = (k < 2 ? -1 : 1) * G.celda * 0.22;
      const ang = rand(seed + 3) * Math.PI * 2;
      out.push({ n, dx, dy, tx, ty, cx: Math.cos(ang) * 260, cy: Math.sin(ang) * 260 - 120, retraso: rand(seed + 4) * 0.26, size: 18 + rand(seed + 5) * 14 });
    }
  }
  return out;
})();

export const Intro: React.FC<BloqueProps> = ({ t, ep, L }) => {
  const { enciende, titulo, deshace } = tiempos(L, ep);
  const actual = posCasilla(G, ep.episodio);
  const tomas: Toma[] = [
    { t: -1, x: 540, y: 1060, z: 0.94 },
    { t: enciende - 0.25, x: 540 + (actual.x - 540) * 0.12, y: 1060 + (actual.y - 1060) * 0.3, z: 1.07, d: 0.8 },
    { t: deshace - 0.05, x: 540, y: 1090, z: 1.02, d: 0.9 },
  ];
  const iconos = ep.intro?.iconos ?? [];
  const hoy = ep.escenas[1]?.id;
  if (iconos.length && hoy) tomas.push({ t: L.ini(hoy) - 0.3, x: 540, y: 1290, z: 0.93, d: 1.1 });
  const DUR = 0.62;
  return (
    <Escena t={t} tomas={tomas}>
      <Rejilla
        total={ep.total}
        estado={(n) => {
          const o = olaEntrada(t, 0.0, G, n);
          const fuera = clamp01((t - (deshace + (n % 10) * 0.012)) / 0.12);
          const previo = n < ep.episodio ? clamp01(o.s) : 0;
          const hoy = n === ep.episodio ? sp(t, enciende, { damping: 9, stiffness: 200 }) : 0;
          const late = n === ep.episodio && t > enciende ? Math.max(0, Math.sin((t - enciende) * 7.5)) * 0.1 * Math.exp(-(t - enciende) * 0.6) + (1 - Math.min(1, hoy)) * 0 : 0;
          const golpe = n === ep.episodio ? Math.sin(Math.min(1, hoy) * Math.PI) * 0.35 : 0;
          return { opacity: o.opacity * (1 - fuera), escala: 0.4 + 0.6 * o.s, encendida: Math.max(previo, Math.min(1, hoy)), latido: late + golpe, contorno: 0, check: 0 };
        }}
      />
      <Etiqueta texto={`EPISODIO ${ep.episodio} DE ${ep.total}`} x={540} y={G.cy + 300} t={t} at={enciende + 0.05} out={deshace + 0.1} size={34} variante="gris" />
      {/* partículas */}
      {t > deshace &&
        PARTICULAS.map((p, i) => {
          const c = posCasilla(G, p.n);
          const t0 = deshace + p.retraso + (p.n % 10) * 0.012;
          const u = (t - t0) / DUR;
          if (u <= 0 || u >= 1.3) return null;
          const e = EASE(Math.min(1, u));
          const ax = c.x + p.dx;
          const ay = c.y + p.dy;
          const mx = (ax + p.tx) / 2 + p.cx;
          const my = (ay + p.ty) / 2 + p.cy;
          const x = (1 - e) ** 2 * ax + 2 * (1 - e) * e * mx + e * e * p.tx;
          const y = (1 - e) ** 2 * ay + 2 * (1 - e) * e * my + e * e * p.ty;
          const desv = clamp01((u - 0.9) / 0.4);
          const sz = p.size * (1 - 0.55 * e);
          const encendida = p.n <= ep.episodio;
          return (
            <div key={i} style={{ position: "absolute", left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, borderRadius: sz * 0.25, background: encendida || e > 0.5 ? C.acento : C.tenue, opacity: 1 - desv, transform: `rotate(${(1 - e) * 140 * (i % 2 ? 1 : -1)}deg)`, boxShadow: `0 0 12px ${C.acento}88` }} />
          );
        })}
      {/* título */}
      <Logo src={ep.logos.claude} x={TIT.claude.x} y={TIT.claude.y} w={TIT.claude.w} t={t} at={titulo - 0.05} rot={(t - titulo) * 12} sombra={false} />
      <TextoPixel src={ep.logos.claude_code_texto} t={t} at={titulo + 0.05} />
      <Logo src={ep.logos.claude_code} x={TIT.mascota.x} y={TIT.mascota.y} w={TIT.mascota.w} t={t} at={titulo + 0.14} sombra={false} />
      <Serie texto={ep.serie} t={t} at={titulo + 0.2} />
      {ep.parte && <Etiqueta texto={`PARTE ${ep.parte.n} DE ${ep.parte.de}`} x={TIT.serie.x} y={TIT.serie.y + 96} t={t} at={titulo + 0.55} size={38} variante="borde" />}
      {/* lo que trae el episodio: un icono por cosa, cuando la voz la nombra */}
      {iconos.map((ic, i) => (
        <IconoIntro key={i} ic={ic} x={540 + (i - (iconos.length - 1) / 2) * 310} y={1600} t={t} at={L.en(hoy!, ic.en) - 0.05} />
      ))}
    </Escena>
  );
};

/** Icono de la intro: baldosa con el pictograma y su rótulo. Los «pequeños» (lo que viene en otra parte) van atenuados. */
const IconoIntro: React.FC<{ ic: { icono: string; texto: string; pequeno?: boolean }; x: number; y: number; t: number; at: number }> = ({ ic, x, y, t, at }) => {
  const v = vis(t, at, Infinity, 0.3);
  if (!v.on) return null;
  const k = ic.pequeno ? 0.72 : 1;
  const L = 230 * k;
  const brillo = Math.sin(clamp01((t - at) / 0.5) * Math.PI);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: v.opacity * (ic.pequeno ? 0.7 : 1) }}>
      <div style={{ position: "absolute", left: -L / 2, top: -L / 2, width: L, height: L, borderRadius: 46 * k, background: `linear-gradient(160deg, ${C.panel2}, ${C.panel})`, border: `3px solid ${ic.pequeno ? C.borde : C.acento}`, boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 ${40 * brillo}px ${C.acento}88`, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${v.y}px) scale(${v.scale}) rotate(${(1 - v.s) * -10}deg)` }}>
        {ic.icono === "meta" ? <Bandera s={150 * k} t={t} /> : ic.icono === "moneda" ? <Moneda s={150 * k} giro={4 * Math.PI * (1 - Math.exp(-Math.max(0, t - at) * 1.6))} /> : <Escalones s={150 * k} t={t} at={at} />}
      </div>
      <div style={{ position: "absolute", left: 0, top: L / 2 + 44, transform: `translate(-50%, -50%) translateY(${v.y}px)`, whiteSpace: "nowrap", fontFamily: UI, fontWeight: 700, fontSize: 34 * (ic.pequeno ? 0.85 : 1), letterSpacing: 1.5, color: ic.pequeno ? C.gris : C.texto, opacity: clamp01((t - at - 0.15) / 0.25) }}>
        {ic.texto}
      </div>
    </div>
  );
};

/** Cuatro escalones que se levantan uno a uno. */
const Escalones: React.FC<{ s: number; t: number; at: number }> = ({ s, t, at }) => (
  <svg width={s} height={s} viewBox="0 0 48 48">
    {[0, 1, 2, 3].map((k) => {
      const e = sp(t, at + 0.08 + k * 0.1, { damping: 12, stiffness: 200 });
      const h = (k + 1) * 9 * e;
      return <rect key={k} x={4 + k * 10.5} y={44 - h} width={9} height={h} rx={1.8} fill={k === 0 ? C.acento : "none"} stroke={C.acento} strokeWidth={2.4} />;
    })}
  </svg>
);

/** El rótulo pixelado de Claude Code se monta por franjas, como si lo compusieran las partículas. */
const TextoPixel: React.FC<{ src: string; t: number; at: number }> = ({ src, t, at }) => {
  const v = vis(t, at, Infinity, 0.85);
  if (!v.on) return null;
  const barrido = ramp(t, at, at + 0.45, EASE_OUT);
  return (
    <div style={{ position: "absolute", left: TIT.texto.x, top: TIT.texto.y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, opacity: v.opacity, clipPath: `inset(0 ${(1 - barrido) * 100}% 0 0)` }}>
        <Img src={staticFile(src)} style={{ width: TIT.texto.w, display: "block" }} />
      </div>
    </div>
  );
};

/** Nombre de la serie debajo: letra a letra con spring. */
const Serie: React.FC<{ texto: string; t: number; at: number }> = ({ texto, t, at }) => (
  <div style={{ position: "absolute", left: TIT.serie.x, top: TIT.serie.y, width: 0, height: 0 }}>
    <div style={{ position: "absolute", transform: "translate(-50%, -50%)", whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 800, fontSize: 58, letterSpacing: 3, color: C.texto }}>
      {texto.toUpperCase().split("").map((ch, i) => {
        const s = sp(t, at + i * 0.018, { damping: 14, stiffness: 220 });
        return (
          <span key={i} style={{ display: "inline-block", opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 30}px)`, color: i < texto.indexOf("Claude") ? C.acento : C.texto, whiteSpace: "pre" }}>
            {ch}
          </span>
        );
      })}
    </div>
  </div>
);

export const eventosIntro = (L: Linea, ep: EpisodioMaster): Evento[] => {
  const { enciende, titulo, deshace } = tiempos(L, ep);
  return [
    { t: 0.05, sfx: "whoosh", vol: 0.25 },
    { t: enciende, sfx: "tick", vol: 0.55 },
    { t: deshace, sfx: "whoosh", vol: 0.4 },
    { t: titulo + 0.05, sfx: "golpe", vol: 0.45 },
    ...(ep.parte ? [{ t: titulo + 0.55, sfx: "pop" as const, vol: 0.35 }] : []),
    ...(ep.intro?.iconos ?? []).map((ic) => ({ t: L.en(ep.escenas[1].id, ic.en) - 0.05, sfx: "pop" as const, vol: 0.4 })),
  ];
};
