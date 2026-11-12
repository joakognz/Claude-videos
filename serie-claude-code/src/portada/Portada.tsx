/**
 * Portada del reel (1080x1920, imagen fija) a partir del JSON del episodio ("portada"). Todo lo importante va dentro del
 * recorte 3:4 central (y 240–1680), que es lo que enseña la cuadrícula del perfil de Instagram.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Moneda } from "../master/componentes/Iconos";
import { Rejilla } from "../master/componentes/Rejilla";
import { C, MONO, TITULO, UI } from "../master/nucleo";
import type { EpisodioMaster } from "../master/tipos";

export const Portada: React.FC<EpisodioMaster> = (ep) => {
  const p = ep.portada ?? { titulo: [ep.titulo ?? ""], subtitulo: "", chips: [] };
  const COIN = { x: 540, y: 790, s: 400 };
  const completo = !ep.parte || ep.parte.n === ep.parte.de;
  return (
    <AbsoluteFill style={{ background: C.fondo, overflow: "hidden" }}>
      {/* trama de puntos y luz detrás del icono */}
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.borde} 2.2px, transparent 2.6px)`, backgroundSize: "54px 54px", opacity: 0.5 }} />
      <div style={{ position: "absolute", left: COIN.x - 620, top: COIN.y - 620, width: 1240, height: 1240, borderRadius: "50%", background: `radial-gradient(circle, ${C.acento}55 0%, ${C.acento}18 35%, transparent 65%)` }} />
      {[0, 1, 2].map((k) => {
        const r = COIN.s * 0.62 + k * 74;
        return <div key={k} style={{ position: "absolute", left: COIN.x - r, top: COIN.y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `3px solid ${C.acento}`, opacity: 0.4 - k * 0.12 }} />;
      })}

      {/* serie */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 268, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <Img src={staticFile(ep.logos.claude)} style={{ width: 62 }} />
        <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, letterSpacing: 2, color: C.texto, whiteSpace: "nowrap" }}>
          <span style={{ color: C.acento }}>MÁSTER DE</span> CLAUDE CODE
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 362, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 30px 12px 22px", borderRadius: 999, background: "rgba(20,24,33,0.95)", border: `3px solid ${C.acento}` }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: C.acento, boxShadow: `0 0 14px ${C.acento}` }} />
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.texto, letterSpacing: 1 }}>
            EP.{ep.episodio}
            <span style={{ color: C.gris }}>{ep.parte ? ` · PARTE ${ep.parte.n}/${ep.parte.de}` : `/${ep.total}`}</span>
          </span>
        </div>
      </div>

      {/* icono: moneda grande y dos más pequeñas girando */}
      <div style={{ position: "absolute", left: 170 - 75, top: COIN.y + 40 - 75, transform: "rotate(-14deg)", opacity: 0.85, filter: `drop-shadow(0 10px 24px rgba(0,0,0,0.6))` }}>
        <Moneda s={150} giro={1.05} />
      </div>
      <div style={{ position: "absolute", left: 915 - 60, top: COIN.y - 170 - 60, transform: "rotate(12deg)", opacity: 0.8, filter: `drop-shadow(0 10px 24px rgba(0,0,0,0.6))` }}>
        <Moneda s={120} giro={0.75} />
      </div>
      <div style={{ position: "absolute", left: COIN.x - COIN.s / 2, top: COIN.y - COIN.s / 2, width: COIN.s, height: COIN.s, filter: `drop-shadow(0 0 50px ${C.acento}99) drop-shadow(0 30px 40px rgba(0,0,0,0.6))` }}>
        <Moneda s={COIN.s} giro={0} />
      </div>

      {/* título */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 168, lineHeight: 0.98, letterSpacing: -3, color: C.texto, textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
        {p.titulo.map((ln, i) => (
          <div key={i} style={{ color: i === p.titulo.length - 1 ? C.acento : C.texto, whiteSpace: "nowrap" }}>{ln}</div>
        ))}
      </div>
      {p.subtitulo && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1060 + p.titulo.length * 165 + 24, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 62, color: C.texto, whiteSpace: "nowrap" }}>{p.subtitulo}</div>
      )}
      {/* chips */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060 + p.titulo.length * 165 + 124, display: "flex", justifyContent: "center", gap: 16 }}>
        {(p.chips ?? []).map((c, i) => (
          <div key={i} style={{ padding: "13px 28px", borderRadius: 999, background: i === 0 ? C.acento : "rgba(20,24,33,0.95)", border: `3px solid ${C.acento}`, fontFamily: UI, fontWeight: 700, fontSize: 34, letterSpacing: 1.2, color: i === 0 ? C.oscuro : C.texto, whiteSpace: "nowrap" }}>{c}</div>
        ))}
      </div>

      {/* rejilla de la serie y usuario (fuera del recorte del perfil) */}
      <Rejilla g={{ cx: 540, cy: 1748, celda: 26, hueco: 7, cols: 25, filas: 2 }} total={ep.total} estado={(n) => ({ opacity: 1, escala: 1, encendida: n < ep.episodio || (completo && n === ep.episodio) ? 1 : n === ep.episodio ? 0.6 : 0, latido: 0, contorno: 0, check: 0 })} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1808, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 32, color: C.gris, letterSpacing: 0.5 }}>{ep.handle}</div>
    </AbsoluteFill>
  );
};
